import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import type MediaEmbedPlugin from './main';
import { DEFAULT_SETTINGS } from './types';

export class MediaEmbedSettingTab extends PluginSettingTab {
	plugin: MediaEmbedPlugin;

	constructor(app: App, plugin: MediaEmbedPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions() {
		return [
			{
				id: 'defaultEmbedMode',
				name: 'Default embed mode',
				description: 'Choose whether media embeds load automatically or display a click-to-load preview card by default.',
			},
			{
				id: 'clickToLoad',
				name: 'Enable click-to-load mode',
				description: 'Display a preview card and only load player iframes when clicked.',
			},
			{
				id: 'showActionBar',
				name: 'Show hover action bar',
				description: 'Display open in browser, copy link, and fullscreen buttons on hover.',
			},
			{
				id: 'embedHeight',
				name: 'Spotify embed height',
				description: 'Height of Spotify embeds in pixels (e.g., 352 for normal player, 152 for compact player).',
			},
			{
				id: 'gdriveEmbedHeight',
				name: 'Google Drive embed height',
				description: 'Height of Google Drive embeds in pixels (e.g., 480 for standard view, 600 for large document view).',
			},
			{
				id: 'defaultEmbedHeight',
				name: 'Default embed height',
				description: 'Default height for other media embeds (e.g., Figma, CodePen) in pixels.',
			},
		];
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		if (!this.plugin.settings) {
			this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
		}

		const settings = this.plugin.settings;

		new Setting(containerEl)
			.setName('Default embed mode')
			.setDesc('Choose whether media embeds load automatically or display a click-to-load preview card by default.')
			.addDropdown(dropdown => dropdown
				.addOption('auto', 'Auto / direct embed')
				.addOption('click', 'Click-to-load preview card')
				.setValue(settings.defaultEmbedMode ?? DEFAULT_SETTINGS.defaultEmbedMode)
				.onChange(async (value) => {
					this.plugin.settings.defaultEmbedMode = value as 'auto' | 'click';
					this.plugin.settings.clickToLoad = value === 'click';
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Enable click-to-load mode')
			.setDesc('Display a preview card and only load player iframes when clicked.')
			.addToggle(toggle => toggle
				.setValue(settings.clickToLoad ?? DEFAULT_SETTINGS.clickToLoad)
				.onChange(async (value) => {
					this.plugin.settings.clickToLoad = value;
					this.plugin.settings.defaultEmbedMode = value ? 'click' : 'auto';
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Show hover action bar')
			.setDesc('Display open in browser, copy link, and fullscreen buttons on hover.')
			.addToggle(toggle => toggle
				.setValue(settings.showActionBar ?? DEFAULT_SETTINGS.showActionBar)
				.onChange(async (value) => {
					this.plugin.settings.showActionBar = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Spotify embed height')
			.setDesc('Height of spotify embeds in pixels (e.g., 352 for normal player, 152 for compact player).')
			.addText(text => text
				.setPlaceholder('352')
				.setValue(settings.embedHeight ?? DEFAULT_SETTINGS.embedHeight)
				.onChange(async (value) => {
					this.plugin.settings.embedHeight = value.trim() || DEFAULT_SETTINGS.embedHeight;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Google Drive embed height')
			.setDesc('Height of Google Drive embeds in pixels (e.g., 480 for standard view, 600 for large document view).')
			.addText(text => text
				.setPlaceholder('480')
				.setValue(settings.gdriveEmbedHeight ?? DEFAULT_SETTINGS.gdriveEmbedHeight)
				.onChange(async (value) => {
					this.plugin.settings.gdriveEmbedHeight = value.trim() || DEFAULT_SETTINGS.gdriveEmbedHeight;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Default embed height')
			.setDesc('Default height for other media embeds (e.g., figma, codepen) in pixels.')
			.addText(text => text
				.setPlaceholder('480')
				.setValue(settings.defaultEmbedHeight ?? DEFAULT_SETTINGS.defaultEmbedHeight)
				.onChange(async (value) => {
					this.plugin.settings.defaultEmbedHeight = value.trim() || DEFAULT_SETTINGS.defaultEmbedHeight;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Reset settings')
			.setDesc('Restore all setting values back to their default state.')
			.addButton(button => button
				.setButtonText('Reset to defaults')
				.setWarning()
				.onClick(async () => {
					this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
					await this.plugin.saveSettings();
					new Notice('Media embed settings reset to default.');
					this.display();
				}));
	}

}

