import { Plugin, Editor } from 'obsidian';
import { MediaEmbedSettings, DEFAULT_SETTINGS } from './types';
import { MediaEmbedSettingTab } from './settings';
import { detectMedia, renderMediaEmbed } from './embeds';
import { registerCommands } from './commands';

export default class MediaEmbedPlugin extends Plugin {
	settings!: MediaEmbedSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new MediaEmbedSettingTab(this.app, this));
		registerCommands(this);

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
			renderMediaEmbed(this.app, el, source, this.settings);
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as Partial<MediaEmbedSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
