import assert from 'node:assert';
import { extractSpotifyInfo } from '../src/embeds/spotify';
import { extractYoutubeId, extractYoutubeInfo, extractYoutubeStartTime, isYoutubeVideoAndPlaylist } from '../src/embeds/youtube';
import { extractGDriveEmbedUrl } from '../src/embeds/gdrive';
import { extractVimeoId } from '../src/embeds/vimeo';
import { extractLoomId } from '../src/embeds/loom';
import { extractFigmaUrl } from '../src/embeds/figma';
import { extractSoundcloudUrl } from '../src/embeds/soundcloud';
import { extractTwitchInfo } from '../src/embeds/twitch';
import { extractCodepenInfo } from '../src/embeds/codepen';
import { parseEmbedBlock } from '../src/embeds/parser';
import { detectMedia } from '../src/embeds/index';

console.log('Running embed URL verification tests...');

// 1. Spotify tests
assert.deepStrictEqual(
	extractSpotifyInfo('https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT'),
	{ type: 'track', id: '4cOdK2wGLETKBW3PvgPWqT' }
);
assert.deepStrictEqual(
	extractSpotifyInfo('https://open.spotify.com/embed/album/12345'),
	{ type: 'album', id: '12345' }
);

// 2. YouTube tests
assert.strictEqual(
	extractYoutubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
	'dQw4w9WgXcQ'
);
assert.strictEqual(
	extractYoutubeId('https://youtu.be/dQw4w9WgXcQ'),
	'dQw4w9WgXcQ'
);
assert.strictEqual(
	extractYoutubeStartTime('https://youtu.be/dQw4w9WgXcQ?t=2m30s'),
	150
);
assert.strictEqual(
	extractYoutubeStartTime('https://youtu.be/dQw4w9WgXcQ?t=90s'),
	90
);
assert.deepStrictEqual(
	extractYoutubeInfo('https://www.youtube.com/playlist?list=PLrAXtmErZgOdP_8GztsuKi9nrraNbKKp4'),
	{ playlistId: 'PLrAXtmErZgOdP_8GztsuKi9nrraNbKKp4' }
);
assert.deepStrictEqual(
	extractYoutubeInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLrAXtmErZgOdP_8GztsuKi9nrraNbKKp4&index=3'),
	{ videoId: 'dQw4w9WgXcQ', playlistId: 'PLrAXtmErZgOdP_8GztsuKi9nrraNbKKp4', index: 3 }
);
assert.strictEqual(
	isYoutubeVideoAndPlaylist(extractYoutubeInfo('https://www.youtube.com/watch?v=r6WKmIJPC9E&list=PLWSprlbiwBMM')),
	true
);
assert.strictEqual(
	isYoutubeVideoAndPlaylist(extractYoutubeInfo('https://www.youtube.com/watch?v=r6WKmIJPC9E')),
	false
);
assert.strictEqual(
	isYoutubeVideoAndPlaylist(extractYoutubeInfo('https://www.youtube.com/playlist?list=PLWSprlbiwBMM')),
	false
);
assert.deepStrictEqual(
	detectMedia('https://www.youtube.com/playlist?list=PLrAXtmErZgOdP_8GztsuKi9nrraNbKKp4'),
	{ platform: 'youtube', url: 'https://www.youtube.com/playlist?list=PLrAXtmErZgOdP_8GztsuKi9nrraNbKKp4' }
);

// 3. Google Drive / Docs tests
assert.strictEqual(
	extractGDriveEmbedUrl('https://drive.google.com/file/d/1ABC123xyz_456-789/view?usp=sharing'),
	'https://drive.google.com/file/d/1ABC123xyz_456-789/preview'
);
assert.strictEqual(
	extractGDriveEmbedUrl('https://docs.google.com/document/d/1ABC123xyz_456-789/edit?usp=sharing'),
	'https://docs.google.com/document/d/1ABC123xyz_456-789/preview'
);

// 4. Extended Platforms tests
assert.strictEqual(
	extractVimeoId('https://vimeo.com/123456789'),
	'123456789'
);
assert.strictEqual(
	extractLoomId('https://www.loom.com/share/abc123def456'),
	'abc123def456'
);
assert.ok(
	extractFigmaUrl('https://www.figma.com/design/abc123/My-Design') !== null
);
assert.ok(
	extractSoundcloudUrl('https://soundcloud.com/artist/track') !== null
);
assert.deepStrictEqual(
	extractTwitchInfo('https://www.twitch.tv/videos/123456789'),
	{ type: 'video', id: '123456789' }
);
assert.deepStrictEqual(
	extractCodepenInfo('https://codepen.io/user/pen/abc1234'),
	{ user: 'user', id: 'abc1234' }
);

// 5. parseEmbedBlock options parser tests
const parsedInline = parseEmbedBlock('https://drive.google.com/file/d/123/view height=600 aspect=16:9 mode=click');
assert.strictEqual(parsedInline.url, 'https://drive.google.com/file/d/123/view');
assert.strictEqual(parsedInline.options.height, '600');
assert.strictEqual(parsedInline.options.aspect, '16:9');
assert.strictEqual(parsedInline.options.mode, 'click');

const parsedMultiline = parseEmbedBlock('https://vimeo.com/123456789\nheight: 500px\nmode: auto');
assert.strictEqual(parsedMultiline.url, 'https://vimeo.com/123456789');
assert.strictEqual(parsedMultiline.options.height, '500');
assert.strictEqual(parsedMultiline.options.mode, 'auto');

// 6. detectMedia tests
assert.deepStrictEqual(
	detectMedia('https://vimeo.com/123456789'),
	{ platform: 'vimeo', url: 'https://vimeo.com/123456789' }
);

console.log('All tests passed successfully!');
