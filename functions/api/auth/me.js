import { checkKV, json, getUserFromRequest } from "../../_lib.js";

export async function onRequestGet({ request, env }) {
  const kvError = checkKV(env);
  if (kvError) return kvError;

  const user = await getUserFromRequest(request, env);
  if (!user) {
    return json({ error: "未登录或 token 已失效" }, 401);
  }

  return json({ user });
}
