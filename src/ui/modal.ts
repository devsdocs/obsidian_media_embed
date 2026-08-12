import { App, Modal } from 'obsidian';

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
	private readonly iframeCreator: (container: HTMLElement) => HTMLIFrameElement | null;

	constructor(
		app: App,
		platformName: string,
		embedUrl: string,
		iframeCreator: (container: HTMLElement) => HTMLIFrameElement | null
	) {
		super(app);
		this.platformName = platformName;
		this.embedUrl = embedUrl;
		this.iframeCreator = iframeCreator;
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

		const openBtn = actionsEl.createEl('button', {
			cls: 'media-embed-btn',
			text: 'Open in browser ↗',
		});
		openBtn.addEventListener('click', () => {
			window.open(this.embedUrl, '_blank');
		});

		const iframeContainer = contentEl.createDiv({ cls: 'media-embed-modal-iframe-container' });
		const iframe = this.iframeCreator(iframeContainer);
		if (iframe) {
			iframe.addClass('media-embed-fullscreen-iframe');
		}
	}

	onClose(): void {
		const { contentEl } = this;
		if (contentEl) contentEl.empty();
	}
}
