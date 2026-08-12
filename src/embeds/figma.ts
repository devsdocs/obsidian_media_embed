export function extractFigmaUrl(url: string): string | null {
	try {
		const parsed = new URL(url.includes('://') ? url : `https://${url}`);
		const hostname = parsed.hostname.toLowerCase();

		if (!/(?:^|\.)figma\.com$/.test(hostname)) return null;

		const pathname = parsed.pathname;
		if (/^\/(?:file|design|board|proto|deck)\//.test(pathname)) {
			return parsed.toString();
		}

		return null;
	} catch {
		return null;
	}
}

export function createFigmaIframe(container: HTMLElement, url: string, height: string): HTMLIFrameElement | null {
	const figmaUrl = extractFigmaUrl(url);
	if (!figmaUrl) return null;

	const embedSrc = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(figmaUrl)}`;

	return container.createEl('iframe', {
		cls: 'media-embed-gdrive',
		attr: {
			src: embedSrc,
			height,
			allowfullscreen: '',
			loading: 'lazy',
		},
	});
}
