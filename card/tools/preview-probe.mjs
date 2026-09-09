#!/usr/bin/env node
/**
 * Run one expression against the render harness and print what it returns.
 *
 * The harness is meant to be looked at in a browser, but "looks wrong" is not
 * a finding -- "the second label sits 6px further left than the other four" is.
 * This is the tool for the second kind of statement: it opens preview.html in
 * the same headless Chrome the screenshots come from, waits until every card
 * has settled, evaluates the expression and prints the result as JSON.
 *
 * Headless Chrome is used rather than any browser at hand on purpose: the
 * chart only draws once its ResizeObserver has reported a width, and a browser
 * tab that never becomes visible never reports one. Measuring in the same
 * engine the screenshot comes from is also the only way for a measurement and
 * a picture to agree.
 *
 * Node built-ins only (fetch, WebSocket, child_process), so this adds no
 * dependency to a project whose only dependency is lit.
 *
 *   node tools/preview-probe.mjs '<expression>' [--url=<url>] [--width=<px>]
 *
 * The expression is evaluated as the body of an async function, so `await`
 * works and the last expression is the result:
 *
 *   node tools/preview-probe.mjs 'wg.height()'
 *   node tools/preview-probe.mjs '[...wg.card("behind").shadowRoot.querySelectorAll("*")].length'
 */

import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const DEFAULT_URL = "http://127.0.0.1:8765/card/preview.html";

const args = process.argv.slice(2);
const expression = args.find((a) => !a.startsWith("--"));
const option = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

if (!expression) {
  console.error("usage: node tools/preview-probe.mjs '<expression>' [--url=…] [--width=…]");
  process.exit(2);
}

const url = option("url", DEFAULT_URL);
const width = Number(option("width", 1400));
const profile = mkdtempSync(join(tmpdir(), "wg-probe-"));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    `--window-size=${width},1200`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "ignore"] },
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Chrome writes the port it picked into the profile once it is listening. */
async function devtoolsPort() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      return readFileSync(join(profile, "DevToolsActivePort"), "utf8").split("\n")[0].trim();
    } catch {
      await sleep(100);
    }
  }
  throw new Error("Chrome never reported a DevTools port");
}

function cleanup(code) {
  chrome.kill("SIGTERM");
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* a leftover profile directory is not worth failing over */
  }
  process.exit(code);
}

let socket;
try {
  const port = await devtoolsPort();
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((t) => t.type === "page");
  if (!page) throw new Error("no page target");

  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let nextId = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const waiting = pending.get(message.id);
    if (waiting) {
      pending.delete(message.id);
      waiting(message);
    }
  });

  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const id = (nextId += 1);
      pending.set(id, resolve);
      socket.send(JSON.stringify({ id, method, params }));
    });

  const evaluate = async (source) => {
    const reply = await send("Runtime.evaluate", {
      expression: `(async () => { ${source} })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    const error = reply.result?.exceptionDetails;
    if (error) {
      throw new Error(error.exception?.description ?? error.text);
    }
    return reply.result?.result?.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", { url });

  // Page.navigate resolves when the navigation starts, so the module script
  // may not have run yet; poll for the handle before awaiting its readiness.
  await evaluate(`
    for (let i = 0; i < 200; i += 1) {
      if (window.wgReady) { await window.wgReady; return true; }
      await new Promise((r) => setTimeout(r, 50));
    }
    throw new Error("preview.html never exposed window.wgReady");
  `);

  const value = await evaluate(`return (${expression});`);
  console.log(JSON.stringify(value, null, 2));
  cleanup(0);
} catch (error) {
  console.error(String(error.message ?? error));
  cleanup(1);
}
