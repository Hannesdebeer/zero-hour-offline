# Zero Hour — offline browser edition

Independent modified distribution of Project New Shoes 0.8.4. This repository contains browser-engine software, corresponding source and notices only. It contains **no retail game data**. It is not affiliated with or endorsed by Electronic Arts or the upstream New Shoes project.

## Play

Open https://hannesdebeer.github.io/zero-hour-offline/ in desktop Chrome while online. Select **Prepare offline engine**, wait for verification and one isolation reload, then open the launcher. Import your own legally acquired Generals/Zero Hour files using **Add Game Folder**, then **Install**. Game files are read locally into this origin’s browser storage; they are not uploaded.

Return to the homepage and confirm both the engine and 30 required archives are verified. Bookmark the address and use the same Chrome profile for offline play. This is a cached HTTPS application, not a standalone file:// HTML game. No app installation or local server is needed on the playing Mac.

## Scope and retention

Zero Hour solo skirmish is the validation scope. Separate original Generals mode is unavailable. Optional movies are not bundled. Campaigns, multiplayer, long matches, every Mac/GPU, and browser policies are not covered by the validation. Private mode, clearing site data, managed policies, or storage eviction can remove this setup. Keep an original game-data backup. Persistent storage is requested, never assumed.

## Architecture

One service worker precaches a complete SHA-256-verified engine version and adds COOP/COEP isolation headers to its responses. GitHub Pages does not need custom HTTP headers. First preparation reloads once under the worker to enable SharedArrayBuffer/WASM threads. Updates wait for old clients to close; incomplete installs never activate. Cache cleanup is scoped to this project path and does not touch OPFS or unrelated caches. The worker serves cached assets only, blocks external requests and rejects write requests. Analytics and automatic peer discovery are disabled. Requests to GitHub for initial engine downloads and updates still reach GitHub; no retail asset uploads occur.

## Source and licences

Upstream engine commit: `3ccaa0e9af66889be183ca910851e881d47d437c`.
See [legal.html](legal.html), [modification notice](notices/MODIFICATIONS.txt), [upstream corresponding source](notices/NewShoes-source-3ccaa0e9.tar.gz), and [modified wrapper source](notices/Offline-edition-source.zip). The latter includes the manifest builder and worker template. Preserve all GPL/EA and third-party notices when redistributing. No game licence is provided by this repository.

Deploy this repository from the main branch root with GitHub Pages; `.nojekyll` preserves static files. No Actions workflow, server, database, token or secret is needed. `_headers` is for compatible alternative static hosts and is ignored by GitHub Pages. Site size is about 39 MB, below the GitHub Pages 1 GB limit; largest file is about 22.6 MB.
