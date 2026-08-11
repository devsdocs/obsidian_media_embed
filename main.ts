import { Plugin, PluginSettingTab, Setting, App, Editor } from 'obsidian';

interface MediaEmbedSettings {
	embedHeight: string;
}

const DEFAULT_SETTINGS: MediaEmbedSettings = {
	embedHeight: '352',
};

// --- Spotify ---

const SPOTIFY_TYPES = ['track', 'album', 'playlist', 'artist', 'episode', 'show'];

function extractSpotifyInfo(url: string): { type: string; id: string } | null {
	try {
		const parsed = new URL(url.includes('://') ? url : `https://${url}`);
		if (parsed.hostname.toLowerCase() !== 'open.spotify.com') return null;

		const pathParts = parsed.pathname.split('/').filter(p => p.length > 0);
		if (pathParts.length < 2) return null;

		let i = 0;
		while (i < pathParts.length - 1) {
			const part = pathParts[i];
			if (part === 'embed' || part?.startsWith('intl-')) {
				i++;
			} else {
				break;
			}
		}

		const type = pathParts[i];
		const id = pathParts[i + 1];
		if (type && id && SPOTIFY_TYPES.includes(type)) {
			return { type, id };
		}
		return null;
	} catch {
		return null;
	}
}

// --- YouTube ---

function extractYoutubeId(url: string): string | null {
	try {
		const parsed = new URL(url.includes('://') ? url : `https://${url}`);
		const hostname = parsed.hostname.toLowerCase();

		if (!/(?:^|\.)youtube\.com$|(?:^|\.)youtu\.be$/.test(hostname)) return null;

		if (/youtu\.be$/.test(hostname)) {
			return normalizeYoutubeId(parsed.pathname.slice(1).split(/[/?#]/)[0] ?? '');
		}

		const path = parsed.pathname;
		if (path.startsWith('/shorts/')) return normalizeYoutubeId(path.split('/')[2] ?? '');
		if (path.startsWith('/embed/')) return normalizeYoutubeId(path.split('/')[2] ?? '');
		if (path.startsWith('/live/')) return normalizeYoutubeId(path.split('/')[2] ?? '');
		if (path === '/watch' || path === '/watch/') return normalizeYoutubeId(parsed.searchParams.get('v') ?? '');

		return null;
	} catch {
		return null;
	}
}

function normalizeYoutubeId(value: string): string | null {
	const id = value.trim();
	return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
}

function extractYoutubeStartTime(url: string): number | null {
	const match = url.match(/[?&#](?:t|start)=([^&#]+)/i);
	if (!match?.[1]) return null;

	const val = match[1].trim().toLowerCase();
	if (/^\d+$/.test(val)) return Number.parseInt(val, 10);

	const hms = val.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
	if (!hms) return null;

	const total = (Number.parseInt(hms[1] ?? '0', 10) * 3600) +
		(Number.parseInt(hms[2] ?? '0', 10) * 60) +
		Number.parseInt(hms[3] ?? '0', 10);
	return total > 0 ? total : null;
}

// --- Shared ---

interface MediaInfo {
	platform: 'spotify' | 'youtube';
	url: string;
}

function detectMedia(text: string): MediaInfo | null {
	const trimmed = text.trim();
	if (trimmed === '' || /\s/.test(trimmed)) return null;

	if (extractSpotifyInfo(trimmed)) return { platform: 'spotify', url: trimmed };
	if (extractYoutubeId(trimmed)) return { platform: 'youtube', url: trimmed };

	return null;
}

function createSpotifyIframe(container: HTMLElement, url: string, height: string): HTMLIFrameElement | null {
	const info = extractSpotifyInfo(url);
	if (!info) return null;

	return container.createEl('iframe', {
		cls: 'media-embed-spotify',
		attr: {
			src: `https://open.spotify.com/embed/${info.type}/${info.id}`,
			height,
			allowfullscreen: '',
			allow: 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture',
			loading: 'lazy',
		},
	});
}

function createYoutubeIframe(container: HTMLElement, url: string): HTMLIFrameElement | null {
	const videoId = extractYoutubeId(url);
	if (!videoId) return null;

	const startTime = extractYoutubeStartTime(url);
	let src = `https://www.youtube.com/embed/${videoId}`;
	if (startTime !== null && startTime >= 0) {
		src += `?start=${startTime}`;
	}

	return container.createEl('iframe', {
		cls: 'media-embed-youtube',
		attr: {
			src,
			allowfullscreen: '',
			allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
			loading: 'lazy',
		},
	});
}

export default class MediaEmbedPlugin extends Plugin {
	settings!: MediaEmbedSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new MediaEmbedSettingTab(this.app, this));

		// On paste: wrap media URLs in an ```embed code block
		this.registerEvent(
			this.app.workspace.on('editor-paste', (evt: ClipboardEvent, editor: Editor) => {
				if (evt.defaultPrevented) return;

				const line = editor.getCursor().line;
				const lineText = editor.getLine(line).trim();
				if (lineText !== '') return;

				const pastedTextRaw = evt.clipboardData?.getData('text/plain') ?? '';
				const media = detectMedia(pastedTextRaw);
				if (!media) return;

				evt.preventDefault();

				const codeBlock = `\`\`\`embed\n${media.url}\n\`\`\``;
				editor.replaceRange(codeBlock, { line, ch: 0 }, { line, ch: lineText.length });
				editor.setCursor({ line: line + 2, ch: 3 });
			})
		);

		// Code block processor: render ```embed blocks as iframes
		this.registerMarkdownCodeBlockProcessor('embed', (source, el) => {
			const url = source.trim();
			const media = detectMedia(url);
			if (!media) {
				el.createEl('p', { text: `Unsupported media URL: ${url}` });
				return;
			}

			const height = this.settings.embedHeight || '352';

			switch (media.platform) {
				case 'spotify':
					createSpotifyIframe(el, url, height);
					break;
				case 'youtube':
					createYoutubeIframe(el, url);
					break;
			}
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as Partial<MediaEmbedSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// ponytail: getSettingDefinitions() not in obsidian types yet; adopt when types ship, then bump minAppVersion to 1.13.0
// eslint-disable-next-line obsidianmd/settings-tab/prefer-setting-definitions
class MediaEmbedSettingTab extends PluginSettingTab {
	plugin: MediaEmbedPlugin;

	constructor(app: App, plugin: MediaEmbedPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Embed height')
			.setDesc('Height of the spotify embed in pixels (e.g., 352 for normal player, 152 for compact player). YouTube uses a 16:9 aspect ratio instead.')
			.addText(text => text
				.setPlaceholder('352')
				.setValue(this.plugin.settings.embedHeight)
				.onChange(async (value) => {
					this.plugin.settings.embedHeight = value;
					await this.plugin.saveSettings();
				}));
	}
}
