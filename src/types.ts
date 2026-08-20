export type PlatformType =
	| 'spotify'
	| 'youtube'
	| 'gdrive'
	| 'vimeo'
	| 'loom'
	| 'figma'
	| 'soundcloud'
	| 'twitch'
	| 'codepen'
	| 'pdf'
	| 'video'
	| 'audio';

export interface EmbedOptions {
	height?: string;
	aspect?: string;
	mode?: 'auto' | 'click';
}

export interface MediaInfo {
	platform: PlatformType;
	url: string;
	options?: EmbedOptions;
}

export interface MediaEmbedSettings {
	embedHeight: string;
	gdriveEmbedHeight: string;
	defaultEmbedHeight: string;
	pdfEmbedHeight: string;
	clickToLoad: boolean;
	showActionBar: boolean;
	defaultEmbedMode: 'auto' | 'click';
}

export const DEFAULT_SETTINGS: MediaEmbedSettings = {
	embedHeight: '352',
	gdriveEmbedHeight: '480',
	defaultEmbedHeight: '480',
	pdfEmbedHeight: '600',
	clickToLoad: false,
	showActionBar: true,
	defaultEmbedMode: 'auto',
};

export interface MediaEmbedPluginInterface {
	settings: MediaEmbedSettings;
	saveSettings(): Promise<void>;
}
