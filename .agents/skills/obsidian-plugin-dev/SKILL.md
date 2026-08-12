---
name: obsidian-plugin-dev
description: >-
  Comprehensive guide, architectural patterns, UI/UX rules, CSS guidelines, security, developer policies, declarative vs imperative settings API rules, and release workflow for Obsidian Community Plugin development.
  Use when creating, editing, styling, debugging, refactoring, building settings tabs, or publishing Obsidian plugins.
---

# Obsidian Community Plugin Development Guide

This skill provides an end-to-end reference for building, styling, testing, and releasing Obsidian Community Plugins in TypeScript, adhering strictly to the official [Obsidian Developer Documentation](https://docs.obsidian.md).

---

## 1. Project Architecture & Code Organization

Keep `main.ts` lightweight and focused exclusively on plugin lifecycle (`onload`, `onunload`) and registering components.

### Recommended File Structure

```text
src/
  main.ts           # Plugin entry point & lifecycle management
  settings.ts       # PluginSettingTab interface and defaults
  types.ts          # TypeScript interfaces, types, and DEFAULT_SETTINGS
  commands/         # Command implementations (Sentence case IDs/names)
    index.ts
  embeds/           # Domain/feature logic modules (parsers, renderers)
    index.ts
  ui/               # UI components, modals, and views
    modal.ts
styles.css          # Scoped CSS styles (prefixed classes only)
manifest.json       # Plugin manifest metadata
versions.json       # Version to minAppVersion mapping
esbuild.config.mjs  # Esbuild bundling configuration
```

---

## 2. Manifest & Versioning Requirements

### Manifest (`manifest.json`)
- **`id`**: Unique, stable plugin ID matching folder name in vault (never change after initial release). Must not contain `obsidian`.
- **`version`**: Strict SemVer `x.y.z` (e.g. `1.1.4`).
- **`minAppVersion`**: Minimum Obsidian app build version required.
- **`description`**:
  - Max 250 characters. Must end with a period `.`.
  - Start with an action verb (e.g. *"Convert pasted Spotify links into embedded players."*).
  - Do NOT start with "This is a plugin" or "Automatically convert...".
  - No emojis or special characters.
  - Proper noun capitalization ("Obsidian", "Markdown", "Spotify", "YouTube", "Google Drive").
- **`isDesktopOnly`**: `false` unless Node.js (`fs`, `os`, `child_process`) or Electron APIs are required.
- **`fundingUrl`**: Include only if accepting donations via GitHub Sponsors / Buy Me A Coffee; omit otherwise.

### Version Mapping (`versions.json`)
- Maps every plugin release version to its required `minAppVersion`:
  ```json
  {
    "1.0.0": "1.0.0",
    "1.1.0": "1.0.0",
    "1.1.4": "1.0.0"
  }
  ```

---

## 3. UI, Copy & Settings Guidelines

### UI Text & Copy Rules
- **Sentence Case**: All UI text (buttons, labels, setting names, descriptions, commands) MUST use [Sentence case](https://help.obsidian.md/Contributing+to+Obsidian/Style+guide), except for proper nouns.
- **Commands**:
  - Do NOT prefix command IDs with plugin ID (Obsidian automatically prefixes command IDs).
  - Use `editorCallback` for Markdown editor commands; use `callback` for unconditional commands.

### Settings Tab Rules (`PluginSettingTab`)
- **Declarative vs. Imperative API**:
  - On Obsidian 1.13.0+, if `getSettingDefinitions()` is declared on `PluginSettingTab`, Obsidian **bypasses `display()` completely**.
  - Do NOT define an incomplete `getSettingDefinitions()` when using the imperative `display()` method with `new Setting(containerEl)` controls; doing so causes setting tabs to render completely empty!
- **No Top-Level Headings**: Do NOT add a top-level `setHeading()` (such as "General" or plugin name) if the settings tab contains only one section.
- **Avoid "Settings" in Headings**: Use "Advanced" instead of "Advanced settings".
- **Native Setting Layout**: Rely on Obsidian's `Setting` class methods (`addToggle`, `addText`, `addDropdown`, `addButton`).
- **Stable Control Lifecycle**: Do NOT invoke `this.display()` inside `onChange()` handlers; re-rendering `containerEl.empty()` during user interaction unmounts controls mid-click/keystroke.

---

## 4. Styling & CSS Guidelines (`styles.css`)

- **Class Namespacing**: Prefix ALL custom CSS classes with your plugin identifier (e.g., `.media-embed-card`, `.media-embed-action-btn`).
- **No `!important` Flags**: Never use `!important` in `styles.css`. Increase selector specificity or use CSS variables instead.
- **No Core UI Overrides**: Do NOT override core Obsidian layout classes (`.setting-item`, `.setting-item-name`, `.setting-item-description`, `.setting-item-control`). Allow standard Obsidian themes to style setting items natively.
- **Obsidian CSS Variables**: Always use native Obsidian theme CSS variables for colors, borders, and backgrounds:
  - `var(--text-normal)`
  - `var(--text-muted)`
  - `var(--background-secondary)`
  - `var(--background-modifier-border)`
  - `var(--background-modifier-form-field)`
  - `var(--interactive-accent)`
  - `var(--interactive-hover)`

---

## 5. Security, Privacy & Developer Policies

- **No Remote Code Execution**: Do NOT fetch and evaluate remote scripts or auto-update plugin code outside of official GitHub releases.
- **No Telemetry / Dynamic Ads**: No client-side telemetry or dynamic ads.
- **DOM Construction Safety**: NEVER use `innerHTML`, `outerHTML`, or `insertAdjacentHTML` with dynamic strings. Always use `createEl()`, `createDiv()`, `createSpan()`, or `el.empty()`.
- **Web API Preference**: Use Web APIs (`SubtleCrypto`, `navigator.clipboard`, `requestUrl`) over Node.js equivalents for mobile compatibility.
- **Vault Operations**: Prefer `app.vault.getFileByPath()` over iterating all files; use `Editor` API for active note edits; use `Vault.process()` for background modifications.

---

## 6. Resource Management & Cleanup

- **Resource Lifecycle**: Register all event listeners, intervals, DOM events, and markdown code block processors via plugin helpers so they are automatically cleaned up on unload:
  - `this.registerEvent(...)`
  - `this.registerDomEvent(...)`
  - `this.registerInterval(...)`
  - `this.registerMarkdownCodeBlockProcessor(...)`

---

## 7. Release & GitHub Publishing Workflow

When preparing and publishing a release:

1. **Version Alignment**:
   - Update `version` in `manifest.json`, `package.json`, and map in `versions.json`.
2. **Build Production Bundle**:
   - Run `npm run build` (`tsc -noEmit -skipLibCheck && node esbuild.config.mjs production`).
3. **Lint & Test**:
   - Run `npm run lint` (`eslint .`) with `eslint-plugin-obsidianmd` and verify 0 errors and 0 warnings.
   - Run unit test suite.
4. **Git Tagging & Push**:
   - Tag name MUST match `manifest.json` `version` exactly **without a leading `v`** (e.g., tag `1.1.4`).
   - Push commit to `main` branch: `git push origin main`.
   - Push tag: `git push origin 1.1.4`.
5. **Release Assets Attachment**:
   - Attach individual binary assets directly to the GitHub release tag:
     - `main.js` (Must be ignored by `.gitignore` in git repo, attached only as release asset)
     - `manifest.json`
     - `styles.css`
   - Release creation command:
     ```bash
     gh release create 1.1.4 --title "1.1.4" --notes "Release 1.1.4" manifest.json main.js styles.css
     ```
