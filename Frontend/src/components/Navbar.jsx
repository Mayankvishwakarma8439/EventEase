import { Calendar, LogOut, Search } from "lucide-react";

export default function Navbar({
  user,
  onPageChange,
  onLogout,
  searchQuery,
  onSearchChange,
}) {
  return (
    <nav className="sticky top-4 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onPageChange("home")}
              className="flex cursor-pointer items-center gap-3 rounded-full px-3 py-2 bg-white/5 backdrop-blur-xs border border-white/6 hover:scale-105 transform transition"
            >
              <div className="p-2 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#06b6d4] shadow-sm">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="text-lg font-semibold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-tr from-purple-300 to-cyan-200">
                  EventEase
                </span>
              </div>
            </button>

            <div className="hidden md:flex items-center gap-2 ml-2">
              <div className="relative">
                <div className="flex items-center gap-2 bg-white/4 border border-white/6 rounded-full px-3 py-2 backdrop-blur-xs">
                  <Search className="w-4 h-4 text-white/80" />
                  <input
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search events, locations, organizers..."
                    className="bg-transparent outline-none placeholder:text-white/60 text-sm w-72 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => onPageChange("home")}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/6 transition"
              >
                Explore
              </button>
              <button
                onClick={() => onPageChange("dashboard")}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/6 transition"
              >
                My Dashboard
              </button>
            </div>

            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-2 rounded-full bg-blue-400/6 border border-white/8 text-blue-300 text-sm">
                    {user.name}
                  </div>
                  <button
                    onClick={onLogout}
                    title="Logout"
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/6 rounded-lg hover:scale-105 transform transition"
                  >
                    <LogOut className="w-4 h-4 text-white" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => onPageChange("login")}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/6 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => onPageChange("signup")}
                  className="px-3 py-2 rounded-md text-sm font-semibold bg-gradient-to-tr from-[#7c3aed] to-[#06b6d4] shadow text-black"
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
