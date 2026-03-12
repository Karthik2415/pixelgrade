import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { Flame, Clock, Calendar, ArrowRight, Play } from "lucide-react";

export default function StudentContestList() {
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

  const activeContests = contests.filter((c) => c.status === "active");
  const upcomingContests = contests.filter((c) => c.status === "upcoming");
  const pastContests = contests.filter((c) => c.status === "past");

  const ContestCard = ({ contest }) => (
    <div className="bg-panel border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          {contest.status === "active" && (
             <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center">
               <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse mr-1.5"></span> Live
             </span>
          )}
          {contest.status === "upcoming" && (
             <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
               Upcoming
             </span>
          )}
          {contest.status === "past" && (
             <span className="bg-gray-500/20 text-gray-400 border border-gray-500/30 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
               Past
             </span>
          )}
          <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
            {contest.title}
          </h3>
        </div>
        <p className="text-gray-400 text-sm line-clamp-1 mb-3">
          {contest.description || "Get ready to compete!"}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1.5 opacity-70" />
            {new Date(contest.startTime).toLocaleString()}
          </div>
          <div className="flex items-center">
            <Clock size={14} className="mr-1.5 opacity-70" />
            Ends: {new Date(contest.endTime).toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-gray-800 md:border-none">
        <Link
          to={`/student/contests/${contest.contestId}`}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg flex items-center gap-2 ${
            contest.status === 'active' 
              ? 'bg-primary hover:bg-primary/90 text-white shadow-primary/20' 
              : 'bg-gray-800 hover:bg-gray-700 text-white'
          }`}
        >
          {contest.status === 'active' ? 'Enter Contest' : 'View Lobby'}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8 border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Flame className="text-orange-500" size={32} />
          Global Contests
        </h1>
        <p className="text-gray-400 mt-1">Compete with pixel-perfect precision</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : contests.length === 0 ? (
        <div className="bg-panel border border-dashed border-gray-700 rounded-2xl p-12 text-center text-gray-500">
          No contests available right now. Check back later!
        </div>
      ) : (
        <div className="space-y-10">
          {activeContests.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Active Now
              </h2>
              <div className="space-y-4">
                {activeContests.map((c) => <ContestCard key={c.contestId} contest={c} />)}
              </div>
            </section>
          )}

          {upcomingContests.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-white mb-4 text-orange-400">Upcoming Contests</h2>
              <div className="space-y-4">
                {upcomingContests.map((c) => <ContestCard key={c.contestId} contest={c} />)}
              </div>
            </section>
          )}

          {pastContests.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-white mb-4 text-gray-500">Past Contests</h2>
              <div className="space-y-4 opacity-75 grayscale hover:grayscale-0 transition-all duration-500">
                {pastContests.map((c) => <ContestCard key={c.contestId} contest={c} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
