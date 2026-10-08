import { checkKV, json, hashPassword, createToken, getUserByEmail } from "../../_lib.js";

export async function onRequestPost({ request, env }) {
  const kvError = checkKV(env);
  if (kvError) return kvError;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "请求体格式错误" }, 400);
  }

  const { email, password } = body;

  if (!email || !password) {
    return json({ error: "邮箱和密码都不能为空" }, 400);
  }

  const user = await getUserByEmail(env, email.toLowerCase());
  if (!user) {
    return json({ error: "邮箱或密码不正确" }, 401);
  }

  const hash = await hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    return json({ error: "邮箱或密码不正确" }, 401);
  }

  const token = await createToken(
    { userId: user.id, email: user.email, username: user.username, iat: Date.now() },
    env
  );

  return json({
    token,
    user: { id: user.id, email: user.email, username: user.username },
  });
}
