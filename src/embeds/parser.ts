import type { EmbedOptions } from '../types';

export interface ParsedEmbedBlock {
	url: string;
	options: EmbedOptions;
}

export function parseEmbedBlock(source: string): ParsedEmbedBlock {
	const lines = source.split('\n').map(l => l.trim()).filter(l => l.length > 0);
	if (lines.length === 0) {
		return { url: '', options: {} };
	}

	const firstLine = lines[0] ?? '';
	const options: EmbedOptions = {};
	let url = '';

	// 1. Check for wikilink format: [[path/to/file.ext]] height=600
	if (firstLine.startsWith('[[')) {
		const closingIdx = firstLine.indexOf(']]');
		if (closingIdx !== -1) {
			url = firstLine.slice(0, closingIdx + 2);
			const restOfLine = firstLine.slice(closingIdx + 2).trim();
			parseInlineOptions(restOfLine, options);
		} else {
			url = firstLine;
		}
	} else if (firstLine.startsWith('[')) {
		// 2. Check for markdown link format: [title](path/to/file.ext) height=600
		const mdMatch = firstLine.match(/^(\[.*?\]\(.*?\))\s*(.*)$/);
		if (mdMatch?.[1]) {
			url = mdMatch[1];
			parseInlineOptions(mdMatch[2] ?? '', options);
		} else {
			url = firstLine;
		}
	} else if (firstLine.startsWith('"') || firstLine.startsWith("'")) {
		// 3. Check for quoted string format: "path/to/file.ext" height=600
		const quoteChar = firstLine[0];
		const endQuoteIdx = firstLine.indexOf(quoteChar!, 1);
		if (endQuoteIdx !== -1) {
			url = firstLine.slice(1, endQuoteIdx);
			const restOfLine = firstLine.slice(endQuoteIdx + 1).trim();
			parseInlineOptions(restOfLine, options);
		} else {
			url = firstLine;
		}
	} else {
		// 4. Standard URL or unquoted path, checking for trailing options (e.g. url height=600 mode=click)
		const tokens = firstLine.split(/\s+/);
		let optionStartIndex = tokens.length;

		for (let i = tokens.length - 1; i >= 1; i--) {
			const token = tokens[i];
			if (token && /^(?:height|h|aspect|ratio|mode)=/i.test(token)) {
				optionStartIndex = i;
			} else {
				break;
			}
		}

		url = tokens.slice(0, optionStartIndex).join(' ');
		for (let i = optionStartIndex; i < tokens.length; i++) {
			const token = tokens[i];
			if (!token) continue;
			const [key, val] = token.split('=');
			if (key && val) {
				applyOption(options, key.toLowerCase(), val);
			}
		}
	}

	// 5. Multi-line parameters (lines 2+): height: 600px / aspect: 16/9 / mode: click
	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		if (!line) continue;

		const colonIdx = line.indexOf(':');
		const equalIdx = line.indexOf('=');

		if (colonIdx !== -1) {
			const key = line.slice(0, colonIdx).trim().toLowerCase();
			const val = line.slice(colonIdx + 1).trim();
			applyOption(options, key, val);
		} else if (equalIdx !== -1) {
			const key = line.slice(0, equalIdx).trim().toLowerCase();
			const val = line.slice(equalIdx + 1).trim();
			applyOption(options, key, val);
		}
	}

	return { url, options };
}

function parseInlineOptions(inlineStr: string, options: EmbedOptions): void {
	if (!inlineStr) return;
	const parts = inlineStr.split(/\s+/);
	for (const part of parts) {
		if (!part) continue;
		const [key, val] = part.split('=');
		if (key && val) {
			applyOption(options, key.toLowerCase(), val);
		}
	}
}

function applyOption(options: EmbedOptions, key: string, val: string): void {
	if (key === 'height' || key === 'h') {
		const num = val.replace(/px$/i, '').trim();
		if (/^\d+$/.test(num)) {
			options.height = num;
		}
	} else if (key === 'aspect' || key === 'ratio') {
		const clean = val.replace('/', ':');
		if (/^\d+[:/]\d+$/.test(clean) || /^\d+(\.\d+)?$/.test(clean)) {
			options.aspect = clean;
		}
	} else if (key === 'mode') {
		if (val.toLowerCase() === 'click' || val.toLowerCase() === 'lazy') {
			options.mode = 'click';
		} else if (val.toLowerCase() === 'auto' || val.toLowerCase() === 'direct') {
			options.mode = 'auto';
		}
	}
}
