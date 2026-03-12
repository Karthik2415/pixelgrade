import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  BarChart2, 
  LogOut 
} from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isTrainer = user.role === "trainer";

  const links = isTrainer
    ? [
        { name: "Rooms", path: "/trainer/rooms", icon: LayoutDashboard },
        { name: "Analytics", path: "/trainer/analytics", icon: BarChart2 },
      ]
    : [
        { name: "My Classes", path: "/student/rooms", icon: LayoutDashboard },
      ];

  return (
    <div className="w-64 bg-sidebar text-text flex flex-col h-screen border-r border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-primary">PixelGrade</h1>
        <p className="text-sm text-gray-400 mt-1 capitalize">{user.role} Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname.startsWith(link.path);

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center space-x-3 text-gray-400 hover:text-red-400 px-4 py-2 w-full transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
