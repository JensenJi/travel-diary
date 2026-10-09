import { checkKV, json, getUserFromRequest, ADMIN_EMAIL } from "../../_lib.js";

async function getAllUsers(env) {
  const raw = await env.USERS.list({ prefix: "user:" });
  const users = [];
  for (const key of raw.keys) {
    const userRaw = await env.USERS.get(key.name);
    if (userRaw) {
      const u = JSON.parse(userRaw);
      users.push({
        id: u.id,
        email: u.email,
        username: u.username,
        role: u.role || "friend",
        createdAt: u.createdAt,
      });
    }
  }
  return users;
}

export async function onRequestGet({ request, env }) {
  const kvError = checkKV(env);
  if (kvError) return kvError;

  const user = await getUserFromRequest(request, env);
  if (!user || user.email !== ADMIN_EMAIL.toLowerCase()) {
    return json({ error: "无权限" }, 403);
  }

  const users = await getAllUsers(env);
  return json({ users });
}

export async function onRequestDelete({ request, env }) {
  const kvError = checkKV(env);
  if (kvError) return kvError;

  const user = await getUserFromRequest(request, env);
  if (!user || user.email !== ADMIN_EMAIL.toLowerCase()) {
    return json({ error: "无权限" }, 403);
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get("id");
  if (!userId) {
    return json({ error: "缺少用户ID" }, 400);
  }

  // Find user by id
  const allUsers = await env.USERS.list({ prefix: "user:" });
  let userEmail = null;
  for (const key of allUsers.keys) {
    const raw = await env.USERS.get(key.name);
    if (raw) {
      const u = JSON.parse(raw);
      if (u.id === userId) {
        userEmail = u.email;
        break;
      }
    }
  }

  if (!userEmail) {
    return json({ error: "用户不存在" }, 404);
  }

  if (userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return json({ error: "不能删除管理员账号" }, 400);
  }

  await env.USERS.delete(`user:${userEmail}`);
  return json({ success: true });
}
