const API_BASE_URL = "/api";

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string | Date;
  status?: string;
  reply?: string;
}

export const getMessages = async (status?: string): Promise<Message[]> => {
  const token = localStorage.getItem("token");
  const params = status ? `?status=${status}` : "";
  const res = await fetch(`${API_BASE_URL}/messages${params}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("获取留言失败");
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    return data.messages || [];
  } catch (e) {
    console.error("getMessages JSON parse error, response text:", text);
    throw e;
  }
};

export const saveMessage = async (
  _userId: string,
  _userName: string,
  _userEmail: string,
  content: string
): Promise<string> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("请先登录");
  const res = await fetch(`${API_BASE_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "发布留言失败");
  return data.message.id;
};

export const updateMessage = async (id: string, content: string): Promise<void> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("请先登录");
  const res = await fetch(`${API_BASE_URL}/messages/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "编辑留言失败");
};

export const reviewMessage = async (
  id: string,
  status: string,
  reply: string
): Promise<void> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("请先登录");
  const res = await fetch(`${API_BASE_URL}/messages/${id}/review`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, reply }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "审核操作失败");
};

export const deleteMessage = async (id: string): Promise<void> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("请先登录");
  const res = await fetch(`${API_BASE_URL}/messages/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("删除留言失败");
};
