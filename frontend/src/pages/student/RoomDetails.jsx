import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/api";
import { 
  ChevronLeft, 
  BookOpen, 
  CheckCircle,
  FileText,
  Play,
  Clock
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
            {tasks.map((task) => {
              const isFinished = task.latestSubmissionStatus === 'evaluated' || task.latestSubmissionStatus === 'pending';
              const borderClass = isFinished 
                ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:border-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]' 
                : 'border-red-500/50 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]';

              return (
                <div 
                  key={task.questionId}
                  className={`bg-panel border-2 rounded-xl overflow-hidden transition-all flex flex-col group relative ${borderClass}`}
                >
                  {isFinished && (
                    <div className="absolute top-4 right-4 z-10 bg-green-500 text-white rounded-full p-1 shadow-lg shadow-green-500/50">
                      <CheckCircle size={24} strokeWidth={2.5} />
                    </div>
                  )}
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
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center text-xs font-bold uppercase tracking-widest px-2 py-1 rounded border ${
                        isFinished 
                          ? 'text-green-400 bg-green-400/10 border-green-400/20' 
                          : 'text-red-400 bg-red-400/10 border-red-400/20'
                      }`}>
                        {isFinished ? (
                          <>
                            <CheckCircle size={12} className="mr-1" />
                            Finished
                          </>
                        ) : (
                          <>
                            <Play size={12} className="mr-1" />
                            Active
                          </>
                        )}
                      </div>
                      {task.timeLimit && (
                        <div className="flex items-center text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-400/10 px-2 py-1 rounded border border-orange-400/20">
                          <Clock size={12} className="mr-1" />
                          {task.timeLimit} min
                        </div>
                      )}
                    </div>
                    <Link
                      to={`/student/workspace/${task.questionId}`}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        isFinished 
                          ? 'bg-panel border border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-500' 
                          : 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'
                      }`}
                    >
                      {isFinished ? 'Review Submission' : 'Start Challenge'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}
