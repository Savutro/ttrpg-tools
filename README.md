# TTRPG Tools

[![Static Site](https://github.com/Savutro/ttrpg-tools/actions/workflows/static-site.yml/badge.svg)](https://github.com/Savutro/ttrpg-tools/actions/workflows/static-site.yml)
[![App Version](https://img.shields.io/github/v/tag/Savutro/ttrpg-tools?label=app%20version&sort=semver)](https://github.com/Savutro/ttrpg-tools/tags)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://www.conventionalcommits.org/)
[![License: GPLv3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

TTRPG Tools is a growing collection of focused browser-based helpers for playing and preparing tabletop role-playing games. It uses Vite and TypeScript, is built for GitHub Pages, and runs entirely in the browser without a backend.

## Available Tools

### Standeecrafter

Turn PNG, JPG, or WebP character artwork into correctly sized, foldable paper miniatures:

- choose a standard creature base size or enter a custom height
- add labels and duplicate characters
- reserve optional clearance for acrylic stands
- arrange multiple miniatures across printable A4 sheets
- print at actual size or save the sheets as a PDF

Artwork is processed locally and never leaves the browser.

## Tool Roadmap

The overview catalog currently proposes three focused additions:

- **Encounter Board:** initiative, conditions, concentration, and round tracking in a table-friendly view.
- **Token Smith:** reuse the existing image and A4 layout foundations to create printable round tokens.
- **Session Sheet:** turn scenes, NPCs, clues, and secrets into a concise printable reference.

Token Smith is the strongest next implementation candidate because it can reuse Standeecrafter's image handling, physical units, packing algorithm, and print workflow. Encounter Board would provide the most value during play, but introduces persistent interactive state and should follow a small shared storage module.

## GitHub Pages

The repository uses the static site workflow in [.github/workflows/static-site.yml](.github/workflows/static-site.yml).

- Pull requests install dependencies and validate the static build.
- Pushes to `main` build and deploy `dist` to GitHub Pages.
- Tags such as `v1.0.0` create a GitHub release from `CHANGELOG.md`.

## Versioning

Releases use semantic versioning with a plain text [VERSION](VERSION) file. Keep [CHANGELOG.md](CHANGELOG.md) in sync and tag releases as `vX.Y.Z`.

## Project Layout

```text
index.html                    Tool overview
standee.html                  Standeecrafter markup
src/overview/main.ts          Data-driven overview rendering
src/shared/tool-catalog.ts    Tool catalog and roadmap definitions
src/standee/main.ts           Standeecrafter UI and browser events
src/standee/layout.ts         Pure sizing and A4 packing logic
src/standee/types.ts          Standeecrafter domain types
styles.css                    Shared responsive and print styles
vite.config.ts                Multi-page static build configuration
VERSION                       Plain semantic version
CHANGELOG.md                  Release notes
.github/workflows/            Validation, Pages deploy, and release workflow
```

## Development

Install dependencies and start the development server:

```sh
npm ci
npm run dev
```

Build or preview the static site:

```sh
npm run build
npm run preview
```

## License

GPLv3. See [LICENSE](LICENSE).
