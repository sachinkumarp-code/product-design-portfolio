# Sachinkumar P — Product Design Portfolio

A continuation of the existing portfolio, built as a lightweight static site with Vite 5. The original editorial layout, typography and teal colour system are retained.

## Run locally

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

Vite writes the production site to `dist/`.

## Deploy to GitHub and Vercel

1. Create a new GitHub repository.
2. Upload the **contents of this project folder** (including `index.html`, `src/`, `public/`, `package.json` and `vite.config.js`) to the repository root.
3. In Vercel, choose **Add New → Project** and import that GitHub repository.
4. Keep the framework preset as **Vite**.
5. Set the build command to `npm run build` and output directory to `dist`.
6. Deploy. Future pushes to the connected branch trigger a new deployment.

No paid API keys or environment variables are required for the prototypes.

## Project structure

```text
portfolio/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── AUDIT.md
├── public/
│   ├── favicon.svg
│   └── resume.pdf
└── src/
    ├── main.js
    └── styles.css
```

## Prototype notes

- The clinician annotation workspace is a portfolio concept with illustrative tissue artwork and local-only state. It is not the live research platform and does not persist clinical data.
- The AI Learning Companion is a self-initiated concept, not a Newton School product. Its assistant uses prepared local responses; no live model or external API is connected.
- Learning progress, skill levels, readiness values, learner history and sample cases are illustrative.
- The MRI and document-management mockups remain illustrative interface explorations unless explicitly described otherwise in the case study.

## Resume

The supplied resume PDF is included at `public/resume.pdf`, matching the portfolio's `/resume.pdf` links.

## Verification caveat

The source JavaScript passes `node --check`, and the HTML has been parsed for duplicate IDs and local public assets. A Vite production build and full interactive browser test still need to be run in an environment where npm dependencies can be installed.
