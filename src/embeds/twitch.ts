export interface TwitchInfo {
	type: 'video' | 'clip' | 'channel';
	id: string;
}

export function extractTwitchInfo(url: string): TwitchInfo | null {
	try {
		const parsed = new URL(url.includes('://') ? url : `https://${url}`);
		const hostname = parsed.hostname.toLowerCase();

		if (!/(?:^|\.)twitch\.tv$/.test(hostname)) return null;

		const pathname = parsed.pathname;

		if (hostname.includes('clips.twitch.tv')) {
			const clipId = pathname.slice(1).split('/')[0];
			if (clipId) return { type: 'clip', id: clipId };
		}

		if (pathname.startsWith('/videos/')) {
			const videoId = pathname.split('/')[2];
			if (videoId) return { type: 'video', id: videoId };
		}

		if (pathname.includes('/clip/')) {
			const clipId = pathname.split('/clip/')[1]?.split('/')[0];
			if (clipId) return { type: 'clip', id: clipId };
		}

		const channel = pathname.slice(1).split('/')[0];
		if (channel && !['directory', 'downloads', 'p', 'wallet'].includes(channel)) {
			return { type: 'channel', id: channel };
		}

		return null;
	} catch {
		return null;
	}
}

export function createTwitchIframe(container: HTMLElement, url: string): HTMLIFrameElement | null {
	const info = extractTwitchInfo(url);
	if (!info) return null;

	let src = '';
	const parent = typeof window !== 'undefined' ? window.location.hostname || 'localhost' : 'localhost';

	if (info.type === 'video') {
		src = `https://player.twitch.tv/?video=${info.id}&parent=${parent}&autoplay=false`;
	} else if (info.type === 'clip') {
		src = `https://clips.twitch.tv/embed?clip=${info.id}&parent=${parent}&autoplay=false`;
	} else {
		src = `https://player.twitch.tv/?channel=${info.id}&parent=${parent}&autoplay=false`;
	}

	return container.createEl('iframe', {
		cls: 'media-embed-youtube',
		attr: {
			src,
			allowfullscreen: '',
			allow: 'autoplay; fullscreen',
			loading: 'lazy',
		},
	});
}
