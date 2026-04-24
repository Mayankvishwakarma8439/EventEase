import { Calendar, LayoutDashboard, LogIn, LogOut, Search } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar({ user, onLogout, searchQuery, onSearchChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#101214]/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
            >
              <div className="rounded-md bg-[#f4b860] p-2">
                <Calendar className="h-5 w-5 text-[#101214]" />
              </div>
              <span className="text-lg font-bold text-white">EventEase</span>
            </Link>

            {!isAuthPage && (
              <div className="hidden items-center gap-2 md:flex">
                <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2">
                  <Search className="h-4 w-4 text-white/70" />
                  <input
                    value={searchQuery}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search events, tags, organizers..."
                    className="w-72 bg-transparent text-sm text-white outline-none placeholder:text-white/45"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden rounded-md px-3 py-2 text-sm font-medium transition hover:bg-white/10 sm:block"
            >
              Explore
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-white/10"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <div className="hidden rounded-md border border-white/10 bg-white/8 px-3 py-2 text-sm text-[#f4b860] sm:block">
                  {user.name} · {user.role}
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 text-white" />
                  <span className="hidden text-sm sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-white/10"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="rounded-md bg-[#f4b860] px-3 py-2 text-sm font-bold text-[#101214]"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
