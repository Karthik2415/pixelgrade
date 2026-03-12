import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { ChevronLeft, Flame, Play, Clock, Trophy, FileText, Calendar } from "lucide-react";

export default function ContestDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeUntilStart, setTimeUntilStart] = useState("");
  
  useEffect(() => {
    fetchContest();
  }, [id]);

  useEffect(() => {
    let interval;
    if (contest && contest.status === "upcoming") {
      const start = new Date(contest.startTime).getTime();
      
      interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = start - now;
        
        if (distance < 0) {
          clearInterval(interval);
          // Reload to switch status from upcoming to active
          fetchContest();
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          
          let timeStr = "";
          if (days > 0) timeStr += `${days}d `;
          if (hours > 0 || days > 0) timeStr += `${hours.toString().padStart(2,'0')}h `;
          timeStr += `${minutes.toString().padStart(2,'0')}m ${seconds.toString().padStart(2,'0')}s`;
          setTimeUntilStart(timeStr);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [contest]);

  const fetchContest = async () => {
    try {
      const response = await api.get(`/contests/${id}`);
      setContest(response.data.data);
    } catch (error) {
      console.error("Error fetching contest:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  if (!contest) return <div className="text-center p-20 text-white">Contest not found.</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <Link to="/student/contests" className="flex items-center text-gray-400 hover:text-white mb-6 inline-flex">
        <ChevronLeft size={20} className="mr-1" /> Back to Contests
      </Link>

      <div className="bg-panel border border-gray-800 rounded-2xl p-8 mb-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Flame className="text-orange-500" size={32} />
                <h1 className="text-3xl font-bold text-white">{contest.title}</h1>
              </div>
              <p className="text-gray-400 max-w-2xl">{contest.description}</p>
            </div>
            {contest.status === "active" && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Contest is Live
              </div>
            )}
            {contest.status === "past" && (
               <Link to={`/student/contests/${id}/leaderboard`} className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                 <Trophy size={18} className="text-yellow-500" /> View Final Standings
               </Link>
            )}
          </div>
          
          <div className="flex items-center gap-6 mt-8 text-sm text-gray-300">
            <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-lg border border-gray-800">
              <Calendar size={16} className="text-gray-500" />
              Starts: <span className="text-white font-medium">{new Date(contest.startTime).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-lg border border-gray-800">
              <Clock size={16} className="text-gray-500" />
              Ends: <span className="text-white font-medium">{new Date(contest.endTime).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {contest.status === "upcoming" ? (
        <div className="bg-panel border border-gray-800 rounded-2xl p-16 text-center">
          <Clock size={48} className="mx-auto text-orange-500 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Contest Starting Soon!</h2>
          <p className="text-gray-400 mb-8">The problem statements will be revealed here when the countdown hits zero.</p>
          <div className="text-5xl font-mono font-bold text-white tracking-widest bg-gray-900/50 inline-block px-8 py-4 rounded-xl border border-gray-800 shadow-inner">
            {timeUntilStart}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-6">Problems</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contest.questions?.map((q, idx) => (
              <div key={idx} className="bg-panel border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-all flex flex-col">
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Problem {idx + 1}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{q.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex-1">{q.description}</p>
                  
                  <Link
                    to={`/student/contests/${id}/workspace/${q.questionId}`}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg text-sm font-bold transition-colors flex justify-center items-center gap-2"
                  >
                    <Play size={16} /> {contest.status === 'active' ? 'Solve Problem' : 'Practice'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
