const SPOTIFY_TYPES = ['track', 'album', 'playlist', 'artist', 'episode', 'show'];

export function extractSpotifyInfo(url: string): { type: string; id: string } | null {
	try {
		const parsed = new URL(url.includes('://') ? url : `https://${url}`);
		if (parsed.hostname.toLowerCase() !== 'open.spotify.com') return null;

		const pathParts = parsed.pathname.split('/').filter(p => p.length > 0);
		if (pathParts.length < 2) return null;

		let i = 0;
		while (i < pathParts.length - 1) {
			const part = pathParts[i];
			if (part === 'embed' || part?.startsWith('intl-')) {
				i++;
			} else {
				break;
			}
		}

		const type = pathParts[i];
		const id = pathParts[i + 1];
		if (type && id && SPOTIFY_TYPES.includes(type)) {
			return { type, id };
		}
		return null;
	} catch {
		return null;
	}
}

export function createSpotifyIframe(container: HTMLElement, url: string, height: string): HTMLIFrameElement | null {
	const info = extractSpotifyInfo(url);
	if (!info) return null;

	return container.createEl('iframe', {
		cls: 'media-embed-spotify',
		attr: {
			src: `https://open.spotify.com/embed/${info.type}/${info.id}`,
			height,
			allowfullscreen: '',
			allow: 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture',
			loading: 'lazy',
		},
	});
}
