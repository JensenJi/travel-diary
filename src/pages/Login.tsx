import Navbar from "@/components/Navbar";
import { User, Lock, Mail, AlertCircle, BarChart3, Monitor, Smartphone, Users, Globe } from "lucide-react";
import { useState, type ChangeEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type UserRole = "friend" | "admin";
type AuthMode = "login" | "register";

interface VisitStats {
  totalVisits: number;
  uniqueVisitors: number;
  deviceStats: Record<string, number>;
  osStats?: Record<string, number>;
  sourceStats?: Record<string, number>;
  regionStats?: Record<string, number>;
}

export default function Login() {
  const [role, setRole] = useState<UserRole>("friend");
  const [mode, setMode] = useState<AuthMode>("login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<VisitStats | null>(null);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // 记录访问并获取统计
  useEffect(() => {
    const recordVisit = async () => {
      try {
        await fetch("/api/stats/visit", { method: "POST" });
      } catch { /* ignore */ }
    };
    recordVisit();

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats/visit");
        const data = await res.json();
        if (data.stats) setStats(data.stats);
      } catch { /* ignore */ }
    };
    fetchStats();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(formData.email, formData.password, role);
        navigate(role === "admin" ? "/admin" : "/");
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError("两次密码输入不一致！");
          return;
        }
        if (formData.password.length < 6) {
          setError("密码至少需要6位！");
          return;
        }
        await register(formData.email, formData.password, formData.username, role);
        navigate(role === "admin" ? "/admin" : "/");
      }
    } catch (err: any) {
      setError(err.message || "操作失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const title = role === "admin" ? "管理员" : "好友";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dbe08c]/20 to-[#89800c]/20">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-[210mm] mx-auto mt-4 sm:mt-8 mb-4 sm:mb-8 px-4">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* 角色切换 Tab */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setRole("friend")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  role === "friend"
                    ? "bg-[#dbe08c] text-[#89800c]"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                好友登录/注册
              </button>
              <button
                onClick={() => setRole("admin")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  role === "admin"
                    ? "bg-[#dbe08c] text-[#89800c]"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Monitor className="w-4 h-4 inline mr-2" />
                管理员登录/注册
              </button>
            </div>

            {/* 标题栏 */}
            <div className="bg-[#dbe08c] p-4">
              <h2 className="text-2xl font-bold text-center text-[#89800c]">
                {mode === "login" ? `${title}登录` : `${title}注册`}
              </h2>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 px-4 py-3 mx-8 mt-4 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-600">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-4 sm:space-y-6">
              {mode === "register" && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#89800c]" />
                  <input
                    type="text"
                    name="username"
                    placeholder="用户名"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-[#dbe08c] rounded-lg focus:outline-none focus:border-[#89800c] transition-colors"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#89800c]" />
                <input
                  type="email"
                  name="email"
                  placeholder="电子邮箱"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#dbe08c] rounded-lg focus:outline-none focus:border-[#89800c] transition-colors"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#89800c]" />
                <input
                  type="password"
                  name="password"
                  placeholder="密码（至少6位）"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#dbe08c] rounded-lg focus:outline-none focus:border-[#89800c] transition-colors"
                  required
                />
              </div>

              {mode === "register" && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#89800c]" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="确认密码"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-[#dbe08c] rounded-lg focus:outline-none focus:border-[#89800c] transition-colors"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#dbe08c] text-[#89800c] font-bold rounded-lg hover:bg-[#89800c] hover:text-white transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? `${mode === "login" ? "登录中..." : "注册中..."}` : `${mode === "login" ? "登录" : "注册"}`}
              </button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "register" : "login")}
                  className="text-[#89800c] hover:text-[#d1d678] font-medium transition-colors"
                >
                  {mode === "login" ? `还没有${title}账号？立即注册` : `已有${title}账号？立即登录`}
                </button>

                {mode === "login" && (
                  <div className="flex justify-between items-center">
                    <Link to="/" className="text-sm text-gray-500 hover:text-[#89800c] transition-colors">
                      返回首页
                    </Link>
                    <Link to="/forgot-password" className="text-sm text-[#89800c] hover:text-[#d1d678] transition-colors">
                      忘记密码？
                    </Link>
                  </div>
                )}
              </div>
            </form>

            {/* 访问统计 */}
            {stats && (
              <div className="border-t border-gray-100 bg-gray-50 px-8 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-[#89800c]" />
                  <span className="text-sm font-medium text-gray-700">访问统计</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                    <div className="text-xl font-bold text-[#89800c]">{stats.totalVisits.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">总访问量</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                    <div className="text-xl font-bold text-[#89800c]">{stats.uniqueVisitors.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">访客数</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                    <div className="flex items-center justify-center gap-1">
                      <Monitor className="w-4 h-4 text-gray-400" />
                      <span className="text-lg font-bold text-gray-700">
                        {stats.deviceStats?.Desktop || 0}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">电脑端</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                    <div className="flex items-center justify-center gap-1">
                      <Smartphone className="w-4 h-4 text-gray-400" />
                      <span className="text-lg font-bold text-gray-700">
                        {(stats.deviceStats?.Mobile || 0) + (stats.deviceStats?.Tablet || 0)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">移动端</div>
                  </div>
                </div>
                {stats.osStats && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(stats.osStats).slice(0, 4).map(([os, count]) => (
                      <span key={os} className="text-xs bg-white border border-gray-200 rounded-full px-2 py-1 text-gray-600">
                        {os}: {count as number}
                      </span>
                    ))}
                  </div>
                )}
                {stats.sourceStats && (
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <Globe className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(stats.sourceStats).slice(0, 5).map(([src, count]) => (
                        <span key={src} className="text-xs text-gray-500">
                          {src}({count as number})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
