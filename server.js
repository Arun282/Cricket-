const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

let cachedAt = 0;
let cachedData = null;
const CACHE_MS = 15 * 60 * 1000; // Free API quota: keep under ~100 calls/day.

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/api/health") {
    return json(res, 200, { ok: true, apiKeyConfigured: Boolean(process.env.CRICKET_API_KEY) });
  }

  if (url.pathname === "/api/live-matches") {
    const key = process.env.CRICKET_API_KEY;
    if (!key) {
      return json(res, 503, {
        status: "not_configured",
        message: "CRICKET_API_KEY is not set. Add it in the hosting service's Environment settings."
      });
    }

    if (cachedData && Date.now() - cachedAt < CACHE_MS) {
      return json(res, 200, { ...cachedData, cached: true, cacheMinutes: 15 });
    }

    try {
      const upstream = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${encodeURIComponent(key)}&offset=0`, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(12000)
      });
      const body = await upstream.json();
      if (!upstream.ok || body.status === "failure" || body.status === "error") {
        return json(res, upstream.status >= 400 ? upstream.status : 502, {
          status: "upstream_error",
          message: body.reason || body.message || "Cricket API request failed."
        });
      }
      cachedData = body;
      cachedAt = Date.now();
      return json(res, 200, { ...body, cached: false, cacheMinutes: 15 });
    } catch (err) {
      return json(res, 502, { status: "error", message: "Cricket API से संपर्क नहीं हो पाया। API key और नेटवर्क जाँचें।" });
    }
  }

  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.resolve(ROOT, "." + pathname);
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    return json(res, 403, { error: "Forbidden" });
  }
  fs.readFile(filePath, (err, data) => {
    if (err) return json(res, 404, { error: "Not found" });
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream", "X-Content-Type-Options": "nosniff" });
    res.end(data);
  });
});

function json(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "same-origin"
  });
  res.end(JSON.stringify(data));
}

server.listen(PORT, "0.0.0.0", () => console.log(`Cricket Sports Live running on port ${PORT}`));
