# Letterwise

**Letterwise** is a small, **offline-first** web app for learning to **recognize letters** in real writing systems—not full language learning. Pick a script, walk through the character set and a few easy-to-confuse pairs, then practice with **hints that fade** as you improve. There is no backend, account, or grammar course.

**MVP scripts:** Eastern Armenian (`hy`), Russian Cyrillic (`ru`), and a starter set of simplified Chinese characters (`zh`).

## What you get

- **Home** — choose a script and open the learn flow.
- **Learn** — alphabet overview, confusable-pair intros, then match exercises. Progress is reflected in the URL (`/:scriptId/learn/:stepIndex`) so you can bookmark or go back step-by-step.
- **Session** — mixed letter-pick and minimal-pair exercises with per-letter hint levels stored locally.
- **Progress** — saved in the browser under keys like `letterwise-v1-<scriptId>` (per script).

## Tech stack

- [Angular](https://angular.dev/) **21** (standalone components, signals, `provideRouter`)
- [Tailwind CSS](https://tailwindcss.com/) **4** (utility-first styling)
- Unit tests via **Vitest** (`ng test`)

## Prerequisites

- **Node.js** (LTS recommended) and **npm**

## Quick start

Install dependencies:

```bash
npm install
```

Run the dev server (default `http://localhost:4200/`):

```bash
npm start
```

Production build (output under `dist/letterwise/`, browser bundle in `dist/letterwise/browser/`):

```bash
npm run build
```

Run unit tests once:

```bash
npm test -- --watch=false
```

## Deploying a release

The app is a **static SPA**. Configure your host so **all paths** serve `index.html` (HTTP 200), or ship the included SPA rule from `public/_redirects` with your static files (for example on **Netlify**).

Publish the **browser** output folder produced by `ng build` (by default `dist/letterwise/browser/`).

## Privacy

All progress stays **on the device** in `localStorage`. Clearing site data removes it.

## License

Add a `LICENSE` file if you publish or open-source the project.
