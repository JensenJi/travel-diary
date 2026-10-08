import { checkKV, json, getUserFromRequest, getAllMessages, saveAllMessages, ADMIN_EMAIL } from "../../_lib.js";

// PUT /api/messages/:id — 编辑留言（仅作者）
export async function onRequestPut({ request, env, params }) {
  const kvError = checkKV(env);
  if (kvError) return kvError;

  const user = await getUserFromRequest(request, env);
  if (!user) {
    return json({ error: "请先登录" }, 401);
  }

  const messages = await getAllMessages(env);
  const msg = messages.find((m) => m.id === params.id);
  if (!msg) {
    return json({ error: "留言不存在" }, 404);
  }
  if (msg.userId !== user.id && user.email !== ADMIN_EMAIL) {
    return json({ error: "无权编辑他人留言" }, 403);
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

  msg.content = content.trim();
  await saveAllMessages(env, messages);

  return json({ message: msg });
}

// DELETE /api/messages/:id — 删除留言（作者或管理员）
export async function onRequestDelete({ request, env, params }) {
  const kvError = checkKV(env);
  if (kvError) return kvError;

  const user = await getUserFromRequest(request, env);
  if (!user) {
    return json({ error: "请先登录" }, 401);
  }

  const messages = await getAllMessages(env);
  const msg = messages.find((m) => m.id === params.id);
  if (!msg) {
    return json({ error: "留言不存在" }, 404);
  }
  if (msg.userId !== user.id && user.email !== ADMIN_EMAIL) {
    return json({ error: "无权删除他人留言" }, 403);
  }

  const filtered = messages.filter((m) => m.id !== params.id);
  await saveAllMessages(env, filtered);

  return json({ success: true });
}
