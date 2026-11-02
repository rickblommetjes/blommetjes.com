import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

const root = resolve(import.meta.dirname, '../dist');
const routes = ['index.html', 'photography/index.html', 'projects/personal-designer-rs/index.html', '404.html'];
const read = (file) => readFile(resolve(root, file), 'utf8');

for (const route of routes) {
  test(`${route}: static, accessible foundations and canonical URL`, async () => {
    const html = await read(route);
    assert.match(html, /<html lang="en"/);
    assert.match(html, /<h1(?:\s|>)/);
    assert.match(html, /id="main"/);
    assert.match(html, /href="#main"/);
    assert.match(html, /rel="canonical" href="https:\/\/www\.blommetjes\.com/);
    assert.match(html, /name="description" content="[^"]+"/);
    assert.match(html, /http-equiv="content-security-policy"/i);
    assert.doesNotMatch(html, /<script(?:\s|>)/, 'No runtime JavaScript should ship.');
  });
}

test('every internal page link and image exists in the static build', async () => {
  for (const route of routes) {
    const html = await read(route);
    for (const [, attribute, url] of html.matchAll(/\b(href|src)="(\/[^"]*)"/g)) {
      const path = url.split(/[?#]/)[0];
      const file = path.endsWith('/') ? `${path}index.html` : path;
      assert.ok((await readFile(resolve(root, `.${file}`))).length, `${route}: missing ${attribute} ${url}`);
      if (url.includes('#') && attribute === 'href') {
        const target = await read(file.slice(1));
        assert.ok(target.includes(`id="${url.split('#')[1]}"`), `${route}: missing fragment ${url}`);
      }
    }
    for (const [, fragment] of html.matchAll(/href="#([^"]+)"/g)) {
      assert.ok(html.includes(`id="${fragment}"`), `${route}: missing fragment ${fragment}`);
    }
  }
});

test('photography is honest about missing images and links the approved profile', async () => {
  const html = await read('photography/index.html');
  assert.match(html, /first frames/);
  assert.match(html, /still to come/);
  assert.match(html, /https:\/\/www\.facebook\.com\/rickblommetjes/);
});

test('private project is a teaser without inaccessible source or download links', async () => {
  const html = await read('projects/personal-designer-rs/index.html');
  assert.match(html, /project is private for now/);
  for (const route of routes) {
    assert.doesNotMatch(await read(route), /href="https:\/\/github\.com\/rickblommetjes\/personal-designer-rs/);
    assert.doesNotMatch(await read(route), /Open source/);
  }
});

test('Azure serves a real 404, never an SPA success fallback', async () => {
  const config = JSON.parse(await read('staticwebapp.config.json'));
  assert.equal(config.navigationFallback, undefined);
  assert.equal(config.responseOverrides['404'].rewrite, '/404.html');
  assert.equal(config.globalHeaders['X-Content-Type-Options'], 'nosniff');
});

test('sitemap and robots use the final domain', async () => {
  assert.match(await read('robots.txt'), /https:\/\/www\.blommetjes\.com\/sitemap-index\.xml/);
  assert.match(await read('sitemap-0.xml'), /https:\/\/www\.blommetjes\.com\/photography\//);
  assert.doesNotMatch(await read('sitemap-0.xml'), /\/404/);
});

async function* files(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else yield path;
  }
}

test('each page is below 35 KB and references less than 200 KB of CSS', async () => {
  for await (const path of files(root)) {
    const size = (await readFile(path)).byteLength;
    if (path.endsWith('.html')) assert.ok(size < 35_000, `${path}: ${size} bytes`);
    if (path.endsWith('.css')) assert.ok(size < 200_000, `${dirname(path)}: ${size} bytes`);
  }
});
