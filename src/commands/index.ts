import { Editor, Notice } from 'obsidian';
import type MediaEmbedPlugin from '../main';
import { detectMedia } from '../embeds';

export function registerCommands(plugin: MediaEmbedPlugin): void {
	plugin.addCommand({
		id: 'convert-link-under-cursor',
		name: 'Convert link under Cursor to embed block',
		editorCallback: (editor: Editor) => {
			const cursor = editor.getCursor();
			const lineText = editor.getLine(cursor.line).trim();

			const media = detectMedia(lineText);
			if (!media) {
				new Notice('No valid embeddable URL found on current line.');
				return;
			}

			const codeBlock = `\`\`\`embed\n${media.url}\n\`\`\``;
			editor.replaceRange(codeBlock, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: editor.getLine(cursor.line).length });
			new Notice(`Converted link to ${media.platform} embed block.`);
		},
	});

	plugin.addCommand({
		id: 'convert-selection',
		name: 'Convert selection to embed block',
		editorCallback: (editor: Editor) => {
			const selection = editor.getSelection().trim();
			if (!selection) {
				new Notice('Please select a link to convert.');
				return;
			}

			const media = detectMedia(selection);
			if (!media) {
				new Notice('Selected text is not a supported embeddable URL.');
				return;
			}

			const codeBlock = `\`\`\`embed\n${media.url}\n\`\`\``;
			editor.replaceSelection(codeBlock);
			new Notice(`Converted selection to ${media.platform} embed block.`);
		},
	});

	plugin.addCommand({
		id: 'toggle-click-to-load',
		name: 'Toggle click-to-load mode',
		callback: async () => {
			plugin.settings.clickToLoad = !plugin.settings.clickToLoad;
			await plugin.saveSettings();
			const status = plugin.settings.clickToLoad ? 'enabled' : 'disabled';
			new Notice(`Click-to-load mode is now ${status}.`);
		},
	});
}
