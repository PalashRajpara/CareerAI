/**
 * Navbar.js
 * Glassmorphism navigation bar with neon accents, animated indicator, and mobile menu.
 * Auth-aware: shows different links for guests, users, and admins.
 */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const guestLinks = [
  { path: "/", label: "Home", icon: "⌂" },
  { path: "/upload", label: "Upload", icon: "↑" },
  { path: "/discover", label: "Discover", icon: "◈" },
  { path: "/about", label: "About", icon: "ⓘ" },
  { path: "/login", label: "Sign In", icon: "→" },
];

const userLinks = [
  { path: "/", label: "Home", icon: "⌂" },
  { path: "/upload", label: "Upload", icon: "↑" },
  { path: "/discover", label: "Discover", icon: "◈" },
  { path: "/applications", label: "Applications", icon: "📋" },
  { path: "/career-insights", label: "Insights", icon: "⚡" },
  { path: "/learning-hub", label: "Learning", icon: "📖" },
  { path: "/roadmaps", label: "Roadmaps", icon: "🗺️" },
  { path: "/my-profile", label: "Profile", icon: "◎" },
];

const adminLinks = [
  { path: "/", label: "Home", icon: "⌂" },
  { path: "/admin", label: "Admin", icon: "▦" },
  { path: "/discover", label: "Discover", icon: "◈" },
  { path: "/my-profile", label: "Profile", icon: "◎" },
];

function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = user
    ? user.is_admin
      ? adminLinks
      : userLinks
    : guestLinks;

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
    >
      <div className="max-w-7xl mx-auto">
        <div className="relative flex items-center justify-between px-6 py-3 rounded-2xl bg-[rgba(10,10,15,0.7)] backdrop-blur-2xl border border-[rgba(0,255,200,0.08)] shadow-[0_0_40px_rgba(0,0,0,0.3)]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[#00ffc8]/20 to-[#06b6d4]/20 border border-[#00ffc8]/30 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(0,255,200,0.3)] transition-shadow duration-300">
              <span className="text-[#00ffc8] font-bold text-sm">AI</span>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#00ffc8]/10 to-transparent animate-glow-pulse" />
            </div>
            <span className="text-white font-semibold text-lg hidden sm:block">
              Career<span className="text-[#00ffc8]">AI</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-2 rounded-xl text-sm font-medium no-underline transition-all duration-300
                    ${isActive
                      ? "text-[#00ffc8]"
                      : "text-slate-400 hover:text-white"
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl bg-[rgba(0,255,200,0.08)] border border-[rgba(0,255,200,0.15)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
            {user && (
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <motion.span animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 8 : 0 }} className="w-6 h-0.5 bg-[#00ffc8] block transition-all" />
            <motion.span animate={{ opacity: mobileOpen ? 0 : 1 }} className="w-6 h-0.5 bg-[#00ffc8] block" />
            <motion.span animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -8 : 0 }} className="w-6 h-0.5 bg-[#00ffc8] block transition-all" />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="lg:hidden mt-2 rounded-2xl bg-[rgba(10,10,15,0.9)] backdrop-blur-2xl border border-[rgba(0,255,200,0.08)] overflow-hidden"
            >
              <div className="p-4 grid grid-cols-2 gap-2">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium no-underline transition-all duration-300
                        ${isActive
                          ? "bg-[rgba(0,255,200,0.1)] text-[#00ffc8] border border-[rgba(0,255,200,0.2)]"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      <span>{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
                {user && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all col-span-2"
                  >
                    <span>⏻</span>
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

export default Navbar;
