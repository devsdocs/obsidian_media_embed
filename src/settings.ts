import { App, PluginSettingTab, Setting, Plugin, Notice } from 'obsidian';
import type { MediaEmbedPluginInterface } from './types';
import { DEFAULT_SETTINGS } from './types';

export class MediaEmbedSettingTab extends PluginSettingTab {
	plugin: Plugin & MediaEmbedPluginInterface;

	constructor(app: App, plugin: Plugin & MediaEmbedPluginInterface) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions() {
		return [
			{
				key: 'defaultEmbedMode',
				name: 'Default embed mode',
				description: 'Choose whether media embeds load automatically or display a click-to-load preview card by default.',
				type: 'dropdown' as const,
				options: {
					auto: 'Auto / direct embed',
					click: 'Click-to-load preview card',
				},
				default: 'auto',
			},
			{
				key: 'clickToLoad',
				name: 'Enable click-to-load mode',
				description: 'Display a preview card and only load player iframes when clicked.',
				type: 'boolean' as const,
				default: false,
			},
			{
				key: 'showActionBar',
				name: 'Show hover action bar',
				description: 'Display open in browser, copy link, and fullscreen buttons on hover.',
				type: 'boolean' as const,
				default: true,
			},
			{
				key: 'embedHeight',
				name: 'Spotify embed height',
				description: 'Height of spotify embeds in pixels (e.g., 352 for normal player, 152 for compact player).',
				type: 'text' as const,
				default: '352',
			},
			{
				key: 'gdriveEmbedHeight',
				name: 'Google Drive embed height',
				description: 'Height of Google Drive embeds in pixels (e.g., 480 for standard view, 600 for large document view).',
				type: 'text' as const,
				default: '480',
			},
			{
				key: 'defaultEmbedHeight',
				name: 'Default embed height',
				description: 'Default height for other media embeds (e.g., figma, codepen) in pixels.',
				type: 'text' as const,
				default: '480',
			},
		];
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.addClass('media-embed-settings-tab');

		if (!this.plugin.settings) {
			this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
		}

		new Setting(containerEl)
			.setName('Media embeds')
			.setDesc('Configure embed heights, interaction modes, and action bar controls for embedded media.')
			.setHeading();

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
					this.display();
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
					this.display();
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

