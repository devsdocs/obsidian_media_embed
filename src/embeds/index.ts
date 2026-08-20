import { App } from 'obsidian';
import type { MediaInfo, MediaEmbedSettings, PlatformType } from '../types';
import { parseEmbedBlock } from './parser';
import { extractSpotifyInfo, createSpotifyIframe } from './spotify';
import { extractYoutubeInfo, createYoutubeIframe } from './youtube';
import { extractGDriveEmbedUrl, createGDriveIframe } from './gdrive';
import { extractVimeoId, createVimeoIframe } from './vimeo';
import { extractLoomId, createLoomIframe } from './loom';
import { extractFigmaUrl, createFigmaIframe } from './figma';
import { extractSoundcloudUrl, createSoundcloudIframe } from './soundcloud';
import { extractTwitchInfo, createTwitchIframe } from './twitch';
import { extractCodepenInfo, createCodepenIframe } from './codepen';
import {
	extractLocalMediaInfo,
	createPdfEmbed,
	createVideoEmbed,
	createAudioEmbed,
	openLocalMedia,
} from './local';
import { EmbedFullscreenModal } from '../ui/modal';

export function detectMedia(text: string): MediaInfo | null {
	const trimmed = text.trim();
	if (trimmed === '') return null;

	const localInfo = extractLocalMediaInfo(trimmed);
	if (localInfo) {
		return { platform: localInfo.platform, url: trimmed };
	}

	if (/\s/.test(trimmed)) return null;

	if (extractSpotifyInfo(trimmed)) return { platform: 'spotify', url: trimmed };
	if (extractYoutubeInfo(trimmed)) return { platform: 'youtube', url: trimmed };
	if (extractGDriveEmbedUrl(trimmed)) return { platform: 'gdrive', url: trimmed };
	if (extractVimeoId(trimmed)) return { platform: 'vimeo', url: trimmed };
	if (extractLoomId(trimmed)) return { platform: 'loom', url: trimmed };
	if (extractFigmaUrl(trimmed)) return { platform: 'figma', url: trimmed };
	if (extractSoundcloudUrl(trimmed)) return { platform: 'soundcloud', url: trimmed };
	if (extractTwitchInfo(trimmed)) return { platform: 'twitch', url: trimmed };
	if (extractCodepenInfo(trimmed)) return { platform: 'codepen', url: trimmed };

	return null;
}

const PLATFORM_LABELS: Record<PlatformType, string> = {
	spotify: 'Spotify',
	youtube: 'YouTube',
	gdrive: 'Google Drive',
	vimeo: 'Vimeo',
	loom: 'Loom',
	figma: 'Figma',
	soundcloud: 'SoundCloud',
	twitch: 'Twitch',
	codepen: 'CodePen',
	pdf: 'PDF',
	video: 'Video',
	audio: 'Audio',
};

export function renderMediaEmbed(
	app: App,
	container: HTMLElement,
	sourceText: string,
	settings: MediaEmbedSettings
): void {
	const { url, options } = parseEmbedBlock(sourceText);
	const media = detectMedia(url);

	if (!media) {
		const errorCard = container.createDiv({ cls: 'media-embed-error-card' });
		errorCard.createDiv({ cls: 'media-embed-error-title', text: 'Unable to embed media' });
		errorCard.createDiv({
			cls: 'media-embed-error-desc',
			text: 'The URL or path could not be recognized as a supported media link. If this file or media is private, deleted, or restricted from embedding, it cannot be displayed inside Obsidian.',
		});
		if (url) {
			const openLink = errorCard.createEl('a', {
				cls: 'media-embed-error-url',
				text: `Open target: ${url}`,
				attr: { href: url, target: '_blank', rel: 'noopener noreferrer' },
			});
			openLink.addEventListener('click', (e) => {
				e.preventDefault();
				openLocalMedia(app, url);
			});
		}
		return;
	}

	const wrapper = container.createDiv({ cls: 'media-embed-wrapper' });
	const platformName = PLATFORM_LABELS[media.platform];

	const isClickMode = options.mode === 'click' || (settings.clickToLoad && options.mode !== 'auto');

	const buildEmbed = (targetEl: HTMLElement): HTMLElement | null => {
		const effectiveHeight = options.height || getPlatformHeight(media.platform, settings);
		let embedEl: HTMLElement | null = null;

		switch (media.platform) {
			case 'spotify':
				embedEl = createSpotifyIframe(targetEl, url, effectiveHeight);
				break;
			case 'youtube':
				embedEl = createYoutubeIframe(targetEl, url);
				break;
			case 'gdrive':
				embedEl = createGDriveIframe(targetEl, url, effectiveHeight);
				break;
			case 'vimeo':
				embedEl = createVimeoIframe(targetEl, url);
				break;
			case 'loom':
				embedEl = createLoomIframe(targetEl, url);
				break;
			case 'figma':
				embedEl = createFigmaIframe(targetEl, url, effectiveHeight);
				break;
			case 'soundcloud':
				embedEl = createSoundcloudIframe(targetEl, url);
				break;
			case 'twitch':
				embedEl = createTwitchIframe(targetEl, url);
				break;
			case 'codepen':
				embedEl = createCodepenIframe(targetEl, url, effectiveHeight);
				break;
			case 'pdf':
				embedEl = createPdfEmbed(app, targetEl, url, effectiveHeight);
				break;
			case 'video':
				embedEl = createVideoEmbed(app, targetEl, url, options);
				break;
			case 'audio':
				embedEl = createAudioEmbed(app, targetEl, url);
				break;
		}

		if (embedEl && options.height && embedEl.tagName.toLowerCase() === 'iframe') {
			embedEl.setAttribute('height', options.height);
		}

		return embedEl;
	};

	if (settings.showActionBar) {
		renderActionBar(app, wrapper, platformName, url, buildEmbed);
	}

	const contentEl = wrapper.createDiv({ cls: 'media-embed-content' });

	if (isClickMode) {
		renderClickToLoadCard(contentEl, platformName, url, () => {
			contentEl.empty();
			buildEmbed(contentEl);
		});
	} else {
		buildEmbed(contentEl);
	}
}

