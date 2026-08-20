import { App, TFile } from 'obsidian';
import type { EmbedOptions } from '../types';

const PDF_EXTENSIONS = ['pdf'];
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogv', 'mov', 'm4v', 'mkv', 'avi'];
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'opus', 'wma'];

export interface LocalMediaInfo {
	platform: 'pdf' | 'video' | 'audio';
	cleanPath: string;
	hash: string;
}

export function parseLocalPath(raw: string): { cleanPath: string; hash: string } {
	let clean = raw.trim();

	// Strip wikilink delimiters: [[path/to/file.ext|alias]] -> path/to/file.ext
	if (clean.startsWith('[[') && clean.endsWith(']]')) {
		clean = clean.slice(2, -2).split('|')[0]?.trim() ?? '';
	}

	// Strip markdown link: [title](path/to/file.ext) -> path/to/file.ext
	const mdMatch = clean.match(/^\[.*?\]\((.*?)\)$/);
	if (mdMatch?.[1]) {
		clean = mdMatch[1].trim();
	}

	// Strip surrounding quotes
	if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
		clean = clean.slice(1, -1).trim();
	}

	// Strip surrounding angle brackets <file.ext>
	if (clean.startsWith('<') && clean.endsWith('>')) {
		clean = clean.slice(1, -1).trim();
	}

	// Extract hash or query parameters (e.g. #page=2 or #t=10)
	const hashMatch = clean.match(/([#?].*)$/);
	const hash = hashMatch?.[1] ?? '';
	const cleanPath = hashMatch ? clean.slice(0, -hash.length) : clean;

	return { cleanPath, hash };
}

export function extractLocalMediaInfo(url: string): LocalMediaInfo | null {
	const { cleanPath, hash } = parseLocalPath(url);
	if (!cleanPath) return null;

	const dotIdx = cleanPath.lastIndexOf('.');
	if (dotIdx === -1) return null;

	const ext = cleanPath.slice(dotIdx + 1).toLowerCase();

	if (PDF_EXTENSIONS.includes(ext)) {
		return { platform: 'pdf', cleanPath, hash };
	}
	if (VIDEO_EXTENSIONS.includes(ext)) {
		return { platform: 'video', cleanPath, hash };
	}
	if (AUDIO_EXTENSIONS.includes(ext)) {
		return { platform: 'audio', cleanPath, hash };
	}

	return null;
}

function isTFile(file: unknown): file is TFile {
	return Boolean(file && typeof file === 'object' && 'path' in file && !('children' in file));
}

export function resolveMediaResourceUrl(app: App, rawPath: string): string | null {
	const { cleanPath, hash } = parseLocalPath(rawPath);
	if (!cleanPath) return null;

	// 1. Direct Web URLs or data URLs
	if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://') || cleanPath.startsWith('data:')) {
		return `${cleanPath}${hash}`;
	}

	// 2. Resource URLs or file scheme
	if (cleanPath.startsWith('app://') || cleanPath.startsWith('capacitor://') || cleanPath.startsWith('file://')) {
		return `${cleanPath}${hash}`;
	}

	// 3. Vault resolution via metadataCache (supports relative paths, wikilinks, attachments folder)
	let file: TFile | null = app.metadataCache.getFirstLinkpathDest(cleanPath, '');

	// 4. Vault resolution via getFileByPath / getAbstractFileByPath
	if (!file && typeof app.vault.getFileByPath === 'function') {
		file = app.vault.getFileByPath(cleanPath);
	}

	if (!file) {
		const abstract = app.vault.getAbstractFileByPath(cleanPath);
		if (isTFile(abstract)) {
			file = abstract;
		}
	}

	// 5. Try URI-decoded path
	if (!file) {
		try {
			const decoded = decodeURIComponent(cleanPath);
			if (decoded !== cleanPath) {
				file = app.metadataCache.getFirstLinkpathDest(decoded, '')
					|| (typeof app.vault.getFileByPath === 'function' ? app.vault.getFileByPath(decoded) : null);
			}
		} catch {
			// ignore decoding errors
		}
	}

	if (isTFile(file)) {
		const resourcePath = app.vault.getResourcePath(file);
		return hash ? `${resourcePath}${hash}` : resourcePath;
	}

	// 6. Vault adapter resource path fallback
	if (app.vault.adapter && typeof app.vault.adapter.getResourcePath === 'function') {
		try {
			const adapterPath = app.vault.adapter.getResourcePath(cleanPath);
			if (adapterPath) {
				return hash ? `${adapterPath}${hash}` : adapterPath;
			}
		} catch {
			// adapter resource path unavailable
		}
	}

	return null;
}

const MIME_TYPES: Record<string, string> = {
	pdf: 'application/pdf',
	mp4: 'video/mp4',
	webm: 'video/webm',
	ogv: 'video/ogg',
	mov: 'video/quicktime',
	m4v: 'video/mp4',
	mkv: 'video/x-matroska',
	avi: 'video/x-msvideo',
	mp3: 'audio/mpeg',
	wav: 'audio/wav',
	ogg: 'audio/ogg',
	m4a: 'audio/mp4',
	flac: 'audio/flac',
	aac: 'audio/aac',
	opus: 'audio/opus',
	wma: 'audio/x-ms-wma',
};

export function createPdfEmbed(
	app: App,
	container: HTMLElement,
	url: string,
	height: string
): HTMLElement | null {
	const resourceUrl = resolveMediaResourceUrl(app, url);
	if (!resourceUrl) {
		return renderLocalFileNotFoundCard(container, 'PDF', url);
	}

	const iframe = container.createEl('iframe', {
		cls: 'media-embed-pdf',
		attr: {
			src: resourceUrl,
			height,
			width: '100%',
			allowfullscreen: '',
			loading: 'lazy',
		},
	});

	iframe.style.height = `${height}px`;

	return iframe;
}

export function createVideoEmbed(
	app: App,
	container: HTMLElement,
	url: string,
	options?: EmbedOptions
): HTMLElement | null {
	const resourceUrl = resolveMediaResourceUrl(app, url);
	if (!resourceUrl) {
		return renderLocalFileNotFoundCard(container, 'Video', url);
	}

	const info = extractLocalMediaInfo(url);
	const ext = info?.cleanPath.split('.').pop()?.toLowerCase() ?? 'mp4';
	const mime = MIME_TYPES[ext] || 'video/mp4';

	const video = container.createEl('video', {
		cls: 'media-embed-video',
		attr: {
			src: resourceUrl,
			controls: '',
			preload: 'metadata',
			playsinline: '',
		},
	});

	video.createEl('source', {
		attr: {
			src: resourceUrl,
			type: mime,
		},
	});

	if (options?.height) {
		video.style.height = `${options.height}px`;
	}

	if (options?.aspect) {
		const [w, h] = options.aspect.split(/[/:]/);
		if (w && h) {
			video.style.aspectRatio = `${w} / ${h}`;
		}
	}

	return video;
}

export function createAudioEmbed(
	app: App,
	container: HTMLElement,
	url: string
): HTMLElement | null {
	const resourceUrl = resolveMediaResourceUrl(app, url);
	if (!resourceUrl) {
		return renderLocalFileNotFoundCard(container, 'Audio', url);
	}

	const info = extractLocalMediaInfo(url);
	const ext = info?.cleanPath.split('.').pop()?.toLowerCase() ?? 'mp3';
	const mime = MIME_TYPES[ext] || 'audio/mpeg';

	const audio = container.createEl('audio', {
		cls: 'media-embed-audio',
		attr: {
			src: resourceUrl,
			controls: '',
			preload: 'metadata',
		},
	});

	audio.createEl('source', {
		attr: {
			src: resourceUrl,
			type: mime,
		},
	});

	return audio;
}

export function openLocalMedia(app: App, url: string): void {
	const info = extractLocalMediaInfo(url);
	if (info) {
		const targetFile = app.metadataCache.getFirstLinkpathDest(info.cleanPath, '')
			|| (typeof app.vault.getFileByPath === 'function' ? app.vault.getFileByPath(info.cleanPath) : null);
		if (isTFile(targetFile)) {
			void app.workspace.openLinkText(targetFile.path, '', true);
			return;
		}
	}
	window.open(url, '_blank');
}

function renderLocalFileNotFoundCard(container: HTMLElement, mediaType: string, path: string): HTMLElement {
	const errorCard = container.createDiv({ cls: 'media-embed-error-card' });
	errorCard.createDiv({
		cls: 'media-embed-error-title',
		text: `${mediaType} file not found`,
	});
	errorCard.createDiv({
		cls: 'media-embed-error-desc',
		text: `Could not locate "${path}" in your vault. Please verify that the file exists and the path or wikilink is correct.`,
	});
	return errorCard;
}
