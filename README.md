# Obsidian Spotify Embed

Automatically convert pasted Spotify links into playable iframe embeds inside [Obsidian](https://obsidian.md).

## Features

- **Seamless Paste**: Paste a Spotify link on an empty line in your note, and it will instantly transform into an interactive Spotify widget.
- **Support for multiple types**: Supports links for tracks, albums, playlists, artists, episodes, and shows.
- **Customizable**: Choose between a raw `iframe` or a responsive `div` wrapper.
- **Adjustable Height**: Configure the embed height in settings to match the standard Spotify player (352px) or the compact player (152px).

## Usage

1. Copy a link from Spotify (e.g., `https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT`).
2. Paste it on a **blank line** in your Obsidian editor.
3. The plugin will instantly replace the link with the embed widget code.

## Settings

You can customize the embed format in **Settings -> Spotify Embed**:

- **Embed Style**: Choose `Iframe` for a direct HTML embed, or `Div` for a responsive wrapper around the iframe.
- **Embed height**: Define the height in pixels. Common values are `352` for the normal player and `152` for the compact one.

## Installation

### From Obsidian Community Plugins (Coming Soon)
Once approved, you will be able to install this plugin directly from within Obsidian:
1. Open Obsidian **Settings** -> **Community plugins**.
2. Turn off Safe Mode.
3. Click **Browse** and search for "Spotify Embed".
4. Click Install, then Enable.

### Manual Installation
1. Download the latest release (`main.js` and `manifest.json`) from the [Releases](https://github.com/devsdocs/obsidian_spotify_embed/releases) page.
2. Create a folder named `obsidian-spotify-embed` inside your vault's `.obsidian/plugins/` directory.
3. Place `main.js` and `manifest.json` inside the new folder.
4. Open Obsidian **Settings** -> **Community plugins**, turn off Safe Mode, and enable the plugin.

## Development

Clone this repository and run `npm install`.

- `npm run dev`: Start development with auto-rebuild.
- `npm run build`: Build for production.

## License

MIT License
