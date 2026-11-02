// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.blommetjes.com',
  output: 'static',
  trailingSlash: 'always',
  markdown: { syntaxHighlight: false },
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-src 'none'",
        "form-action 'self'",
      ],
    },
  },
});
