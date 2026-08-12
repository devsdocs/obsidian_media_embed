export function extractVimeoId(url: string): string | null {
	try {
		const parsed = new URL(url.includes('://') ? url : `https://${url}`);
		const hostname = parsed.hostname.toLowerCase();

		if (!/(?:^|\.)vimeo\.com$/.test(hostname)) return null;

		const pathname = parsed.pathname;

		if (pathname.startsWith('/video/')) {
			const id = pathname.split('/')[2] ?? '';
			return /^\d+$/.test(id) ? id : null;
		}

		const match = pathname.match(/\/(\d+)(?:[/?#]|$)/);
		if (match?.[1]) {
			return match[1];
		}

		return null;
	} catch {
		return null;
	}
}

export function createVimeoIframe(container: HTMLElement, url: string): HTMLIFrameElement | null {
	const videoId = extractVimeoId(url);
	if (!videoId) return null;

	return container.createEl('iframe', {
		cls: 'media-embed-youtube', // Uses 16:9 aspect ratio styling
		attr: {
			src: `https://player.vimeo.com/video/${videoId}`,
			allowfullscreen: '',
			allow: 'autoplay; fullscreen; picture-in-picture',
			loading: 'lazy',
		},
	});
}
