export interface YoutubeInfo {
	videoId?: string;
	playlistId?: string;
	startTime?: number;
	index?: number;
}

export function extractYoutubeInfo(url: string): YoutubeInfo | null {
	try {
		const parsed = new URL(url.includes('://') ? url : `https://${url}`);
		const hostname = parsed.hostname.toLowerCase();

		if (!/(?:^|\.)(?:youtube\.com|youtu\.be|youtube-nocookie\.com)$/.test(hostname)) {
			return null;
		}

		let videoId: string | undefined;
		let playlistId: string | undefined;

		const listParam = parsed.searchParams.get('list');
		if (listParam) {
			const normalizedList = normalizeYoutubePlaylistId(listParam);
			if (normalizedList) playlistId = normalizedList;
		}

		if (/youtu\.be$/.test(hostname)) {
			const segment = parsed.pathname.slice(1).split(/[/?#]/)[0] ?? '';
			const normalized = normalizeYoutubeId(segment);
			if (normalized) videoId = normalized;
		} else {
			const path = parsed.pathname;
			if (path.startsWith('/shorts/')) {
				const normalized = normalizeYoutubeId(path.split('/')[2] ?? '');
				if (normalized) videoId = normalized;
			} else if (path.startsWith('/embed/')) {
				const segment = path.split('/')[2] ?? '';
				if (segment !== 'videoseries') {
					const normalized = normalizeYoutubeId(segment);
					if (normalized) videoId = normalized;
				}
			} else if (path.startsWith('/live/')) {
				const normalized = normalizeYoutubeId(path.split('/')[2] ?? '');
				if (normalized) videoId = normalized;
			} else if (path === '/watch' || path === '/watch/') {
				const v = parsed.searchParams.get('v');
				if (v) {
					const normalized = normalizeYoutubeId(v);
					if (normalized) videoId = normalized;
				}
			}
		}

		if (!videoId && !playlistId) {
			return null;
		}

		const startTime = extractYoutubeStartTime(url);
		const indexParam = parsed.searchParams.get('index');
		const index = indexParam && /^\d+$/.test(indexParam) ? Number.parseInt(indexParam, 10) : undefined;

		return {
			...(videoId ? { videoId } : {}),
			...(playlistId ? { playlistId } : {}),
			...(startTime !== null ? { startTime } : {}),
			...(index !== undefined && index > 0 ? { index } : {}),
		};
	} catch {
		return null;
	}
}

export function extractYoutubeId(url: string): string | null {
	const info = extractYoutubeInfo(url);
	return info?.videoId ?? info?.playlistId ?? null;
}

function normalizeYoutubeId(value: string): string | null {
	const id = value.trim();
	return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
}

function normalizeYoutubePlaylistId(value: string): string | null {
	const id = value.trim();
	return /^[a-zA-Z0-9_-]{2,}$/.test(id) ? id : null;
}

export function extractYoutubeStartTime(url: string): number | null {
	const match = url.match(/[?&#](?:t|start)=([^&#]+)/i);
	if (!match?.[1]) return null;

	const val = match[1].trim().toLowerCase();
	if (/^\d+s?$/.test(val)) return Number.parseInt(val.replace('s', ''), 10);

	const hms = val.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
	if (!hms) return null;

	const total = (Number.parseInt(hms[1] ?? '0', 10) * 3600) +
		(Number.parseInt(hms[2] ?? '0', 10) * 60) +
		Number.parseInt(hms[3] ?? '0', 10);
	return total > 0 ? total : null;
}

export function createYoutubeIframe(container: HTMLElement, url: string): HTMLIFrameElement | null {
	const info = extractYoutubeInfo(url);
	if (!info) return null;

	let src = '';
	const params = new URLSearchParams();

	if (info.videoId && info.playlistId) {
		src = `https://www.youtube.com/embed/${info.videoId}`;
		params.set('list', info.playlistId);
	} else if (info.playlistId) {
		src = 'https://www.youtube.com/embed/videoseries';
		params.set('list', info.playlistId);
	} else if (info.videoId) {
		src = `https://www.youtube.com/embed/${info.videoId}`;
	} else {
		return null;
	}

	if (info.startTime !== undefined && info.startTime >= 0) {
		params.set('start', info.startTime.toString());
	}
	if (info.index !== undefined && info.index > 0) {
		params.set('index', info.index.toString());
	}

	const queryString = params.toString();
	if (queryString) {
		src += `?${queryString}`;
	}

	return container.createEl('iframe', {
		cls: 'media-embed-youtube',
		attr: {
			src,
			allowfullscreen: '',
			allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
			loading: 'lazy',
		},
	});
}
