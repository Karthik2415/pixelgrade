import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { Plus, Users, ArrowRight, DoorOpen, Layout } from "lucide-react";

export default function StudentRoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get("/rooms");
      setRooms(response.data.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    setJoining(true);
    try {
      await api.post("/rooms/join", { roomCode });
      setRoomCode("");
      setShowJoinModal(false);
      fetchRooms();
    } catch (error) {
      console.error("Error joining room:", error);
      alert(error.response?.data?.message || "Failed to join room");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Classes</h1>
          <p className="text-gray-400 mt-1">Classrooms you have joined</p>
        </div>
        <button
          onClick={() => setShowJoinModal(true)}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-lg shadow-primary/20"
        >
          <DoorOpen size={20} />
          <span>Join Room</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-panel rounded-xl h-48 animate-pulse border border-gray-800" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-panel border border-dashed border-gray-700 rounded-2xl p-12 text-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <Layout size={32} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No joined rooms</h3>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">
            You haven't joined any classrooms yet. Ask your instructor for a room code to get started.
          </p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="text-primary hover:underline font-medium"
          >
            Join a room now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.roomId}
              className="bg-panel border border-gray-800 rounded-xl overflow-hidden hover:border-primary/50 transition-all group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 px-3 py-1 rounded text-primary text-xs font-bold uppercase tracking-wider">
                    Enrolled
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                  {room.name}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-6">
                  {room.description || "No description provided."}
                </p>
                <div className="flex items-center justify-end mt-auto">
                  <Link
                    to={`/student/rooms/${room.roomId}`}
                    className="flex items-center space-x-2 text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <span>View Tasks</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-panel border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Join a Classroom</h2>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Room Access Code
                </label>
                <input
                  type="text"
                  required
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-char code (e.g. PXG123)"
                  maxLength={10}
                  className="w-full bg-background border border-gray-700 rounded-lg px-4 py-2.5 text-white font-mono text-center text-xl tracking-widest focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joining}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {joining ? "Joining..." : "Join Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
