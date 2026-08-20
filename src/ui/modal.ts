import { App, Modal, Setting } from 'obsidian';
import { extractLocalMediaInfo, openLocalMedia } from '../embeds/local';

const BaseModal = typeof Modal !== 'undefined' ? Modal : class {
	app: App;
	contentEl: HTMLElement = null!;
	constructor(app: App) {
		this.app = app;
	}
	open() {}
	close() {}
};

export class EmbedFullscreenModal extends BaseModal {
	private readonly embedUrl: string;
	private readonly platformName: string;
	private readonly embedCreator: (container: HTMLElement) => HTMLElement | null;

	constructor(
		app: App,
		platformName: string,
		embedUrl: string,
		embedCreator: (container: HTMLElement) => HTMLElement | null
	) {
		super(app);
		this.platformName = platformName;
		this.embedUrl = embedUrl;
		this.embedCreator = embedCreator;
	}

	onOpen(): void {
		const { contentEl } = this;
		if (!contentEl) return;
		contentEl.empty();
		contentEl.addClass('media-embed-modal-content');

		const headerEl = contentEl.createDiv({ cls: 'media-embed-modal-header' });
		headerEl.createSpan({ cls: 'media-embed-modal-title', text: `${this.platformName} embed` });

		const actionsEl = headerEl.createDiv({ cls: 'media-embed-modal-actions' });

		const copyBtn = actionsEl.createEl('button', {
			cls: 'media-embed-btn',
			text: 'Copy link',
		});
		copyBtn.addEventListener('click', () => {
			void navigator.clipboard.writeText(this.embedUrl);
			copyBtn.textContent = 'Copied!';
			window.setTimeout(() => {
				copyBtn.textContent = 'Copy link';
			}, 1500);
		});

		const isLocal = extractLocalMediaInfo(this.embedUrl);
		const openBtn = actionsEl.createEl('button', {
			cls: 'media-embed-btn',
			text: isLocal ? 'Open file ↗' : 'Open in browser ↗',
		});
		openBtn.addEventListener('click', () => {
			openLocalMedia(this.app, this.embedUrl);
		});

		const iframeContainer = contentEl.createDiv({ cls: 'media-embed-modal-iframe-container' });
		const mediaEl = this.embedCreator(iframeContainer);
		if (mediaEl) {
			mediaEl.addClass('media-embed-fullscreen-iframe');
			mediaEl.addClass('media-embed-fullscreen-media');
		}

		const noteEl = contentEl.createDiv({ cls: 'media-embed-modal-note' });
		noteEl.createEl('small', {
			text: 'Note: If the media is private, deleted, or embedding is restricted by its author, click open to view it directly.',
		});
	}

	onClose(): void {
		const { contentEl } = this;
		if (contentEl) contentEl.empty();
	}
}

export class YouTubeChoiceModal extends BaseModal {
	private readonly videoUrl: string;
	private readonly playlistUrl: string;
	private readonly combinedUrl: string;
	private readonly onSelect: (selectedUrl: string) => void;
	private chosen = false;

	constructor(
		app: App,
		videoId: string,
		playlistId: string,
		startTime: number | null | undefined,
		index: number | undefined,
		onSelect: (selectedUrl: string) => void
	) {
		super(app);
		this.onSelect = onSelect;

		const startParam = startTime ? `t=${startTime}s` : '';
		this.videoUrl = startParam
			? `https://www.youtube.com/watch?v=${videoId}&${startParam}`
			: `https://www.youtube.com/watch?v=${videoId}`;
		this.playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;

		const combinedParams = new URLSearchParams();
		combinedParams.set('v', videoId);
		combinedParams.set('list', playlistId);
		if (startTime) combinedParams.set('t', `${startTime}s`);
		if (index) combinedParams.set('index', index.toString());
		this.combinedUrl = `https://www.youtube.com/watch?${combinedParams.toString()}`;
	}

	onOpen(): void {
		const { contentEl } = this;
		if (!contentEl) return;
		contentEl.empty();
		contentEl.addClass('media-embed-choice-modal');

		contentEl.createEl('h3', { text: 'Choose YouTube embed format' });
		contentEl.createEl('p', {
			cls: 'media-embed-choice-desc',
			text: 'This YouTube link contains both a video and a playlist. Choose how you would like to embed it:',
		});

		new Setting(contentEl)
			.setName('Video with playlist queue')
			.setDesc('Plays this specific video with the playlist queue in the player.')
			.addButton((btn) =>
				btn
					.setButtonText('Embed video and playlist')
					.setCta()
					.onClick(() => {
						this.chosen = true;
						this.close();
						this.onSelect(this.combinedUrl);
					})
			);

		new Setting(contentEl)
			.setName('Single video only')
			.setDesc('Embeds only this video without the playlist queue.')
			.addButton((btn) =>
				btn
					.setButtonText('Embed video only')
					.onClick(() => {
						this.chosen = true;
						this.close();
						this.onSelect(this.videoUrl);
					})
			);

		new Setting(contentEl)
			.setName('Entire playlist')
			.setDesc('Embeds the full playlist player starting from the beginning.')
			.addButton((btn) =>
				btn
					.setButtonText('Embed playlist only')
					.onClick(() => {
						this.chosen = true;
						this.close();
						this.onSelect(this.playlistUrl);
					})
			);

		const noteEl = contentEl.createDiv({ cls: 'media-embed-choice-note' });
		noteEl.createEl('small', {
			text: 'Note: If the video or playlist is private, deleted, or has embedding restricted by its owner, playback inside Obsidian will not be available.',
		});
	}

	onClose(): void {
		const { contentEl } = this;
		if (contentEl) contentEl.empty();
		if (!this.chosen) {
			this.onSelect(this.combinedUrl);
		}
	}
}
