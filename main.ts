import { Plugin, PluginSettingTab, Setting, App, Editor } from 'obsidian';

interface SpotifyEmbedSettings {
	embedStyle: 'iframe' | 'div';
	embedHeight: string;
}

const DEFAULT_SETTINGS: SpotifyEmbedSettings = {
	embedStyle: 'iframe',
	embedHeight: '352',
};

export default class SpotifyEmbedPlugin extends Plugin {
	settings!: SpotifyEmbedSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SpotifyEmbedSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on('editor-paste', (evt: ClipboardEvent, editor: Editor) => {
				if (evt.defaultPrevented) return;

				const line = editor.getCursor().line;
				const lineText = editor.getLine(line).trim();
				// Only embed if pasted on an empty line
				if (lineText !== '') return;

				const pastedTextRaw = evt.clipboardData?.getData('text/plain') ?? '';
				if (!this.isSpotifyUrl(pastedTextRaw)) return;

				const spotifyInfo = this.extractSpotifyInfo(pastedTextRaw.trim());
				if (!spotifyInfo) return;

				evt.preventDefault();

				const embedSrc = `https://open.spotify.com/embed/${spotifyInfo.type}/${spotifyInfo.id}`;
				let embedCode = '';
				const height = this.settings.embedHeight || '352';

				switch (this.settings.embedStyle) {
					case 'iframe':
						embedCode = `<iframe style="border-radius:12px" src="${embedSrc}" width="100%" height="${height}" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
						break;
					case 'div':
						embedCode = `<div style="position: relative; width: 100%; height: ${height}px; max-width: 100%; overflow: hidden;"><iframe style="position: absolute; top: 0; left: 0; border-radius:12px; width: 100%; height: 100%;" src="${embedSrc}" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></div>`;
						break;
				}

				editor.replaceRange(embedCode, { line: line, ch: 0 }, { line: line, ch: lineText.length });
				editor.setCursor({ line: line, ch: embedCode.length });
			})
		);
	}

	isSpotifyUrl(text: string): boolean {
		const trimmed = text.trim();
		if (trimmed === '') return false;
		if (/\s/.test(trimmed)) return false;

		return this.extractSpotifyInfo(trimmed) !== null;
	}

	extractSpotifyInfo(url: string): { type: string, id: string } | null {
		try {
			const parsed = new URL(url.includes('://') ? url : `https://${url}`);
			const hostname = parsed.hostname.toLowerCase();
			
			if (hostname !== 'open.spotify.com') return null;
			
			const pathParts = parsed.pathname.split('/').filter(p => p.length > 0);
			if (pathParts.length >= 2) {
				let typeIndex = 0;
				// Skip known prefixes: /embed/... and /intl-en/...
				while (typeIndex < pathParts.length - 1) {
					const part = pathParts[typeIndex];
					if (part === 'embed' || part?.startsWith('intl-')) {
						typeIndex++;
					} else {
						break;
					}
				}
				
				if (pathParts.length > typeIndex + 1) {
					const type = pathParts[typeIndex];
					const id = pathParts[typeIndex + 1];
					const validTypes = ['track', 'album', 'playlist', 'artist', 'episode', 'show'];
					if (type && id && validTypes.includes(type)) {
						return { type, id };
					}
				}
			}
			return null;
		} catch {
			return null;
		}
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
			.setName('Embed style')
			.setDesc('Choose how spotify links are automatically formatted when pasted on an empty line.')
			.addDropdown(dropdown => dropdown
				.addOption('iframe', 'Iframe')
				.addOption('div', 'Div (resilient wrapper)')
				.setValue(this.plugin.settings.embedStyle)
				.onChange(async (value: string) => {
					this.plugin.settings.embedStyle = value as 'iframe' | 'div';
					await this.plugin.saveSettings();
				}));

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
