import { checkKV, json, hashPassword, getUserFromRequest, getUserByEmail, saveUser, randomString } from "../../_lib.js";

export async function onRequestPut({ request, env }) {
  const kvError = checkKV(env);
  if (kvError) return kvError;

  const user = await getUserFromRequest(request, env);
  if (!user) {
    return json({ error: "未登录" }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "请求体格式错误" }, 400);
  }

  const { oldPassword, newPassword } = body;
  if (!oldPassword || !newPassword) {
    return json({ error: "旧密码和新密码都不能为空" }, 400);
  }
  if (newPassword.length < 6) {
    return json({ error: "新密码至少需要6位" }, 400);
  }

  const dbUser = await getUserByEmail(env, user.email);
  if (!dbUser) {
    return json({ error: "用户不存在" }, 404);
  }

  const oldHash = await hashPassword(oldPassword, dbUser.salt);
  if (oldHash !== dbUser.passwordHash) {
    return json({ error: "旧密码不正确" }, 403);
  }

  const newSalt = randomString(16);
  const newHash = await hashPassword(newPassword, newSalt);
  dbUser.salt = newSalt;
  dbUser.passwordHash = newHash;
  await saveUser(env, dbUser);

  return json({ success: true });
}
