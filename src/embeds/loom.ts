export function extractLoomId(url: string): string | null {
	try {
		const parsed = new URL(url.includes('://') ? url : `https://${url}`);
		const hostname = parsed.hostname.toLowerCase();

		if (!/(?:^|\.)loom\.com$/.test(hostname)) return null;

		const pathname = parsed.pathname;
		const parts = pathname.split('/').filter(p => p.length > 0);

		if (parts[0] === 'share' || parts[0] === 'embed') {
			const id = parts[1] ?? '';
			return /^[a-zA-Z0-9_-]+$/.test(id) ? id : null;
		}

		return null;
	} catch {
		return null;
	}
}

export function createLoomIframe(container: HTMLElement, url: string): HTMLIFrameElement | null {
	const loomId = extractLoomId(url);
	if (!loomId) return null;

	return container.createEl('iframe', {
		cls: 'media-embed-youtube', // Responsive 16:9 aspect ratio
		attr: {
			src: `https://www.loom.com/embed/${loomId}`,
			allowfullscreen: '',
			allow: 'autoplay; fullscreen',
			loading: 'lazy',
		},
	});
}
