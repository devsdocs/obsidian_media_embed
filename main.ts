import { Plugin, PluginSettingTab, Setting, App, Editor } from 'obsidian';

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

function createSpotifyIframe(info: { type: string; id: string }, height: string): HTMLIFrameElement {
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
	return iframe;
}

export default class SpotifyEmbedPlugin extends Plugin {
	settings!: SpotifyEmbedSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SpotifyEmbedSettingTab(this.app, this));

		// On paste: wrap Spotify URLs in a ```spotify code block
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

				const canonicalUrl = `https://open.spotify.com/${info.type}/${info.id}`;
				const codeBlock = `\`\`\`spotify\n${canonicalUrl}\n\`\`\``;
				editor.replaceRange(codeBlock, { line, ch: 0 }, { line, ch: lineText.length });
				editor.setCursor({ line: line + 2, ch: 3 });
			})
		);

		// Code block processor: render ```spotify blocks as iframes
		this.registerMarkdownCodeBlockProcessor('spotify', (source, el) => {
			const url = source.trim();
			const info = extractSpotifyInfo(url);
			if (!info) {
				el.createEl('p', { text: `Invalid Spotify URL: ${url}` });
				return;
			}

			const height = this.settings.embedHeight || '352';
			el.appendChild(createSpotifyIframe(info, height));
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
