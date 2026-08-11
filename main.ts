import { Plugin, PluginSettingTab, Setting, App, Editor, MarkdownPostProcessorContext } from 'obsidian';

interface SpotifyEmbedSettings {
	embedHeight: string;
}

const DEFAULT_SETTINGS: SpotifyEmbedSettings = {
	embedHeight: '352',
};

const VALID_TYPES = ['track', 'album', 'playlist', 'artist', 'episode', 'show'];

function extractSpotifyInfo(url: string): { type: string; id: string } | null {
	try {
		const parsed = new URL(url.includes('://') ? url : `https://${url}`);
		if (parsed.hostname.toLowerCase() !== 'open.spotify.com') return null;

		const pathParts = parsed.pathname.split('/').filter(p => p.length > 0);
		if (pathParts.length < 2) return null;

		// Skip known prefixes: /embed/... and /intl-en/...
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
		if (type && id && VALID_TYPES.includes(type)) {
			return { type, id };
		}
		return null;
	} catch {
		return null;
	}
}

function isSpotifyUrl(text: string): boolean {
	const trimmed = text.trim();
	if (trimmed === '' || /\s/.test(trimmed)) return false;
	return extractSpotifyInfo(trimmed) !== null;
}

export default class SpotifyEmbedPlugin extends Plugin {
	settings!: SpotifyEmbedSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SpotifyEmbedSettingTab(this.app, this));

		// On paste: insert a clean Spotify URL on empty lines
		this.registerEvent(
			this.app.workspace.on('editor-paste', (evt: ClipboardEvent, editor: Editor) => {
				if (evt.defaultPrevented) return;

				const line = editor.getCursor().line;
				const lineText = editor.getLine(line).trim();
				if (lineText !== '') return;

				const pastedTextRaw = evt.clipboardData?.getData('text/plain') ?? '';
				if (!isSpotifyUrl(pastedTextRaw)) return;

				const info = extractSpotifyInfo(pastedTextRaw.trim());
				if (!info) return;

				evt.preventDefault();

				// Insert a canonical Spotify URL — the post-processor renders it
				const canonicalUrl = `https://open.spotify.com/${info.type}/${info.id}`;
				editor.replaceRange(canonicalUrl, { line, ch: 0 }, { line, ch: lineText.length });
				editor.setCursor({ line, ch: canonicalUrl.length });
			})
		);

		// Post-processor: render Spotify URLs as iframes in Reading / Live Preview
		this.registerMarkdownPostProcessor((el: HTMLElement, _ctx: MarkdownPostProcessorContext) => {
			// Find <a> elements linking to Spotify
			const anchors = el.querySelectorAll('a[href*="open.spotify.com"]');
			for (const anchor of Array.from(anchors)) {
				const href = anchor.getAttribute('href');
				if (!href) continue;

				const info = extractSpotifyInfo(href);
				if (!info) continue;

				// Only auto-embed if the link is the sole content of its paragraph
				const parent = anchor.parentElement;
				if (!parent || parent.tagName !== 'P') continue;
				if (parent.childNodes.length !== 1) continue;

				const height = this.settings.embedHeight || '352';
				const embedSrc = `https://open.spotify.com/embed/${info.type}/${info.id}`;

				const iframe = document.createElement('iframe');
				iframe.src = embedSrc;
				iframe.width = '100%';
				iframe.height = height;
				iframe.style.borderRadius = '12px';
				iframe.style.border = 'none';
				iframe.setAttribute('allowfullscreen', '');
				iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
				iframe.setAttribute('loading', 'lazy');

				parent.replaceWith(iframe);
			}
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as Partial<SpotifyEmbedSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SpotifyEmbedSettingTab extends PluginSettingTab {
	plugin: SpotifyEmbedPlugin;

	constructor(app: App, plugin: SpotifyEmbedPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Embed height')
			.setDesc('Height of the embed in pixels (e.g., 352 for normal player, 152 for compact player)')
			.addText(text => text
				.setPlaceholder('352')
				.setValue(this.plugin.settings.embedHeight)
				.onChange(async (value) => {
					this.plugin.settings.embedHeight = value;
					await this.plugin.saveSettings();
				}));
	}
}
