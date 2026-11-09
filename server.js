// Production server for VulaTrade.
// Serves the built app and renders public pages to real HTML so search engines,
// AI tools and WhatsApp/Facebook link previews can read them.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.join(root, "dist", "client");
const port = Number(process.env.PORT) || 3000;
const SITE = "https://www.vulatrade.co.za";

const template = fs.readFileSync(path.join(clientDir, "index.html"), "utf8");
const { render, publicPaths } = await import(path.join(root, "dist", "server", "entry-server.js"));

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2",
};
const COMPRESSIBLE = /^(text\/|application\/(json|xml|manifest)|image\/svg)/;

function send(req, res, status, body, type, cacheControl) {
  const headers = { "Content-Type": type, "Cache-Control": cacheControl, "X-Content-Type-Options": "nosniff", Vary: "Accept-Encoding" };
  let payload = typeof body === "string" ? Buffer.from(body) : body;
  if (COMPRESSIBLE.test(type) && payload.length > 1024 && /\bgzip\b/.test(req.headers["accept-encoding"] || "")) {
    payload = zlib.gzipSync(payload);
    headers["Content-Encoding"] = "gzip";
  }
  headers["Content-Length"] = payload.length;
  res.writeHead(status, headers);
  res.end(req.method === "HEAD" ? undefined : payload);
}

function tryStatic(req, res, pathname) {
  if (pathname === "/" || pathname.endsWith("/")) return false;
  const filePath = path.normalize(path.join(clientDir, pathname));
  if (!filePath.startsWith(clientDir + path.sep)) return false;
  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch {
    return false;
  }
  if (!stat.isFile() || path.basename(filePath) === "index.html") return false;
  const type = TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
  const cache = pathname.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "public, max-age=3600";
  send(req, res, 200, fs.readFileSync(filePath), type, cache);
  return true;
}

function robots() {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /dashboard",
    "Disallow: /login",
    "Disallow: /signup",
    "Disallow: /review/",
    "",
    `Sitemap: ${SITE}/sitemap.xml`,
    "",
  ].join("\n");
}

function sitemap() {
  const urls = publicPaths.map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" });
      return res.end();
    }
    const url = new URL(req.url, "http://localhost");
    const pathname = decodeURIComponent(url.pathname);

    if (pathname === "/healthz") return send(req, res, 200, "ok", "text/plain; charset=utf-8", "no-store");
    if (pathname === "/robots.txt") return send(req, res, 200, robots(), TYPES[".txt"], "public, max-age=3600");
    if (pathname === "/sitemap.xml") return send(req, res, 200, sitemap(), TYPES[".xml"], "public, max-age=3600");
    if (tryStatic(req, res, pathname)) return;

    // Missing asset files should 404, not return the app.
    if (/\.[a-z0-9]{2,5}$/i.test(pathname)) return send(req, res, 404, "Not found", TYPES[".txt"], "no-store");

    const result = await render(pathname);
    let html = template
      .replace(/<title>[^<]*<\/title>\s*<!--app-head-->/, result.head)
      .replace("<!--app-html-->", result.html || "");
    if (result.data) {
      const json = JSON.stringify(result.data).replace(/</g, "\\u003c");
      html = html.replace("</head>", `  <script>window.__VULA_PUBLIC_PAGE__=${json};</script>\n  </head>`);
    }
    const cache = result.data ? "public, max-age=60, s-maxage=300" : "public, max-age=300";
    send(req, res, result.status, html, TYPES[".html"], cache);
  } catch (err) {
    console.error("Request failed:", req.url, err);
    // Fall back to the plain app so the site never goes down because of a render error.
    send(req, res, 200, template.replace("<!--app-head-->", "").replace("<!--app-html-->", ""), TYPES[".html"], "no-store");
  }
});

server.listen(port, "0.0.0.0", () => console.log(`VulaTrade listening on port ${port}`));
