# clox-docs

Documentation site for [clox](../clox), a bytecode VM for the Lox language written in C
(from *Crafting Interpreters*).

Plain HTML, CSS and JS. No build step, no dependencies.

## Preview

    python3 -m http.server 4173   # then open http://localhost:4173

## Host

Deploy the folder as-is to any static host.

- **Vercel:** `vercel --prod` from this folder (framework preset: Other, no build command, output dir `.`).
- **GitHub Pages / Netlify / Cloudflare Pages:** point at the repo root.

## Editing

All content is in `index.html`. Each `<section data-group="…" data-title="…">` becomes a sidebar entry
automatically. Code blocks use `<pre data-lang="lox|c|bytecode|shell">`; escape `<`, `>` and `&` inside them.
