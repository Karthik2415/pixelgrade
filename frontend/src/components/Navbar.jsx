import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Generate readable page title
  const getTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) return 'Admin Dashboard';
    if (path.includes('/trainer/rooms') && path.split('/').length > 3) return 'Room Details';
    if (path.includes('/trainer/rooms')) return 'My Rooms';
    if (path.includes('/trainer/analytics')) return 'Analytics';
    if (path.includes('/trainer/contests') && path.includes('/analytics')) return 'Contest Analytics';
    if (path.includes('/trainer/contests')) return 'Contests';
    if (path.includes('/tasks/new')) return 'Create Task';
    if (path.includes('/student/rooms') && path.split('/').length > 3) return 'Classroom';
    if (path.includes('/student/rooms')) return 'My Classes';
    if (path.includes('/student/workspace')) return 'Workspace';
    if (path.includes('/student/results')) return 'Results';
    if (path.includes('/student/contests')) return 'Contests';
    return 'Dashboard';
  };
  const title = getTitle();

  return (
    <header className="h-16 bg-sidebar border-b border-gray-800 flex items-center justify-between px-8 animate-fade-in-down">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-white capitalize">
          {title}
        </h1>
      </div>

      <div className="flex items-center space-x-4 group cursor-default">
        <div className="text-right transition-all duration-300">
          <p className="text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:scale-110 group-hover:bg-primary/30">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
