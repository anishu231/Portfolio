// Vercel serverless function: forwards /backend/* to the Django API on Render.
const TARGET = process.env.BACKEND_URL || "https://portfolio-b12h.onrender.com";

export const config = { api: { bodyParser: false } };

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  try {
    const u = new URL(req.url, "https://placeholder.local");
    const path = u.searchParams.get("path") || "";
    u.searchParams.delete("path");
    const qs = u.searchParams.toString();
    const url = `${TARGET}/api/${path}${qs ? "?" + qs : ""}`;

    const headers = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (["host", "content-length", "accept-encoding", "connection"].includes(k)) continue;
      headers[k] = Array.isArray(v) ? v.join(", ") : v;
    }
    headers["x-forwarded-proto"] = "https";

    const hasBody = !["GET", "HEAD"].includes(req.method);
    const body = hasBody ? await readBody(req) : undefined;

    const upstream = await fetch(url, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    });

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (["content-encoding", "transfer-encoding", "content-length", "set-cookie"].includes(key)) return;
      res.setHeader(key, value);
    });
    const cookies = upstream.headers.getSetCookie ? upstream.headers.getSetCookie() : [];
    if (cookies.length) res.setHeader("Set-Cookie", cookies);

    res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    console.error("proxy error", err);
    res.status(502).json({ detail: `Proxy error: ${err.message}` });
  }
}