function getPlatformHeight(platform: PlatformType, settings: MediaEmbedSettings): string {
	switch (platform) {
		case 'spotify':
			return settings.embedHeight || '352';
		case 'pdf':
			return settings.pdfEmbedHeight || '600';
		case 'gdrive':
		case 'figma':
		case 'codepen':
			return settings.gdriveEmbedHeight || '480';
		default:
			return settings.defaultEmbedHeight || '480';
	}
}

function renderActionBar(
	app: App,
	wrapper: HTMLElement,
	platformName: string,
	url: string,
	buildEmbed: (targetEl: HTMLElement) => HTMLElement | null
): void {
	const bar = wrapper.createDiv({ cls: 'media-embed-action-bar' });

	const badge = bar.createSpan({ cls: 'media-embed-badge', text: platformName });
	badge.addClass(`media-embed-badge-${platformName.toLowerCase().replace(/\s+/g, '')}`);

	const actions = bar.createDiv({ cls: 'media-embed-actions' });

	const copyBtn = actions.createEl('button', {
		cls: 'media-embed-action-btn',
		attr: { 'aria-label': 'Copy link', title: 'Copy link' },
		text: '📋',
	});
	copyBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		void navigator.clipboard.writeText(url);
		copyBtn.textContent = '✓';
		window.setTimeout(() => {
			copyBtn.textContent = '📋';
		}, 1500);
	});

	const isLocal = extractLocalMediaInfo(url);
	const openLabel = isLocal ? 'Open file in Obsidian or default app' : 'Open in browser (use if media is private or restricted)';

	const openBtn = actions.createEl('button', {
		cls: 'media-embed-action-btn',
		attr: {
			'aria-label': openLabel,
			title: openLabel,
		},
		text: '↗',
	});
	openBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		openLocalMedia(app, url);
	});

	const modalBtn = actions.createEl('button', {
		cls: 'media-embed-action-btn',
		attr: { 'aria-label': 'Fullscreen view', title: 'Fullscreen view' },
		text: '⤢',
	});
	modalBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		new EmbedFullscreenModal(app, platformName, url, buildEmbed).open();
	});
}

function renderClickToLoadCard(
	container: HTMLElement,
	platformName: string,
	url: string,
	onLoad: () => void
): void {
	const card = container.createDiv({ cls: 'media-embed-card' });

	card.createDiv({ cls: 'media-embed-card-title', text: `${platformName} Content` });
	card.createDiv({ cls: 'media-embed-card-url', text: url });

	const loadBtn = card.createEl('button', {
		cls: 'media-embed-card-btn',
		text: 'Click to load preview',
	});

	loadBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		onLoad();
	});

	card.createDiv({
		cls: 'media-embed-card-hint',
		text: 'Note: If the content is private, deleted, or embedding is restricted, playback may not be available in embedded view.',
	});
}
