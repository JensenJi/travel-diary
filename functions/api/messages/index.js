import { checkKV, json, getUserFromRequest, getAllMessages, saveAllMessages, randomString } from "../../_lib.js";

// GET /api/messages — 获取留言列表
export async function onRequestGet({ request, env }) {
  const kvError = checkKV(env);
  if (kvError) return kvError;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  let messages = await getAllMessages(env);
  if (status) {
    messages = messages.filter((m) => m.status === status);
  }
  // 按时间倒序
  messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return json({ messages });
}

// POST /api/messages — 发布留言（需登录）
export async function onRequestPost({ request, env }) {
  const kvError = checkKV(env);
  if (kvError) return kvError;

  const user = await getUserFromRequest(request, env);
  if (!user) {
    return json({ error: "请先登录" }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "请求体格式错误" }, 400);
  }

  const { content } = body;
  if (!content || !content.trim()) {
    return json({ error: "留言内容不能为空" }, 400);
  }

  const messages = await getAllMessages(env);
  const message = {
    id: randomString(12),
    userId: user.id,
    userName: user.username,
    userEmail: user.email,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    status: "approved", // 默认通过，管理员可改
    reply: "",
  };

  messages.push(message);
  await saveAllMessages(env, messages);

  return json({ message });
}
