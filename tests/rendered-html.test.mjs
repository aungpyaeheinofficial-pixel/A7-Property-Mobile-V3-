import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Eain discovery homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Eain — Find a place you can call home<\/title>/i);
  assert.match(html, /Find a place/);
  assert.match(html, /Verified homes/);
  assert.match(html, /AI home assistant/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("ships the complete mock-data foundation", async () => {
  const [propertyText, promptText] = await Promise.all([
    readFile(new URL("../public/data/properties.json", import.meta.url), "utf8"),
    readFile(new URL("../docs/property-image-prompts.json", import.meta.url), "utf8"),
  ]);
  const properties = JSON.parse(propertyText);
  const prompts = JSON.parse(promptText);

  assert.equal(properties.length, 100);
  assert.equal(prompts.length, 50);
  assert.ok(properties.every((property) => property.currency === "MMK"));
  assert.deepEqual([...new Set(properties.map((property) => property.city))].sort(), ["Mandalay", "Yangon"]);
});
