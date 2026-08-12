export function extractYoutubeId(url: string): string | null {
	try {
		const parsed = new URL(url.includes('://') ? url : `https://${url}`);
		const hostname = parsed.hostname.toLowerCase();

		if (!/(?:^|\.)youtube\.com$|(?:^|\.)youtu\.be$/.test(hostname)) return null;

		if (/youtu\.be$/.test(hostname)) {
			return normalizeYoutubeId(parsed.pathname.slice(1).split(/[/?#]/)[0] ?? '');
		}

		const path = parsed.pathname;
		if (path.startsWith('/shorts/')) return normalizeYoutubeId(path.split('/')[2] ?? '');
		if (path.startsWith('/embed/')) return normalizeYoutubeId(path.split('/')[2] ?? '');
		if (path.startsWith('/live/')) return normalizeYoutubeId(path.split('/')[2] ?? '');
		if (path === '/watch' || path === '/watch/') return normalizeYoutubeId(parsed.searchParams.get('v') ?? '');

		return null;
	} catch {
		return null;
	}
}

function normalizeYoutubeId(value: string): string | null {
	const id = value.trim();
	return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
}

export function extractYoutubeStartTime(url: string): number | null {
	const match = url.match(/[?&#](?:t|start)=([^&#]+)/i);
	if (!match?.[1]) return null;

	const val = match[1].trim().toLowerCase();
	if (/^\d+$/.test(val)) return Number.parseInt(val, 10);

	const hms = val.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
	if (!hms) return null;

	const total = (Number.parseInt(hms[1] ?? '0', 10) * 3600) +
		(Number.parseInt(hms[2] ?? '0', 10) * 60) +
		Number.parseInt(hms[3] ?? '0', 10);
	return total > 0 ? total : null;
}

export function createYoutubeIframe(container: HTMLElement, url: string): HTMLIFrameElement | null {
	const videoId = extractYoutubeId(url);
	if (!videoId) return null;

	const startTime = extractYoutubeStartTime(url);
	let src = `https://www.youtube.com/embed/${videoId}`;
	if (startTime !== null && startTime >= 0) {
		src += `?start=${startTime}`;
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
