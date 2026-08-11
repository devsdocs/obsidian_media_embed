# Obsidian Media Embed

Automatically convert pasted Spotify and YouTube links into playable embedded players inside [Obsidian](https://obsidian.md).

## Features

- **Seamless paste** — Paste a Spotify or YouTube link on an empty line and it instantly becomes a playable embed.
- **Spotify** — Tracks, albums, playlists, artists, episodes, and shows.
- **YouTube** — Regular videos, shorts, live streams, embeds, and timestamped links.
- **Customizable** — Configure the Spotify embed height in settings. YouTube uses a responsive 16:9 aspect ratio.

## Usage

1. Copy a link from Spotify or YouTube.
2. Paste it on a **blank line** in your Obsidian editor.
3. The plugin wraps it in an `embed` code block and renders it as a player in **Live Preview** and **Reading View**.

### Manual embed

You can also create an embed code block manually:

````
```embed
https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
```
````

````
```embed
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```
````

### Supported URL formats

**Spotify**

- `https://open.spotify.com/track/...`
- `https://open.spotify.com/album/...`
- `https://open.spotify.com/playlist/...`
- `https://open.spotify.com/artist/...`
- `https://open.spotify.com/episode/...`
- `https://open.spotify.com/show/...`
- URLs with `/embed/` or `/intl-*/` prefixes are also supported.

**YouTube**

- `https://www.youtube.com/watch?v=...`
- `https://youtu.be/...`
- `https://www.youtube.com/shorts/...`
- `https://www.youtube.com/live/...`
- `https://www.youtube.com/embed/...`
- Timestamps (`?t=120`, `?t=2m30s`) are preserved.

## Settings

Configurable in **Settings → Media Embed**:

| Setting | Description | Default |
|---|---|---|
| Embed height | Height of Spotify embeds in pixels. YouTube uses a 16:9 aspect ratio instead. | `352` |

Common Spotify height values: `352` (normal player), `152` (compact player).

## Installation

### From community plugins

1. Open **Settings → Community plugins**.
2. Select **Browse** and search for **Media Embed**.
3. Select **Install**, then **Enable**.

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/devsdocs/obsidian_media_embed/releases).
2. Create a folder named `obsidian-media-embed` inside your vault's `.obsidian/plugins/` directory.
3. Place the downloaded files inside the new folder.
4. Open **Settings → Community plugins** and enable **Media Embed**.

## Development

```bash
npm install
npm run dev    # watch mode
npm run build  # production build
npm run lint   # lint
```

## License

[MIT](LICENSE)
