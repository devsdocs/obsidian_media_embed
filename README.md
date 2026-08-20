# Stream Embed

Automatically convert pasted links into playable embedded players and interactive previews inside [Obsidian](https://obsidian.md).

## Compatibility

Requires Obsidian 1.13.0 or newer.

## Features

- **Seamless Paste** — Paste a link from Spotify, YouTube, Google Drive, Vimeo, Loom, Figma, SoundCloud, Twitch, CodePen, or local vault files on an empty line to instantly create an embed block.
- **Local Media Support** — Embed local vault files and direct media across all platforms (Desktop & Mobile):
  - **PDF Documents**: `.pdf` with full document viewer, pagination, and zoom controls.
  - **Local Video**: `.mp4`, `.webm`, `.ogv`, `.mov`, `.m4v`, `.mkv`, `.avi` with HTML5 video player, fullscreen, and inline playback.
  - **Local Audio**: `.mp3`, `.wav`, `.ogg`, `.m4a`, `.flac`, `.aac`, `.opus`, `.wma` with native audio controls.
  - **Flexible Linking**: Supports wikilinks (`[[document.pdf]]`), markdown links (`[Video](video.mp4)`), and vault-relative paths.
- **Hover Action Bar** — Hover over any embed to quickly copy the URL (📋), open the file or web link (↗), or maximize it into a full-window modal (⤢).
- **Click-to-Load Mode** — Optional performance and privacy mode that renders a lightweight preview card and loads the iframe only when clicked.
- **Inline Options Override** — Customize height, aspect ratio, or click mode per block directly inside markdown.
- **Command Palette Integration** — Quickly convert links under cursor or selections into embed blocks via commands.
- **Multi-Platform Portfolio**:
  - **Spotify**: Tracks, albums, playlists, artists, episodes, shows.
  - **YouTube**: Videos, playlists, shorts, live streams, embeds, timestamps.
  - **Google Drive & Workspace**: PDFs, videos, audio, images, Docs, Sheets, Slides, Forms, Drawings, Folders.
  - **Local Vault Media**: PDF documents, videos, audio files.
  - **Vimeo & Loom**: High-definition video walkthroughs and screen recordings.
  - **Figma & FigJam**: Live UI designs, prototypes, and whiteboards.
  - **SoundCloud**: Audio tracks and podcasts.
  - **Twitch**: Live streams, video vods, and clips.
  - **CodePen**: Live code snippets and web playgrounds.

---

## Usage

### Auto Paste
1. Copy a link from any supported platform or a local file wikilink (e.g., `[[sample.mp4]]`).
2. Paste it on a **blank line** in your Obsidian editor.
3. The plugin automatically converts it into an `embed` block and renders it in **Live Preview** and **Reading View**.

### Local Media Embeds
Embed local PDF, video, and audio files easily using wikilinks or relative paths:

````markdown
```embed
[[document.pdf]]
height: 650px
```

```embed
[[recording.mp4]]
aspect: 16/9
```

```embed
[[podcast.mp3]]
```
````

### Manual & Custom Block Options
You can customize height, aspect ratio, or load mode per block:

````markdown
```embed
https://drive.google.com/file/d/1ABC123xyz_456-789/view
height: 700px
```

```embed
https://vimeo.com/123456789
aspect: 16/9
mode: click
```
````

Shorthand single-line format:
````markdown
```embed
[[lecture.mp4]] height=450 mode=click
```
````

---

## Commands

Access via **Ctrl/Cmd + P** (Command Palette):

| Command | Description |
|---|---|
| `Stream Embed: Convert link under Cursor to embed block` | Wraps link or local media under editor cursor into an embed block |
| `Stream Embed: Convert selection to embed block` | Converts selected link text to an embed block |
| `Stream Embed: Toggle click-to-load mode` | Toggles globally between direct iframe loading and click-to-load cards |

---

## Settings

Configurable in **Settings → Stream Embed**:

| Setting | Description | Default |
|---|---|---|
| **Spotify embed height** | Default height of Spotify embeds in pixels. | `352` |
| **PDF embed height** | Default height of PDF embeds in pixels. | `600` |
| **Google Drive embed height** | Default height of Google Drive/Docs embeds in pixels. | `480` |
| **Default embed height** | Default height for other embeds in pixels. | `480` |
| **Default embed mode** | Direct auto embed or click-to-load card. | `Auto` |
| **Enable click-to-load mode** | Displays preview cards and loads iframes only on click. | `Disabled` |
| **Show hover action bar** | Shows action toolbar (Copy, Open, Fullscreen) on hover. | `Enabled` |

---

## Installation

### From community plugins

1. Open **Settings → Community plugins**.
2. Select **Browse** and search for **Stream Embed**.
3. Select **Install**, then **Enable**.

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/devsdocs/obsidian_media_embed/releases).
2. Create a folder named `stream-embed` inside your vault's `.obsidian/plugins/` directory.
3. Place the downloaded files inside the new folder.
4. Open **Settings → Community plugins** and enable **Stream Embed**.

---

## Development

```bash
npm install
npm run dev    # watch mode
npm run build  # production build
npm run lint   # lint
```

## License

[MIT](LICENSE)
