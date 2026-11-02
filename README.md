# blommetjes.com

Rick Blom's personal homepage: things I build, things I see.

An independent Astro site showcasing PersonalDesignerRS and making room for original photography.
The Rust application stays in its own **private** repository. The public website is a teaser:
the owner approved the screenshot, not publication of the source or downloads.

## Development

Node 24 (or a version supported by `package.json`) and npm:

```sh
npm ci
npm run dev
```

Quality gate:

```sh
npm run check
npm run build
npm test
```

`dist/` is the complete static website. There is no client-side framework, runtime JavaScript,
database, analytics, third-party font request or social embed. Social links are plain links.
Astro generates responsive WebP project screenshots and a sitemap at build time.

## Content

- `src/data/site.ts`: identity, social links and optional archive destination.
- `src/pages/index.astro`: personal homepage.
- `src/pages/photography.astro`: an honest empty gallery until original images are supplied.
- `src/pages/projects/personal-designer-rs.astro`: the hobby project's landing page.
- `src/styles/global.css`: responsive layout and visual tokens.

Add original photographs under `src/assets/` and use `Image` from `astro:assets`, meaningful alt text,
and explicit gallery captions. Do not fill the gallery with stock or generated portfolio images.
`allesvanblom.com` is intentionally unchanged.

## Azure Static Web Apps (not provisioned yet)

The target is Azure Static Web Apps, **not GitHub Pages**. No Azure resource or DNS record was created
as part of the initial website build. Choose and approve a subscription, resource group, region and
SKU before provisioning. Do not assume the signed-in business subscription is the personal target.

When hosting is approved, configure the GitHub integration to build from the repository root with
`npm run build`, output directory `dist`, and no API. Use a supported Node version (24).
The configuration in `public/staticwebapp.config.json` is copied into `dist/` by Astro:
fingerprinted assets are immutable and missing pages return the custom 404, not an SPA fallback.
CI validates the website; a deployment workflow must be added after the Azure target is approved.
Never commit a deployment token.

### Domain cutover checklist

1. Verify the generated site on its Azure `*.azurestaticapps.net` hostname.
2. **Preserve the old blog first.** Find the independent Blogspot address in Blogger settings.
   The public Blogger profile currently points back to `www.blommetjes.com`, so it is not an
   independent archive. Change Blogger's custom-domain configuration as necessary to keep the
   Blogspot site accessible; verify that it does not redirect to the new site.
3. Set `archiveUrl` in `src/data/site.ts` to that verified HTTPS archive URL, rebuild and publish.
   It intentionally stays unset rather than sending visitors in a circle.
4. Add and validate `www.blommetjes.com` in Azure Static Web Apps using the exact DNS records
   Azure provides. Change the CNAME only after the archive and new site are verified.
5. Confirm managed HTTPS, page routes and a real 404 on the custom domain.
6. Handle the apex `blommetjes.com` separately with a supported DNS alias or redirect to `www`.
   Leave `allesvanblom.com` alone.

The canonical site URL is `https://www.blommetjes.com`. If that changes, update
`astro.config.mjs`, `public/robots.txt` and the domain assertions in `tests/site.test.mjs`.

## Dependencies and assets

Astro is the requested static generator; no React/Vue runtime or server adapter is needed.
`@astrojs/sitemap` generates the sitemap rather than hand-maintaining it.
`@astrojs/check` and TypeScript validate Astro templates rather than relying on build success alone.
The design uses system fonts and original CSS decoration; no external design package is needed.

The owner-approved application screenshot `src/assets/personal-designer-rs.png` is an unmodified copy of
`docs/branding/themes/m3-showcase-dark.png` in PersonalDesignerRS (MPL-2.0). It depicts an earlier
build, not the current release. Source and licence:

- Origin: `rickblommetjes/personal-designer-rs`, `docs/branding/themes/m3-showcase-dark.png`
  (private source repository; intentionally not a public website link).
- The screenshot's licence is included in `licenses/PersonalDesignerRS-MPL-2.0.txt`.
- `public/social-card.png` is generated from the original `public/social-card.svg` using Sharp
  (provided by Astro's image pipeline) so social platforms receive a supported raster image.

The website's visual identity is separate from the CAD application's final brand artwork.
