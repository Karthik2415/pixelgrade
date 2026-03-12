import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { Plus, Users, ArrowRight, Copy, Check } from "lucide-react";

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

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

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    setCreating(true);
    try {
      await api.post("/rooms", {
        name: newRoomName,
        description: newRoomDesc,
      });
      setNewRoomName("");
      setNewRoomDesc("");
      setShowModal(false);
      fetchRooms();
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Rooms</h1>
          <p className="text-gray-400 mt-1">Manage your classrooms and assign tasks</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          <span>New Room</span>
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
            <Users size={32} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No rooms yet</h3>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">
            Create your first classroom to start inviting students and assigning frontend tasks.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="text-primary hover:underline font-medium"
          >
            Create a room now
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
                    Classroom
                  </div>
                  <button
                    onClick={() => copyToClipboard(room.roomCode)}
                    className="text-gray-400 hover:text-white flex items-center space-x-1 text-sm bg-gray-800/50 px-2 py-1 rounded group/copy"
                    title="Copy Room Code"
                  >
                    <span className="font-mono text-primary">{room.roomCode}</span>
                    {copiedCode === room.roomCode ? (
                      <Check size={14} className="text-secondary" />
                    ) : (
                      <Copy size={12} className="opacity-50 group-hover/copy:opacity-100" />
                    )}
                  </button>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                  {room.name}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-6">
                  {room.description || "No description provided."}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Users size={16} className="mr-1.5" />
                    <span>{room.students?.length || 0} Students</span>
                  </div>
                  <Link
                    to={`/trainer/rooms/${room.roomId}`}
                    className="text-white bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors"
                  >
                    <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-panel border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Room</h2>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Room Name
                </label>
                <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. CS101 - Advanced React"
                  className="w-full bg-background border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  placeholder="What will students learn here?"
                  className="w-full bg-background border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors h-24 resize-none"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
