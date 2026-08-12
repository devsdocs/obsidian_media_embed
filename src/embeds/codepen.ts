export interface CodepenInfo {
	user: string;
	id: string;
}

export function extractCodepenInfo(url: string): CodepenInfo | null {
	try {
		const parsed = new URL(url.includes('://') ? url : `https://${url}`);
		if (parsed.hostname.toLowerCase() !== 'codepen.io') return null;

		const parts = parsed.pathname.split('/').filter(p => p.length > 0);
		if (parts.length >= 3 && (parts[1] === 'pen' || parts[1] === 'full' || parts[1] === 'embed')) {
			const user = parts[0] ?? '';
			const id = parts[2] ?? '';
			if (user && id) {
				return { user, id };
			}
		}

		return null;
	} catch {
		return null;
	}
}

export function createCodepenIframe(container: HTMLElement, url: string, height: string): HTMLIFrameElement | null {
	const info = extractCodepenInfo(url);
	if (!info) return null;

	const src = `https://codepen.io/${info.user}/embed/${info.id}?default-tab=result`;

	return container.createEl('iframe', {
		cls: 'media-embed-gdrive',
		attr: {
			src,
			height,
			allowfullscreen: '',
			loading: 'lazy',
		},
	});
}
