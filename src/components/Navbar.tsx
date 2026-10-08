import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, ADMIN_EMAIL } from "@/context/AuthContext";
import { LogOut, Settings, Menu, X } from "lucide-react";

const navItems = [
  { name: "保险计算", path: "/insurance" },
  { name: "工厂审核", path: "/audit.html", external: true },
  { name: "我的作品", path: "/works" },
  { name: "好友留言", path: "/message" },
  { name: "我的简历", path: "/aboutme" },
  { name: "简历模板", path: "/resume-template.html", external: true },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  const renderLink = (item: { name: string; path: string; external?: boolean }) =>
    item.external ? (
      <a
        key={item.path}
        href={item.path}
        className={location.pathname === item.path ? "active" : ""}
        onClick={closeMenu}
      >
        {item.name}
      </a>
    ) : (
      <Link
        key={item.path}
        to={item.path}
        className={location.pathname === item.path ? "active" : ""}
        onClick={closeMenu}
      >
        {item.name}
      </Link>
    );

  return (
    <div className="nav-bar-wrapper">
      <div className="nav-bar">
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="菜单"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          {navItems.map(renderLink)}

          {user ? (
            <>
              {user.email === ADMIN_EMAIL && (
                <Link
                  to="/admin"
                  className={location.pathname === "/admin" ? "active" : ""}
                  title="后台管理"
                  onClick={closeMenu}
                >
                  <Settings className="w-4 h-4 inline" />
                  管理
                </Link>
              )}
              <button onClick={handleLogout} className="logout-btn" title="退出登录">
                <LogOut className="w-4 h-4 inline" />
                退出
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={location.pathname === "/login" ? "active" : ""}
              onClick={closeMenu}
            >
              注册登录
            </Link>
          )}
        </div>
      </div>

      {menuOpen && <div className="nav-mask" onClick={closeMenu} />}

      <style>{`
        .nav-bar-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 999;
          background-color: #f4f6dc;
          border-bottom: 1px solid #dbe08c;
        }
        .nav-bar {
          display: flex;
          padding: 0;
          width: 100%;
          max-width: 210mm;
          position: relative;
        }
        .nav-links {
          display: flex;
          align-items: stretch;
          width: 100%;
        }
        .nav-links a, .nav-links button {
          flex: 1 1 0;
          font-size: 16px;
          color: #89800c;
          padding: 10px 8px;
          transition: background-color 0.2s ease, color 0.2s ease;
          position: relative;
          text-decoration: none;
          font-weight: bold;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          gap: 4px;
        }
        .nav-links > *:not(:last-child)::after {
          content: "";
          position: absolute;
          right: 0;
          top: 25%;
          bottom: 25%;
          width: 1px;
          background: rgba(137, 128, 12, 0.3);
          pointer-events: none;
        }
        .nav-links a:hover,
        .nav-links a.active,
        .nav-links button:hover {
          color: #ffffff;
          font-weight: bold;
          background-color: #d1d678;
        }
        .hamburger-btn {
          display: none;
          background: none;
          border: none;
          color: #89800c;
          padding: 8px 12px;
          cursor: pointer;
          align-items: center;
        }
        .nav-mask {
          display: none;
        }

        @media (max-width: 768px) {
          .nav-bar {
            flex-direction: column;
          }
          .hamburger-btn {
            display: flex;
            align-self: flex-start;
            padding: 10px 14px;
          }
          .nav-links {
            display: none;
            flex-direction: column;
            width: 100%;
            background: transparent;
          }
          .nav-links.open {
            display: flex;
          }
          .nav-links a, .nav-links button {
            flex: none;
            width: 100%;
            justify-content: flex-start;
            padding: 14px 20px;
            border-bottom: 1px solid rgba(137, 128, 12, 0.2);
            writing-mode: horizontal-tb;
            white-space: nowrap;
          }
          .nav-links > *:not(:last-child)::after {
            display: none;
          }
          .nav-mask {
            display: block;
            position: fixed;
            top: 44px;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.4);
            z-index: 998;
          }
        }
      `}</style>
    </div>
  );
}
