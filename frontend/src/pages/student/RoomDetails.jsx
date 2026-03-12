import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/api";
import { 
  ChevronLeft, 
  BookOpen, 
  CheckCircle,
  FileText,
  Play
} from "lucide-react";

export default function StudentRoomDetails() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!room) {
    return (
       <div className="p-8 text-center text-white">
         <h2 className="text-2xl font-bold">Room not found</h2>
         <Link to="/student/rooms" className="text-primary mt-4 inline-block">Back to Rooms</Link>
       </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/student/rooms" 
          className="flex items-center text-gray-400 hover:text-white transition-colors mb-4 inline-flex"
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Back to Classes</span>
        </Link>
        <h1 className="text-4xl font-bold text-white mb-2">{room.name}</h1>
        <p className="text-gray-400">{room.description || "No description provided."}</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <BookOpen size={22} className="mr-2 text-primary" />
          Available Assignments
        </h2>

        {tasks.length === 0 ? (
          <div className="bg-panel border border-dashed border-gray-700 rounded-2xl p-12 text-center text-gray-500">
             No tasks assigned to this room yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div 
                key={task.questionId}
                className="bg-panel border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-all flex flex-col group"
              >
                {task.referenceImage ? (
                  <div className="aspect-video w-full bg-gray-900 border-b border-gray-800 relative overflow-hidden">
                    <img 
                      src={task.referenceImage.startsWith('data:') ? task.referenceImage : `data:image/png;base64,${task.referenceImage}`}
                      alt={task.title}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gray-900 border-b border-gray-800 flex items-center justify-center text-gray-700">
                    <FileText size={48} />
                  </div>
                )}
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                    {task.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex-1">
                    {task.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 bg-gray-800 px-2 py-1 rounded">
                      <Play size={12} className="mr-1" />
                      Active
                    </div>
                    <Link
                      to={`/student/workspace/${task.questionId}`}
                      className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      Start Challenge
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
