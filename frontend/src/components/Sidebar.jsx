import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  BarChart2, 
  Trophy,
  Flame,
  LogOut 
} from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isTrainer = user.role === "trainer";
  const isAdmin = user.role === "admin";

  const links = isAdmin
    ? [
        { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      ]
    : isTrainer
    ? [
        { name: "Rooms", path: "/trainer/rooms", icon: LayoutDashboard },
        { name: "Contests", path: "/trainer/contests", icon: Flame },
        { name: "Leaderboard", path: "/trainer/leaderboard", icon: Trophy },
        { name: "Analytics", path: "/trainer/analytics", icon: BarChart2 },
      ]
    : [
        { name: "My Classes", path: "/student/rooms", icon: LayoutDashboard },
        { name: "Contests", path: "/student/contests", icon: Flame },
        { name: "Leaderboard", path: "/student/leaderboard", icon: Trophy },
      ];

  return (
    <div className="w-64 bg-sidebar text-text flex flex-col h-screen border-r border-gray-800">
      <div className="p-6 border-b border-gray-800 animate-fade-in">
        <h1 className="text-2xl font-bold gradient-text">PixelGrade</h1>
        <p className="text-sm text-gray-400 mt-1 capitalize">{user.role} Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 stagger-children">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname.startsWith(link.path);

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group animate-fade-in-up ${
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary shadow-lg shadow-primary/5"
                  : "text-gray-400 hover:bg-gray-800/60 hover:text-white hover:translate-x-1"
              }`}
            >
              <Icon size={20} className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="font-medium">{link.name}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse"></span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center space-x-3 text-gray-400 hover:text-red-400 px-4 py-2 w-full transition-all duration-200 rounded-lg hover:bg-red-500/10 active:scale-[0.97] group"
        >
          <LogOut size={20} className="transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
