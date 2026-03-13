import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { Plus, Flame, Clock, Calendar, ArrowRight, BarChart2 } from "lucide-react";

export default function ContestList() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const response = await api.get("/contests");
      setContests(response.data.data);
    } catch (error) {
      console.error("Error fetching contests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "active") {
      return (
        <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse mr-1.5"></span>
          Live
        </span>
      );
    }
    if (status === "upcoming") {
      return (
        <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
          Upcoming
        </span>
      );
    }
    return (
      <span className="bg-gray-500/20 text-gray-400 border border-gray-500/30 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
        Past
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Flame className="text-orange-500" size={32} />
            Contests
          </h1>
          <p className="text-gray-400 mt-1">Host global ranking contests for your students</p>
        </div>
        <Link
          to="/trainer/contests/new"
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          <span>New Contest</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : contests.length === 0 ? (
        <div className="bg-panel border border-dashed border-gray-700 rounded-2xl p-12 text-center">
          <div className="bg-orange-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
            <Flame size={32} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No contests yet</h3>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">
            Create your first contest to challenge students with a global scheduled coding event.
          </p>
          <Link
            to="/trainer/contests/new"
            className="text-primary hover:underline font-medium"
          >
            Create a contest now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {contests.map((contest) => (
            <div
              key={contest.contestId}
              className="bg-panel border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusBadge(contest.status)}
                  <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                    {contest.title}
                  </h3>
                </div>
                <p className="text-gray-400 text-sm line-clamp-1 mb-3">
                  {contest.description || "No description provided."}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1.5 opacity-70" />
                    Start: {new Date(contest.startTime).toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1.5 opacity-70" />
                    End: {new Date(contest.endTime).toLocaleString()}
                  </div>
                  <div className="flex items-center text-primary/80">
                    <span className="font-bold mr-1">{contest.questionCount}</span> Problems
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-gray-800 md:border-none">
                <Link
                  to={`/trainer/contests/${contest.contestId}/analytics`}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                >
                  <BarChart2 size={16} /> Analytics
                </Link>
                <Link
                  to={`/trainer/contests/${contest.contestId}/leaderboard`}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Leaderboard
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
