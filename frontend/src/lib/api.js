const BASE = import.meta.env.VITE_API_BASE || "";

// Browser talks to /backend/...; Vercel (and the Vite dev proxy) forward it to Django's /api/...
function toUrl(path) {
  return BASE + path.replace(/^\/api\//, "/backend/");
}

function flatten(data) {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (data.detail) return String(data.detail);
  return Object.entries(data)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : typeof v === "object" ? JSON.stringify(v) : v}`)
    .join(" | ");
}

export class ApiError extends Error {
  constructor(status, data) {
    super(flatten(data) || `Request failed (${status})`);
    this.status = status;
    this.fields = data && typeof data === "object" ? data : {};
  }
}

export function fieldError(errors, name) {
  const m = errors?.[name];
  if (!m) return "";
  return Array.isArray(m) ? m.join(" ") : typeof m === "object" ? JSON.stringify(m) : String(m);
}

function getCookie(name) {
  const match = document.cookie.split("; ").find((c) => c.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export async function ensureCsrf() {
  await fetch(toUrl("/api/admin/auth/csrf/"), { credentials: "include" });
}

export function toFormData(obj) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined) return;
    if (v instanceof Blob) fd.append(k, v);
    else if (v === null) fd.append(k, "");
    else if (typeof v === "object") fd.append(k, JSON.stringify(v));
    else fd.append(k, String(v));
  });
  return fd;
}

async function request(method, path, body) {
  const headers = { Accept: "application/json" };
  const opts = { method, credentials: "include", headers };

  if (method !== "GET") {
    if (!getCookie("csrftoken")) await ensureCsrf();
    headers["X-CSRFToken"] = getCookie("csrftoken") || "";
  }
  if (body instanceof FormData) {
    opts.body = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(toUrl(path), opts);
  } catch {
    throw new ApiError(0, { detail: "Cannot reach the server. Is the backend running?" });
  }
  if (res.status === 204) return null;

  const type = res.headers.get("content-type") || "";
  if (!type.includes("application/json")) {
    // e.g. Vercel returned index.html because the proxy rule did not match
    throw new ApiError(res.status, { detail: "API proxy is not configured (got a web page instead of JSON)." });
  }

  const data = await res.json();
  if (!res.ok) {
    const expired =
      res.status === 401 ||
      (res.status === 403 && String(data?.detail || "").toLowerCase().includes("credentials"));
    if (expired) window.dispatchEvent(new Event("auth-expired"));
    throw new ApiError(res.status, data);
  }
  return data;
}

export const api = {
  get: (p) => request("GET", p),
  post: (p, b) => request("POST", p, b),
  patch: (p, b) => request("PATCH", p, b),
  del: (p) => request("DELETE", p),
};