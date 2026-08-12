export function extractGDriveEmbedUrl(url: string): string | null {
	try {
		const parsed = new URL(url.includes('://') ? url : `https://${url}`);
		const hostname = parsed.hostname.toLowerCase();

		if (!/(?:^|\.)drive\.google\.com$|(?:^|\.)docs\.google\.com$/.test(hostname)) {
			return null;
		}

		const pathname = parsed.pathname;

		// 1. drive.google.com file link: /file/d/{ID}/...
		const driveFileMatch = pathname.match(/^\/file\/d\/([a-zA-Z0-9_-]+)/);
		if (driveFileMatch?.[1]) {
			return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
		}

		// 2. drive.google.com open/uc link: /open?id={ID} or /uc?id={ID}
		if (pathname.startsWith('/open') || pathname.startsWith('/uc')) {
			const id = parsed.searchParams.get('id');
			if (id && /^[a-zA-Z0-9_-]+$/.test(id)) {
				return `https://drive.google.com/file/d/${id}/preview`;
			}
		}

		// 3. drive.google.com folder link: /drive/folders/{ID} or /drive/u/0/folders/{ID}
		const folderMatch = pathname.match(/^\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/);
		if (folderMatch?.[1]) {
			return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#list`;
		}

		// 4. drive.google.com embeddedfolderview link
		if (pathname.startsWith('/embeddedfolderview')) {
			const id = parsed.searchParams.get('id');
			if (id && /^[a-zA-Z0-9_-]+$/.test(id)) {
				const hash = parsed.hash || '#list';
				return `https://drive.google.com/embeddedfolderview?id=${id}${hash}`;
			}
		}

		// 5. docs.google.com document: /document/d/{ID}/...
		const docMatch = pathname.match(/^\/document\/d\/([a-zA-Z0-9_-]+)/);
		if (docMatch?.[1]) {
			return `https://docs.google.com/document/d/${docMatch[1]}/preview`;
		}

		// 6. docs.google.com spreadsheet: /spreadsheets/d/{ID}/...
		const sheetMatch = pathname.match(/^\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
		if (sheetMatch?.[1]) {
			const hash = parsed.hash;
			return `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/preview${hash}`;
		}

		// 7. docs.google.com presentation: /presentation/d/{ID}/...
		const slideMatch = pathname.match(/^\/presentation\/d\/([a-zA-Z0-9_-]+)/);
		if (slideMatch?.[1]) {
			return `https://docs.google.com/presentation/d/${slideMatch[1]}/embed`;
		}

		// 8. docs.google.com forms: /forms/d/e/{ID}/... or /forms/d/{ID}/...
		const formMatch = pathname.match(/^\/forms\/d\/(?:e\/)?([a-zA-Z0-9_-]+)/);
		if (formMatch?.[1]) {
			const isE = pathname.includes('/forms/d/e/');
			const prefix = isE ? '/forms/d/e/' : '/forms/d/';
			return `https://docs.google.com${prefix}${formMatch[1]}/viewform?embedded=true`;
		}

		// 9. docs.google.com drawings: /drawings/d/{ID}/...
		const drawingMatch = pathname.match(/^\/drawings\/d\/([a-zA-Z0-9_-]+)/);
		if (drawingMatch?.[1]) {
			return `https://docs.google.com/drawings/d/${drawingMatch[1]}/preview`;
		}

		// 10. docs.google.com vids: /vids/d/{ID}/...
		const vidsMatch = pathname.match(/^\/vids\/d\/([a-zA-Z0-9_-]+)/);
		if (vidsMatch?.[1]) {
			return `https://docs.google.com/vids/d/${vidsMatch[1]}/preview`;
		}

		return null;
	} catch {
		return null;
	}
}

export function createGDriveIframe(container: HTMLElement, url: string, height: string): HTMLIFrameElement | null {
	const embedUrl = extractGDriveEmbedUrl(url);
	if (!embedUrl) return null;

	return container.createEl('iframe', {
		cls: 'media-embed-gdrive',
		attr: {
			src: embedUrl,
			height,
			allowfullscreen: '',
			allow: 'autoplay; encrypted-media; fullscreen',
			loading: 'lazy',
		},
	});
}
