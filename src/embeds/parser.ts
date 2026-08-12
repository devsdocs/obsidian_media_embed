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
	const parts = firstLine.split(/\s+/);
	const url = parts[0] ?? '';

	const options: EmbedOptions = {};

	// 1. Check for single-line space parameters: height=600 aspect=16/9 mode=click
	for (let i = 1; i < parts.length; i++) {
		const part = parts[i];
		if (!part) continue;
		const [key, val] = part.split('=');
		if (key && val) {
			applyOption(options, key.toLowerCase(), val);
		}
	}

	// 2. Check for multi-line parameters: height: 600px / aspect: 16/9 / mode: click
	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		if (!line) continue;
		const colonIdx = line.indexOf(':');
		if (colonIdx !== -1) {
			const key = line.slice(0, colonIdx).trim().toLowerCase();
			const val = line.slice(colonIdx + 1).trim();
			applyOption(options, key, val);
		}
	}

	return { url, options };
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
