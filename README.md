# Clinton Ezeh — Portfolio

Personal portfolio of Ezeh Chukwuebuka Clinton: product designer, full-stack developer and data analyst.

Built with Next.js 16 (App Router) and TypeScript, with no UI library. It includes an interactive terminal, a command palette (⌘K / Ctrl+K), light and dark themes, and a Tool Lab of 11 utilities that run entirely in the browser.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Editing content

Everything personal (bio, skills, projects, experience, certificates, contact links) lives in [`src/data/profile.ts`](src/data/profile.ts). Images go in `public/` (`public/me.jpg`, `public/certs/`).

## Deploy

Import the repo at [vercel.com/new](https://vercel.com/new). The default settings work as they are.

## Private project walkthroughs

Selected work and flagship builds show public summaries and illustrated overviews.
All project CTAs use demoRequestUrl in src/data/profile.ts to open a
prefilled email. Do not add deployment or source URLs to client-side project data.
This controls portfolio navigation, not access to independently hosted apps or repositories.
Their access must be managed separately at their own hosts.

AlphaBot and Flare are credited as collaborations. Additional languages reflect
the owner's stated experience; no additional proficiency scores are inferred.
The C++ buffer lab is a new portfolio sample, not a previous client engagement
or a live WebSocket implementation. See samples/market-data-buffer/README.md.
