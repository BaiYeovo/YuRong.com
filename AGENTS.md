# Repository Guidelines

## Project Structure & Module Organization

This repository is a framework-free static website. The Chinese pages live at the root (`index.html`, `about.html`, `products.html`, `projects.html`, `contact.html`, and `404.html`); English counterparts are under `en/`. Shared presentation and behavior are in `assets/css/style.css` and `assets/js/main.js`. Images, logos, partner marks, and generated artwork are stored in `assets/images/`. `robots.txt` and `sitemap.xml` define crawler-facing metadata. Keep the page structure and navigation mirrored between the two language trees.

## Build, Test, and Development Commands

There is no package manager, build pipeline, or automated test suite. Preview the site locally from the repository root with:

```text
python -m http.server 8000
```

Then open `http://localhost:8000/`. Before submitting changes, run `git diff --check` to catch whitespace errors and inspect the affected pages in a browser. Do not open HTML files directly when validating relative links; use the local server instead.

## Coding Style & Naming Conventions

Use two-space indentation in HTML, CSS, and JavaScript, and preserve the existing vanilla DOM/event patterns. Use descriptive, lowercase kebab-case names for new files and CSS classes (for example, `product-card`); retain established asset names when extending the image library. Prefer shared classes and `data-*` hooks over page-specific inline styles or scripts. Update both language versions, navigation links, metadata, and meaningful image `alt` text when adding or changing a page.

## Testing Guidelines

Testing is manual. Check every modified route in both Chinese and English, including desktop and narrow mobile layouts. Verify navigation, language switching, asset paths, carousel controls, lightbox behavior, contact links, and the 404 page as applicable. Confirm that images load through the local server and that the browser console has no new errors. There is no coverage threshold.

## Commit & Pull Request Guidelines

Recent commits use concise subjects, including Chinese imperative descriptions and prefixes such as `feat:`, `fix:`, `style:`, and `refactor:`. Follow that convention; keep one logical change per commit (for example, `fix: correct English product links`). Pull requests should summarize affected pages and user-visible behavior, list validation steps, link an issue when one exists, and include before/after screenshots for visual or responsive changes. Mention any intentionally added or replaced image assets.

## Security & Configuration Tips

Do not commit API keys, credentials, or private form endpoints. Treat contact details and SEO metadata as production content: verify them carefully before changing them, and keep `sitemap.xml` and `robots.txt` consistent with published routes.
