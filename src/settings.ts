import { App, PluginSettingTab, Setting, Plugin } from 'obsidian';
import type { MediaEmbedPluginInterface } from './types';

export class MediaEmbedSettingTab extends PluginSettingTab {
	plugin: Plugin & MediaEmbedPluginInterface;

	constructor(app: App, plugin: Plugin & MediaEmbedPluginInterface) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions() {
		return [
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
		];
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Spotify embed height')
			.setDesc('Height of spotify embeds in pixels (e.g., 352 for normal player, 152 for compact player).')
			.addText(text => text
				.setPlaceholder('352')
				.setValue(this.plugin.settings.embedHeight)
				.onChange(async (value) => {
					this.plugin.settings.embedHeight = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Google Drive embed height')
			.setDesc('Height of Google Drive embeds in pixels (e.g., 480 for standard view, 600 for large document view).')
			.addText(text => text
				.setPlaceholder('480')
				.setValue(this.plugin.settings.gdriveEmbedHeight)
				.onChange(async (value) => {
					this.plugin.settings.gdriveEmbedHeight = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Enable click-to-load mode')
			.setDesc('Display a preview card and only load player iframes when clicked.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.clickToLoad)
				.onChange(async (value) => {
					this.plugin.settings.clickToLoad = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Show hover action bar')
			.setDesc('Display open in browser, copy link, and fullscreen buttons on hover.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showActionBar)
				.onChange(async (value) => {
					this.plugin.settings.showActionBar = value;
					await this.plugin.saveSettings();
				}));
	}
}
