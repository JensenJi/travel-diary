// 共享工具函数 — Cloudflare Pages Functions 使用（ES Module）

const ADMIN_EMAIL = "jensenji@sohu.com";
const JWT_SECRET_FALLBACK = "jensenji-site-secret-2026";

function getSecret(env) {
  return env.JWT_SECRET || JWT_SECRET_FALLBACK;
}

function b64url(str) {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return atob(str);
}

function randomString(len = 16) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr)).replace(/[^a-zA-Z0-9]/g, "").slice(0, len);
}

async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode(salt), iterations: 100000, hash: "SHA-256" },
    keyMaterial, 256
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

async function createToken(payload, env) {
  const enc = new TextEncoder();
  const header = { alg: "HS256", typ: "JWT" };
  const headerB64 = b64url(JSON.stringify(header));
  const payloadB64 = b64url(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(getSecret(env)), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const sigB64 = b64url(String.fromCharCode(...new Uint8Array(sig)));
  return `${data}.${sigB64}`;
}

async function verifyToken(token, env) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts;
  const data = `${headerB64}.${payloadB64}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(getSecret(env)), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const expectedSig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const expectedSigB64 = b64url(String.fromCharCode(...new Uint8Array(expectedSig)));
  if (sigB64 !== expectedSigB64) return null;
  try {
    return JSON.parse(b64urlDecode(payloadB64));
  } catch {
    return null;
  }
}

async function getUserFromRequest(request, env) {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const payload = await verifyToken(token, env);
  if (!payload) return null;
  return { id: payload.userId, email: payload.email, username: payload.username };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function checkKV(env) {
  if (!env.USERS) {
    return json({ error: "后端尚未配置 KV 绑定（USERS），请在 Cloudflare Pages 设置中添加" }, 500);
  }
  return null;
}

async function getUserByEmail(env, email) {
  const raw = await env.USERS.get(`user:${email}`);
  return raw ? JSON.parse(raw) : null;
}

async function saveUser(env, user) {
  await env.USERS.put(`user:${user.email}`, JSON.stringify(user));
}

async function getAllMessages(env) {
  const raw = await env.MESSAGES.get("messages");
  return raw ? JSON.parse(raw) : [];
}

async function saveAllMessages(env, messages) {
  await env.MESSAGES.put("messages", JSON.stringify(messages));
}

export {
  ADMIN_EMAIL,
  getSecret,
  randomString,
  hashPassword,
  createToken,
  verifyToken,
  getUserFromRequest,
  json,
  checkKV,
  getUserByEmail,
  saveUser,
  getAllMessages,
  saveAllMessages,
};
