import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Trophy, Medal, Award, Users, TrendingUp, Star, ChevronDown } from 'lucide-react';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedRoom]);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch rooms', err);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = selectedRoom !== 'all' ? `?roomId=${selectedRoom}` : '';
      const res = await api.get(`/leaderboard${params}`);
      setLeaderboard(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch leaderboard', err);
    }
    setLoading(false);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={22} className="text-yellow-400" />;
    if (rank === 2) return <Medal size={22} className="text-gray-300" />;
    if (rank === 3) return <Award size={22} className="text-amber-600" />;
    return <span className="text-gray-500 font-mono text-sm w-[22px] text-center inline-block">{rank}</span>;
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return 'bg-yellow-500/10 border-yellow-500/30';
    if (rank === 2) return 'bg-gray-400/10 border-gray-400/30';
    if (rank === 3) return 'bg-amber-600/10 border-amber-600/30';
    return 'bg-panel border-gray-800';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Trophy className="text-yellow-400" size={28} />
              Leaderboard
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Student rankings based on best scores across all tasks
            </p>
          </div>

          {/* Room Filter */}
          <div className="relative">
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="appearance-none bg-panel border border-gray-700 text-white text-sm rounded-lg px-4 py-2 pr-10 focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
            >
              <option value="all">All Rooms</option>
              {rooms.map((room) => (
                <option key={room.roomId} value={room.roomId}>
                  {room.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {!loading && leaderboard.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-panel rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Users size={20} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Total Students</p>
                <p className="text-2xl font-bold text-white">{leaderboard.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-panel rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Star size={20} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Highest Score</p>
                <p className="text-2xl font-bold text-white">
                  {leaderboard.length > 0 ? `${leaderboard[0].averageScore}%` : '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-20 bg-panel rounded-xl border border-gray-800">
          <Trophy size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-400">No scores yet</h3>
          <p className="text-sm text-gray-500 mt-1">
            Students will appear here once they submit and get evaluated.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">
            <div className="col-span-1">Rank</div>
            <div className="col-span-6">Student</div>
            <div className="col-span-2 text-center">Tasks Done</div>
            <div className="col-span-3 text-right">Score</div>
          </div>

          {/* Table Rows */}
          {leaderboard.map((student, index) => {
            const rank = index + 1;
            return (
              <div
                key={student.studentId}
                className={`grid grid-cols-12 gap-4 items-center px-5 py-4 rounded-xl border transition-all hover:scale-[1.01] ${getRankStyle(rank)}`}
              >
                <div className="col-span-1 flex items-center">
                  {getRankIcon(rank)}
                </div>
                <div className="col-span-6">
                  <p className="text-white font-semibold text-sm">{student.name}</p>
                  <p className="text-xs text-gray-500 truncate">{student.email}</p>
                </div>
                <div className="col-span-2 text-center">
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                    {student.questionsAttempted} {student.questionsAttempted === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
                <div className="col-span-3 text-right">
                  <span className={`text-xl font-bold ${getScoreColor(student.averageScore)}`}>
                    {student.averageScore}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
