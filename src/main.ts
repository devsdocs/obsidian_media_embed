import { Plugin, Editor } from 'obsidian';
import { MediaEmbedSettings, DEFAULT_SETTINGS } from './types';
import { MediaEmbedSettingTab } from './settings';
import { detectMedia, renderMediaEmbed } from './embeds';
import { extractYoutubeInfo, isYoutubeVideoAndPlaylist } from './embeds/youtube';
import { registerCommands } from './commands';
import { YouTubeChoiceModal } from './ui/modal';

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

				const insertCodeBlock = (urlToInsert: string) => {
					const codeBlock = `\`\`\`embed\n${urlToInsert}\n\`\`\``;
					editor.replaceRange(codeBlock, { line, ch: 0 }, { line, ch: lineText.length });
					editor.setCursor({ line: line + 2, ch: 3 });
				};

				if (media.platform === 'youtube') {
					const ytInfo = extractYoutubeInfo(media.url);
					if (isYoutubeVideoAndPlaylist(ytInfo)) {
						new YouTubeChoiceModal(
							this.app,
							ytInfo.videoId,
							ytInfo.playlistId,
							ytInfo.startTime,
							ytInfo.index,
							(chosenUrl) => insertCodeBlock(chosenUrl)
						).open();
						return;
					}
				}

				insertCodeBlock(media.url);
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
