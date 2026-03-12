import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { ChevronLeft, Trophy, Medal, Award, Flame, Users } from "lucide-react";

export default function ContestLeaderboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [boardRes, contestRes] = await Promise.all([
        api.get(`/contests/${id}/leaderboard`),
        api.get(`/contests/${id}`)
      ]);
      setLeaderboard(boardRes.data.data);
      setContest(contestRes.data.data);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={24} className="text-yellow-400" />;
    if (rank === 2) return <Medal size={24} className="text-gray-300" />;
    if (rank === 3) return <Award size={24} className="text-amber-600" />;
    return <span className="text-gray-500 font-mono text-sm w-[24px] text-center inline-block">{rank}</span>;
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]';
    if (rank === 2) return 'bg-gray-400/10 border-gray-400/30';
    if (rank === 3) return 'bg-amber-600/10 border-amber-600/30';
    return 'bg-panel border-gray-800';
  };

  const isTrainer = user?.role === "trainer";

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8 border-b border-gray-800 pb-6 flex items-start justify-between">
        <div>
          <button 
            onClick={() => navigate(isTrainer ? "/trainer/contests" : `/student/contests/${id}`)} 
            className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" /> Back
          </button>
          <div className="flex items-center gap-3">
            <Trophy className="text-yellow-500" size={32} />
            <h1 className="text-3xl font-bold text-white">
              {contest ? contest.title : "Contest"} Standings
            </h1>
          </div>
        </div>
        
        {contest?.status === "active" && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-lg font-bold flex items-center gap-2 mt-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Live Rankings
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-20 bg-panel rounded-xl border border-gray-800">
          <Users size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-white">No submissions yet</h3>
          <p className="text-sm text-gray-500 mt-1">
            Once contestants start submitting solutions, their rankings will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs text-gray-500 uppercase tracking-wider font-bold">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Contestant</div>
            <div className="col-span-3 text-center">Problems Solved</div>
            <div className="col-span-3 text-right">Avg Score</div>
          </div>

          {/* Table Rows */}
          {leaderboard.map((student, index) => {
            const rank = index + 1;
            const isMe = student.studentId === user?.userId;
            
            return (
              <div
                key={student.studentId}
                className={`grid grid-cols-12 gap-4 items-center px-6 py-4 rounded-xl border transition-all ${getRankStyle(rank)} ${isMe ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
              >
                <div className="col-span-1 flex items-center justify-center">
                  {getRankIcon(rank)}
                </div>
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold text-xs">
                    {student.name.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm flex items-center gap-2">
                      {student.name}
                      {isMe && <span className="bg-primary/20 text-primary text-[10px] uppercase px-1.5 py-0.5 rounded">You</span>}
                    </p>
                  </div>
                </div>
                <div className="col-span-3 text-center">
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs font-bold font-mono">
                    {student.questionsAttempted} {contest && `/ ${contest.questionCount}`}
                  </span>
                </div>
                <div className="col-span-3 text-right">
                  <span className={`text-xl font-black font-mono tracking-tight ${
                    student.averageScore >= 80 ? 'text-green-400' :
                    student.averageScore >= 50 ? 'text-yellow-400' : 'text-orange-400'
                  }`}>
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
