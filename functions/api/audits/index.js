import { checkKV, json, getUserFromRequest, ADMIN_EMAIL } from "../../_lib.js";

// GET /api/audits — 管理员查看全部审核存档
// GET /api/audits/my — 当前用户查看自己的审核存档
// POST /api/audits — 保存审核存档（需登录）
export async function onRequestGet({ request, env }) {
  const kvError = checkKV(env);
  if (kvError) return kvError;

  const url = new URL(request.url);
  const isMy = url.pathname.endsWith("/my");

  const user = await getUserFromRequest(request, env);
  if (!user) return json({ error: "请先登录" }, 401);

  const raw = await env.USERS.get("audits");
  const audits = raw ? JSON.parse(raw) : [];

  let list;
  if (isMy) {
    list = audits.filter(a => a.userId === user.id || a.email === user.email);
  } else {
    if (user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return json({ error: "无权限" }, 403);
    }
    list = audits;
  }

  // 返回列表（不含 HTML content，减少体积）
  return json({ audits: list.map(a => ({
    id: a.id,
    factoryName: a.factoryName,
    factoryAddr: a.factoryAddr,
    ownerName: a.ownerName,
    contactPhone: a.contactPhone,
    factoryType: a.factoryType,
    email: a.email,
    username: a.username,
    userId: a.userId,
    createdAt: a.createdAt,
  })) });
}

export async function onRequestPost({ request, env }) {
  const kvError = checkKV(env);
  if (kvError) return kvError;

  const user = await getUserFromRequest(request, env);
  if (!user) return json({ error: "请先登录后才能保存审核表" }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "请求体格式错误" }, 400);
  }

  const { factoryName, factoryAddr, ownerName, contactPhone, factoryType, content } = body;
  if (!factoryName || !ownerName) {
    return json({ error: "工厂名称和拥有人姓名不能为空" }, 400);
  }

  const raw = await env.USERS.get("audits");
  const audits = raw ? JSON.parse(raw) : [];

  const audit = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    factoryName,
    factoryAddr: factoryAddr || "",
    ownerName,
    contactPhone: contactPhone || "",
    factoryType: factoryType || "",
    content: content || "",
    email: user.email,
    username: user.username,
    userId: user.id,
    createdAt: new Date().toISOString(),
  };

  audits.push(audit);
  await env.USERS.put("audits", JSON.stringify(audits));

  return json({ success: true, id: audit.id });
}
