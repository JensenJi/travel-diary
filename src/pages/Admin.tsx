import Navbar from "@/components/Navbar";
import { useAuth, ADMIN_EMAIL } from "@/context/AuthContext";
import { Users, Mail, Calendar, Shield, LogOut, BarChart3, MessageCircle, Trash2, Monitor, Smartphone, Globe, X, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getMessages, deleteMessage, Message } from "@/services/messageService";
import * as echarts from "echarts";

interface UserData {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
}

interface VisitStats {
  totalVisits: number;
  uniqueVisitors: number;
  osStats: Record<string, number>;
  deviceStats: Record<string, number>;
  sourceStats: Record<string, number>;
  regionStats?: Record<string, number>;
  dailyVisits: Record<string, number>;
}

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"messages" | "users" | "stats">("messages");
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);
  const [userPage, setUserPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const osChartRef = useRef<HTMLDivElement>(null);
  const deviceChartRef = useRef<HTMLDivElement>(null);
  const regionChartRef = useRef<HTMLDivElement>(null);
  const sourceChartRef = useRef<HTMLDivElement>(null);
  const chartInstances = useRef<echarts.ECharts[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin" && user.email !== ADMIN_EMAIL) {
      navigate("/");
      return;
    }

    loadAll();
  }, [user, navigate]);

  const loadAll = async () => {
    try {
      await Promise.all([
        loadMessages(),
        loadUsers(),
        loadStats(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const data = await getMessages();
      setMessages(data);
    } catch (error) {
      console.error("加载留言失败:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (error) {
      console.error("加载用户失败:", error);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/stats/visit", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.stats) setStats(data.stats);
    } catch (error) {
      console.error("加载统计失败:", error);
    }
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("确定要删除这条留言吗？")) return;
    try {
      await deleteMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (error: any) {
      alert(error.message || "删除失败");
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    setDeleteConfirm({ type: "user", id, name });
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirm) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users?id=${deleteConfirm.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== deleteConfirm.id));
        setDeleteConfirm(null);
      } else {
        const data = await res.json();
        alert(data.error || "删除失败");
      }
    } catch (error: any) {
      alert(error.message || "删除失败");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // 饼图渲染（必须放在提前 return 之前，否则违反 React Hooks 规则导致页面崩溃白屏）
  useEffect(() => {
    if (activeTab !== "stats" || !stats) return;

    // 清理旧图表
    chartInstances.current.forEach(c => c.dispose());
    chartInstances.current = [];

    const pieColors = ["#89800c", "#dbe08c", "#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#F44336", "#795548", "#009688", "#FF5722"];

    const renderPie = (ref: React.RefObject<HTMLDivElement>, title: string, data: Record<string, number>) => {
      if (!ref.current) return;
      const chart = echarts.init(ref.current);
      const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
      const chartData = entries.map(([name, value], i) => ({
        name,
        value: value as number,
        itemStyle: { color: pieColors[i % pieColors.length] },
      }));
      chart.setOption({
        title: { text: title, left: "center", textStyle: { fontSize: 14, fontWeight: "bold" } },
        tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
        legend: { bottom: 5, type: "scroll", textStyle: { fontSize: 12 } },
        series: [{
          type: "pie",
          radius: ["35%", "60%"],
          center: ["50%", "48%"],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
          label: { show: true, formatter: "{d}%", fontSize: 11 },
          data: chartData,
        }],
      });
      chartInstances.current.push(chart);
    };

    renderPie(osChartRef, "操作系统分布", stats.osStats || {});
    renderPie(deviceChartRef, "设备来源分布", stats.deviceStats || {});
    renderPie(regionChartRef, "访问地区分布", stats.regionStats || {});
    renderPie(sourceChartRef, "访问来源分布", stats.sourceStats || {});

    const handleResize = () => chartInstances.current.forEach(c => c.resize());
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstances.current.forEach(c => c.dispose());
      chartInstances.current = [];
    };
  }, [activeTab, stats]);

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#89800c] mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  const friendUsers = users.filter(u => u.role !== "admin");

  // 用户分页：每页10条
  const usersPerPage = 10;
  const totalUserPages = Math.ceil(friendUsers.length / usersPerPage);
  const pagedUsers = friendUsers.slice((userPage - 1) * usersPerPage, userPage * usersPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-[210mm] mx-auto px-4 sm:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">后台管理</h1>
              <p className="text-gray-600 mt-2">查看网站用户统计和管理</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors self-start sm:self-auto"
            >
              <LogOut className="w-5 h-5" />
              退出登录
            </button>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">总留言数</p>
                  <p className="text-2xl font-bold text-gray-800">{messages.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">好友用户数</p>
                  <p className="text-2xl font-bold text-gray-800">{friendUsers.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">总访问量</p>
                  <p className="text-2xl font-bold text-gray-800">{stats?.totalVisits || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">管理员</p>
                  <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.role === "admin").length || 1}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab 切换 */}
          <div className="flex border-b border-gray-200 mb-6 gap-1">
            <button
              onClick={() => setActiveTab("messages")}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                activeTab === "messages"
                  ? "bg-[#dbe08c] text-[#89800c]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-1" />
              留言管理
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                activeTab === "users"
                  ? "bg-[#dbe08c] text-[#89800c]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Users className="w-4 h-4 inline mr-1" />
              用户管理
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                activeTab === "stats"
                  ? "bg-[#dbe08c] text-[#89800c]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-1" />
              访问统计
            </button>
          </div>

          {/* 留言管理 */}
          {activeTab === "messages" && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-[#dbe08c] px-6 py-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[#89800c]" />
                  <h2 className="font-bold text-[#89800c]">留言列表</h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">暂无留言</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">用户名</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">邮箱</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">留言内容</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">时间</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((msg) => (
                        <tr key={msg.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#dbe08c] rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-[#89800c]">
                                  {msg.userName.charAt(0)}
                                </span>
                              </div>
                              <span className="font-medium text-gray-800">{msg.userName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">{msg.userEmail}</td>
                          <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{msg.content}</td>
                          <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(msg.createdAt)}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                              title="删除留言"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* 用户管理 */}
          {activeTab === "users" && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-[#dbe08c] px-6 py-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#89800c]" />
                  <h2 className="font-bold text-[#89800c]">好友用户列表</h2>
                  <span className="text-sm text-[#89800c] ml-2">（共 {friendUsers.length} 人）</span>
                </div>
              </div>
              <div className="overflow-x-auto" style={{ maxHeight: "500px", overflowY: "auto" }}>
                {friendUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">暂无好友用户</div>
                ) : (
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">用户名</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">邮箱</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">角色</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">注册时间</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedUsers.map((u) => (
                        <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#dbe08c] rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-[#89800c]">
                                  {u.username.charAt(0)}
                                </span>
                              </div>
                              <span className="font-medium text-gray-800">{u.username}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              {u.role === "admin" ? "管理员" : "好友"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(u.createdAt)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedUser(u)}
                                className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                                title="查看联系方式"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.username)}
                                className="text-red-500 hover:text-red-700 transition-colors p-1"
                                title="删除用户"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {/* 分页 */}
              {totalUserPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
                  <span className="text-sm text-gray-600">
                    第 {userPage} / {totalUserPages} 页（每页 {usersPerPage} 条）
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUserPage(p => Math.max(1, p - 1))}
                      disabled={userPage === 1}
                      className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-30"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                      disabled={userPage === totalUserPages}
                      className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-30"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 用户详情弹窗 */}
          {selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedUser(null)}>
              <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">用户详情</h3>
                  <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#dbe08c] rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-[#89800c]">{selectedUser.username.charAt(0)}</span>
                    </div>
                    <span className="text-xl font-medium text-gray-800">{selectedUser.username}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-[#89800c]" />
                    <span className="text-sm">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-[#89800c]" />
                    <span className="text-sm">注册时间：{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="w-4 h-4 text-[#89800c]" />
                    <span className="text-sm">角色：{selectedUser.role === "admin" ? "管理员" : "好友"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 访问统计 */}
          {activeTab === "stats" && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-[#89800c]">{stats.totalVisits.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-2">总访问量</div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-[#89800c]">{stats.uniqueVisitors.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-2">访客数</div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">{Object.keys(stats.dailyVisits || {}).length}</div>
                  <div className="text-sm text-gray-500 mt-2">活跃天数</div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-green-600">{messages.length}</div>
                  <div className="text-sm text-gray-500 mt-2">留言数</div>
                </div>
              </div>

              {/* 四个饼图 */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-[#dbe08c] px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-[#89800c]" />
                      <h2 className="font-bold text-[#89800c]">操作系统</h2>
                    </div>
                  </div>
                  <div ref={osChartRef} style={{ height: "280px", width: "100%" }}></div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-[#dbe08c] px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-[#89800c]" />
                      <h2 className="font-bold text-[#89800c]">设备来源</h2>
                    </div>
                  </div>
                  <div ref={deviceChartRef} style={{ height: "280px", width: "100%" }}></div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-[#dbe08c] px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-[#89800c]" />
                      <h2 className="font-bold text-[#89800c]">访问地区</h2>
                    </div>
                  </div>
                  <div ref={regionChartRef} style={{ height: "280px", width: "100%" }}></div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-[#dbe08c] px-6 py-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#89800c]" />
                      <h2 className="font-bold text-[#89800c]">访问来源</h2>
                    </div>
                  </div>
                  <div ref={sourceChartRef} style={{ height: "280px", width: "100%" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 删除确认弹窗 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">确认删除</h3>
              <button onClick={() => setDeleteConfirm(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              确定要删除用户「{deleteConfirm.name}」吗？该用户的所有数据将被移除。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteUser}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
