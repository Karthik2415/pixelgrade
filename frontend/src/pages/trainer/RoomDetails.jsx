import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/api";
import { 
  Plus, 
  ChevronLeft, 
  Users, 
  BookOpen, 
  Calendar,
  ExternalLink,
  ClipboardList,
  Trash2
} from "lucide-react";

export default function RoomDetails() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoomData();
  }, [roomId]);

  const fetchRoomData = async () => {
    try {
      const roomRes = await api.get(`/rooms/${roomId}`);
      setRoom(roomRes.data.data);
    } catch (error) {
      console.error("Error fetching room:", error);
    }
    
    try {
      const tasksRes = await api.get(`/questions?roomId=${roomId}`);
      setTasks(tasksRes.data.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
    
    setLoading(false);
  };

  const handleDeleteTask = async (questionId, taskTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/questions/${questionId}`);
      setTasks((prev) => prev.filter((t) => t.questionId !== questionId));
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-white">Room not found</h2>
        <Link to="/trainer/rooms" className="text-primary mt-4 inline-block hover:underline">
          Back to rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/trainer/rooms" 
          className="flex items-center text-gray-400 hover:text-white transition-colors mb-4 inline-flex"
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Back to Rooms</span>
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
               <h1 className="text-4xl font-bold text-white">{room.name}</h1>
               <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-mono font-bold">
                 {room.roomCode}
               </div>
            </div>
            <p className="text-gray-400 max-w-2xl">{room.description || "No description provided."}</p>
          </div>
          
          <div className="flex items-center space-x-4 bg-panel p-4 rounded-xl border border-gray-800 shadow-xl">
             <div className="text-center px-4">
                <div className="text-2xl font-bold text-white">{room.students?.length || 0}</div>
                <div className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Students</div>
             </div>
             <div className="w-px h-8 bg-gray-700" />
             <div className="text-center px-4">
                <div className="text-2xl font-bold text-white">{tasks.length}</div>
                <div className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Tasks</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <ClipboardList size={22} className="mr-2 text-primary" />
              Assigned Tasks
            </h2>
            <Link
              to={`/trainer/rooms/${roomId}/tasks/new`}
              className="bg-primary hover:bg-primary/90 text-white p-2 rounded-lg flex items-center transition-colors shadow-lg shadow-primary/20"
            >
              <Plus size={20} className="mr-1" />
              <span className="text-sm font-bold">Create Task</span>
            </Link>
          </div>

          {tasks.length === 0 ? (
            <div className="bg-panel border border-dashed border-gray-700 rounded-2xl p-12 text-center">
              <BookOpen size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No tasks assigned yet</h3>
              <p className="text-gray-400 mb-6">Start by creating a new frontend coding challenge for this room.</p>
              <Link
                to={`/trainer/rooms/${roomId}/tasks/new`}
                className="text-primary hover:underline font-medium"
              >
                Create your first task
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div 
                  key={task.questionId}
                  className="bg-panel border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all flex justify-between items-center group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-800 w-12 h-12 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{task.title}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Link 
                      to={`/trainer/analytics?taskId=${task.questionId}`}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="View Submissions"
                    >
                      <ExternalLink size={20} />
                    </Link>
                    <button
                      onClick={() => handleDeleteTask(task.questionId, task.title)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Info / Student List Placeholder */}
        <div className="space-y-6">
          <div className="bg-panel border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Users size={18} className="mr-2 text-primary" />
              Students
            </h3>
            {room.students?.length > 0 ? (
              <div className="space-y-3">
                {/* Normally we'd fetch student names, but for now we show IDs or count */}
                <p className="text-gray-400 text-sm">
                   Students are listed here as they join using your room code.
                </p>
                <div className="text-primary font-mono text-sm bg-primary/10 p-3 rounded-lg border border-primary/20 text-center">
                  CODE: {room.roomCode}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm italic">No students joined yet.</p>
                <p className="text-xs text-gray-600 mt-2">Share your code to invite them!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
