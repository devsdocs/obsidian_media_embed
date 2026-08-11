# Obsidian Media Embed

Automatically convert pasted Spotify and YouTube links into playable embedded players inside [Obsidian](https://obsidian.md).

## Features

- **Seamless paste**: Paste a Spotify or YouTube link on an empty line — it instantly becomes a playable embed.
- **Spotify support**: Tracks, albums, playlists, artists, episodes, and shows.
- **YouTube support**: Regular videos, shorts, live streams, and timestamped links.
- **Customizable height**: Configure the Spotify embed height in settings (YouTube uses a 16:9 aspect ratio).

## Usage

1. Copy a link from Spotify or YouTube.
2. Paste it on a **blank line** in your Obsidian editor.
3. The plugin wraps it in an `embed` code block and renders it as a player in Reading View / Live Preview.

You can also manually create an embed code block:

````
```embed
https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
```
````

## Settings

Configurable in **Settings → Media Embed**:

- **Embed height**: Height of Spotify embeds in pixels. Common values are `352` (normal) and `152` (compact). YouTube embeds use a responsive 16:9 aspect ratio.

## Installation

### From Obsidian Community Plugins (Coming Soon)
1. Open Obsidian **Settings** → **Community plugins**.
2. Turn off Safe Mode.
3. Click **Browse** and search for "Media Embed".
4. Click Install, then Enable.

### Manual Installation
1. Download the latest release (`main.js` and `manifest.json`) from the [Releases](https://github.com/devsdocs/obsidian_media_embed/releases) page.
2. Create a folder named `obsidian-media-embed` inside your vault's `.obsidian/plugins/` directory.
3. Place `main.js` and `manifest.json` inside the new folder.
4. Open Obsidian **Settings** → **Community plugins**, turn off Safe Mode, and enable the plugin.

## Development

```bash
npm install
npm run dev    # watch mode
npm run build  # production build
```

## License

MIT License
