import { App, Notice, PluginSettingTab } from 'obsidian';
import type { SettingDefinitionItem } from 'obsidian';
import type MediaEmbedPlugin from './main';
import { DEFAULT_SETTINGS } from './types';

export class MediaEmbedSettingTab extends PluginSettingTab {
	plugin: MediaEmbedPlugin;

	constructor(app: App, plugin: MediaEmbedPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: 'Default embed mode',
				desc: 'Choose whether media embeds load automatically or display a click-to-load preview card by default.',
				control: {
					type: 'dropdown',
					key: 'defaultEmbedMode',
					defaultValue: DEFAULT_SETTINGS.defaultEmbedMode,
					options: {
						auto: 'Auto / direct embed',
						click: 'Click-to-load preview card',
					},
				},
			},
			{
				name: 'Enable click-to-load mode',
				desc: 'Display a preview card and only load player iframes when clicked.',
				control: {
					type: 'toggle',
					key: 'clickToLoad',
					defaultValue: DEFAULT_SETTINGS.clickToLoad,
				},
			},
			{
				name: 'Show hover action bar',
				desc: 'Display open in browser, copy link, and fullscreen buttons on hover.',
				control: {
					type: 'toggle',
					key: 'showActionBar',
					defaultValue: DEFAULT_SETTINGS.showActionBar,
				},
			},
			{
				name: 'Spotify embed height',
				desc: 'Height of Spotify embeds in pixels (e.g., 352 for normal player, 152 for compact player).',
				control: {
					type: 'text',
					key: 'embedHeight',
					defaultValue: DEFAULT_SETTINGS.embedHeight,
					placeholder: DEFAULT_SETTINGS.embedHeight,
				},
			},
			{
				name: 'Google Drive embed height',
				desc: 'Height of Google Drive embeds in pixels (e.g., 480 for standard view, 600 for large document view).',
				control: {
					type: 'text',
					key: 'gdriveEmbedHeight',
					defaultValue: DEFAULT_SETTINGS.gdriveEmbedHeight,
					placeholder: DEFAULT_SETTINGS.gdriveEmbedHeight,
				},
			},
			{
				name: 'PDF embed height',
				desc: 'Height of PDF embeds in pixels (e.g., 600 for standard document view).',
				control: {
					type: 'text',
					key: 'pdfEmbedHeight',
					defaultValue: DEFAULT_SETTINGS.pdfEmbedHeight,
					placeholder: DEFAULT_SETTINGS.pdfEmbedHeight,
				},
			},
			{
				name: 'Default embed height',
				desc: 'Default height for other media embeds (e.g., Figma, CodePen) in pixels.',
				control: {
					type: 'text',
					key: 'defaultEmbedHeight',
					defaultValue: DEFAULT_SETTINGS.defaultEmbedHeight,
					placeholder: DEFAULT_SETTINGS.defaultEmbedHeight,
				},
			},
			{
				name: 'Reset settings',
				desc: 'Restore all setting values back to their default state.',
				action: (el: HTMLElement) => {
					const button = el.createEl('button', { text: 'Reset to defaults' });
					button.addClass('mod-warning');
					button.onclick = async () => {
						this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
						await this.plugin.saveSettings();
						new Notice('Media embed settings reset to default.');
						this.update();
					};
				},
			},
		];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		if (key === 'defaultEmbedMode') {
			if (value !== 'auto' && value !== 'click') return;
			this.plugin.settings.defaultEmbedMode = value;
			this.plugin.settings.clickToLoad = value === 'click';
		} else if (key === 'clickToLoad') {
			if (typeof value !== 'boolean') return;
			this.plugin.settings.clickToLoad = value;
			this.plugin.settings.defaultEmbedMode = value ? 'click' : 'auto';
		} else if (key === 'showActionBar') {
			if (typeof value !== 'boolean') return;
			this.plugin.settings.showActionBar = value;
		} else if (key === 'embedHeight') {
			if (typeof value !== 'string') return;
			this.plugin.settings.embedHeight = value.trim() || DEFAULT_SETTINGS.embedHeight;
		} else if (key === 'gdriveEmbedHeight') {
			if (typeof value !== 'string') return;
			this.plugin.settings.gdriveEmbedHeight = value.trim() || DEFAULT_SETTINGS.gdriveEmbedHeight;
		} else if (key === 'pdfEmbedHeight') {
			if (typeof value !== 'string') return;
			this.plugin.settings.pdfEmbedHeight = value.trim() || DEFAULT_SETTINGS.pdfEmbedHeight;
		} else if (key === 'defaultEmbedHeight') {
			if (typeof value !== 'string') return;
			this.plugin.settings.defaultEmbedHeight = value.trim() || DEFAULT_SETTINGS.defaultEmbedHeight;
		} else {
			return;
		}

		await this.plugin.saveSettings();
		if (key === 'defaultEmbedMode' || key === 'clickToLoad') {
			this.update();
		}
	}
}
