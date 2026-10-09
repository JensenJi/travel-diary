import { checkKV, json, getUserFromRequest } from "../../_lib.js";

// GET /api/audits/my — 当前用户查看自己的审核存档
export async function onRequestGet({ request, env }) {
  const kvError = checkKV(env);
  if (kvError) return kvError;

  const user = await getUserFromRequest(request, env);
  if (!user) return json({ error: "请先登录" }, 401);

  const raw = await env.USERS.get("audits");
  const audits = raw ? JSON.parse(raw) : [];

  const list = audits
    .filter(a => a.userId === user.id || a.email === user.email)
    .map(a => ({
      id: a.id,
      factoryName: a.factoryName,
      factoryAddr: a.factoryAddr,
      ownerName: a.ownerName,
      contactPhone: a.contactPhone,
      factoryType: a.factoryType,
      email: a.email,
      username: a.username,
      createdAt: a.createdAt,
    }));

  return json({ audits: list });
}
