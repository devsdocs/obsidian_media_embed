export function extractSoundcloudUrl(url: string): string | null {
	try {
		const parsed = new URL(url.includes('://') ? url : `https://${url}`);
		const hostname = parsed.hostname.toLowerCase();

		if (!/(?:^|\.)soundcloud\.com$/.test(hostname)) return null;

		return parsed.toString();
	} catch {
		return null;
	}
}

export function createSoundcloudIframe(container: HTMLElement, url: string): HTMLIFrameElement | null {
	const scUrl = extractSoundcloudUrl(url);
	if (!scUrl) return null;

	const embedSrc = `https://w.soundcloud.com/player/?url=${encodeURIComponent(scUrl)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=true&show_user=true&show_reposts=false&show_teaser=false`;

	return container.createEl('iframe', {
		cls: 'media-embed-spotify',
		attr: {
			src: embedSrc,
			height: '166',
			allow: 'autoplay',
			loading: 'lazy',
		},
	});
}
