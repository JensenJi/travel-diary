import { checkKV, json, getUserFromRequest, getAllMessages, saveAllMessages, ADMIN_EMAIL } from "../../../_lib.js";

// PUT /api/messages/:id/review — 审核留言（仅管理员）
export async function onRequestPut({ request, env, params }) {
  const kvError = checkKV(env);
  if (kvError) return kvError;

  const user = await getUserFromRequest(request, env);
  if (!user) {
    return json({ error: "请先登录" }, 401);
  }
  if (user.email !== ADMIN_EMAIL) {
    return json({ error: "仅管理员可审核留言" }, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "请求体格式错误" }, 400);
  }

  const { status, reply } = body;
  if (!status) {
    return json({ error: "状态不能为空" }, 400);
  }

  const messages = await getAllMessages(env);
  const msg = messages.find((m) => m.id === params.id);
  if (!msg) {
    return json({ error: "留言不存在" }, 404);
  }

  msg.status = status;
  msg.reply = reply || "";
  await saveAllMessages(env, messages);

  return json({ message: msg });
}
