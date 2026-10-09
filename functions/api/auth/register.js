import { checkKV, json, hashPassword, createToken, getUserByEmail, saveUser, randomString, ADMIN_EMAIL } from "../../_lib.js";

export async function onRequestPost({ request, env }) {
  const kvError = checkKV(env);
  if (kvError) return kvError;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "请求体格式错误" }, 400);
  }

  const { email, password, username, role } = body;

  if (!email || !password || !username) {
    return json({ error: "邮箱、密码和用户名都不能为空" }, 400);
  }
  if (password.length < 6) {
    return json({ error: "密码至少需要6位" }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "邮箱格式不正确" }, 400);
  }

  // 角色默认为friend，管理员邮箱自动为admin
  let userRole = (role === "admin" || role === "friend") ? role : "friend";
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    userRole = "admin";
  }

  // 检查邮箱是否已注册
  const existing = await getUserByEmail(env, email.toLowerCase());
  if (existing) {
    return json({ error: "该邮箱已注册" }, 409);
  }

  const salt = randomString(16);
  const passwordHash = await hashPassword(password, salt);
  const user = {
    id: randomString(12),
    email: email.toLowerCase(),
    username,
    passwordHash,
    salt,
    role: userRole,
    createdAt: new Date().toISOString(),
  };

  await saveUser(env, user);

  const token = await createToken(
    { userId: user.id, email: user.email, username: user.username, role: user.role, iat: Date.now() },
    env
  );

  return json({
    token,
    user: { id: user.id, email: user.email, username: user.username, role: user.role },
  });
}
