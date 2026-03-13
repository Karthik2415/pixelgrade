import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/api";
import {
  BarChart2, ChevronLeft, ChevronRight, Users, BookOpen, Award, Eye, X,
  Code, Image as ImageIcon, CheckCircle, XCircle, AlertCircle, Flame,
} from "lucide-react";

// ─── Score Badge ─────────────────────────────────────────────────────────────
function ScoreBadge({ score, max = 100 }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  let color = "text-red-400 bg-red-500/10 border-red-500/30";
  if (pct >= 80) color = "text-green-400 bg-green-500/10 border-green-500/30";
  else if (pct >= 50) color = "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
  else if (pct >= 25) color = "text-orange-400 bg-orange-500/10 border-orange-500/30";

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${color}`}>
      {score} / {max}
    </span>
  );
}

// ─── Student Detail Modal ────────────────────────────────────────────────────
function StudentDetailModal({ submission, result, onClose }) {
  if (!submission) return null;
  const API_BASE = "http://localhost:5000";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-panel border border-gray-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-panel border-b border-gray-800 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-white">{submission.studentName || "Student"}</h2>
            <p className="text-sm text-gray-400">Submitted {new Date(submission.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {result && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background rounded-xl p-4 border border-gray-800 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">DOM Score</p>
                <p className="text-2xl font-bold text-green-400">{result.domScore || 0}</p>
                <p className="text-xs text-gray-500">/ 40</p>
              </div>
              <div className="bg-background rounded-xl p-4 border border-gray-800 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Interaction</p>
                <p className="text-2xl font-bold text-yellow-400">{result.interactionScore || 0}</p>
                <p className="text-xs text-gray-500">/ 30</p>
              </div>
              <div className="bg-background rounded-xl p-4 border border-gray-800 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Visual</p>
                <p className="text-2xl font-bold text-blue-400">{result.visualScore || 0}</p>
                <p className="text-xs text-gray-500">/ 30</p>
              </div>
              <div className="bg-background rounded-xl p-4 border border-primary/30 text-center">
                <p className="text-xs text-primary uppercase tracking-wide mb-1">Total</p>
                <p className="text-3xl font-bold text-white">{result.totalScore || 0}</p>
                <p className="text-xs text-gray-500">/ 100</p>
              </div>
            </div>
          )}

          {result && result.screenshots && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <ImageIcon size={18} className="mr-2 text-pink-500" /> Visual Comparison
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background rounded-xl border border-gray-800 p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 text-center">Expected</p>
                  {result.screenshots.expectedImage ? (
                    <img src={result.screenshots.expectedImage?.startsWith("data:") ? result.screenshots.expectedImage : `${API_BASE}${result.screenshots.expectedImage}`} alt="Expected" className="w-full rounded-lg border border-gray-700" />
                  ) : <p className="text-gray-500 text-sm text-center py-8">No expected image</p>}
                </div>
                <div className="bg-background rounded-xl border border-gray-800 p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 text-center">Student Output</p>
                  {result.screenshots.actualImage ? (
                    <img src={result.screenshots.actualImage.startsWith("http") ? result.screenshots.actualImage : `${API_BASE}${result.screenshots.actualImage}`} alt="Student Output" className="w-full rounded-lg border border-gray-700" />
                  ) : <p className="text-gray-500 text-sm text-center py-8">No screenshot</p>}
                </div>
                <div className="bg-background rounded-xl border border-gray-800 p-3">
                  <p className="text-xs text-red-400 uppercase tracking-wide mb-2 text-center font-bold">Diff Heatmap</p>
                  {result.screenshots.diffImage ? (
                    <img src={result.screenshots.diffImage.startsWith("http") ? result.screenshots.diffImage : `${API_BASE}${result.screenshots.diffImage}`} alt="Diff" className="w-full rounded-lg border border-red-900/50" />
                  ) : <p className="text-gray-500 text-sm text-center py-8">No diff</p>}
                </div>
              </div>
            </div>
          )}

          {/* Student Code */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Code size={18} className="mr-2 text-secondary" /> Student Code
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-orange-400 uppercase tracking-wide mb-1 font-bold">HTML</p>
                <pre className="bg-background border border-gray-800 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto max-h-60 overflow-y-auto font-mono whitespace-pre-wrap">{submission.htmlCode || "No HTML"}</pre>
              </div>
              <div>
                <p className="text-xs text-blue-400 uppercase tracking-wide mb-1 font-bold">CSS</p>
                <pre className="bg-background border border-gray-800 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto max-h-60 overflow-y-auto font-mono whitespace-pre-wrap">{submission.cssCode || "No CSS"}</pre>
              </div>
              <div>
                <p className="text-xs text-yellow-400 uppercase tracking-wide mb-1 font-bold">JavaScript</p>
                <pre className="bg-background border border-gray-800 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto max-h-60 overflow-y-auto font-mono whitespace-pre-wrap">{submission.jsCode || "No JS"}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Contest Analytics Page ────────────────────────────────────────────
export default function ContestAnalytics() {
  const { id } = useParams();

  const [contest, setContest] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(false);

  // Modal
  const [modalSubmission, setModalSubmission] = useState(null);
  const [modalResult, setModalResult] = useState(null);

  useEffect(() => {
    fetchContest();
  }, [id]);

  const fetchContest = async () => {
    try {
      const res = await api.get(`/contests/${id}`);
      setContest(res.data.data);
    } catch (err) {
      console.error("Error fetching contest:", err);
    }
    setLoading(false);
  };

  const handleSelectQuestion = async (question) => {
    setSelectedQuestion(question);
    setSelectedStudent(null);
    setLoadingSubs(true);
    setResults({});

    try {
      // Fetch ALL contest submissions, then filter by questionId
      const res = await api.get(`/submissions`);
      const allSubs = res.data.data || [];
      const contestSubs = allSubs.filter(s => s.contestId === id && s.questionId === question.questionId);
      setSubmissions(contestSubs);

      // Fetch evaluation results
      const resultsMap = {};
      await Promise.all(
        contestSubs.map(async (sub) => {
          try {
            const resultRes = await api.get(`/submissions/${sub.submissionId}/result`);
            if (resultRes.data.data?.result) {
              resultsMap[sub.submissionId] = resultRes.data.data.result;
            }
          } catch (e) { /* no result yet */ }
        })
      );
      setResults(resultsMap);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
    setLoadingSubs(false);
  };

  const openStudentDetail = (sub) => {
    setModalSubmission(sub);
    setModalResult(results[sub.submissionId] || null);
  };

  // Group submissions by student
  const studentGroups = Object.values(
    submissions.reduce((acc, sub) => {
      if (!acc[sub.studentId]) {
        acc[sub.studentId] = {
          studentId: sub.studentId,
          studentName: sub.studentName || "Unknown",
          submissions: [],
          bestResult: null,
          latestDate: null
        };
      }
      acc[sub.studentId].submissions.push(sub);

      const result = results[sub.submissionId];
      if (result) {
        if (!acc[sub.studentId].bestResult || result.totalScore > acc[sub.studentId].bestResult.totalScore) {
          acc[sub.studentId].bestResult = result;
        }
      }

      const subDate = new Date(sub.createdAt);
      if (!acc[sub.studentId].latestDate || subDate > acc[sub.studentId].latestDate) {
        acc[sub.studentId].latestDate = subDate;
      }

      return acc;
    }, {})
  ).sort((a, b) => b.latestDate - a.latestDate);

  // Stats calculation
  const getStats = () => {
    const resultValues = Object.values(results);
    if (resultValues.length === 0) return { avg: 0, highest: 0, lowest: 0, count: 0 };
    const scores = resultValues.map(r => r.totalScore || 0);
    return {
      avg: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
      count: scores.length,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!contest) return <div className="text-center text-white p-20">Contest not found.</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link to="/trainer/contests" className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm font-medium mb-4">
          <ChevronLeft size={16} className="mr-1" /> Back to Contests
        </Link>
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Flame size={28} className="mr-3 text-orange-500" />
          {contest.title} — Analytics
        </h1>
        <p className="text-gray-400 mt-1">View student performance across contest problems</p>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
        <button
          onClick={() => { setSelectedQuestion(null); setSelectedStudent(null); setSubmissions([]); setResults({}); }}
          className={`hover:text-white transition-colors ${!selectedQuestion ? "text-primary font-bold" : ""}`}
        >
          Problems
        </button>
        {selectedQuestion && (
          <>
            <ChevronRight size={14} />
            <button
              onClick={() => { setSelectedStudent(null); }}
              className={`hover:text-white transition-colors ${selectedQuestion && !selectedStudent ? "text-primary font-bold" : ""}`}
            >
              {selectedQuestion.title}
            </button>
          </>
        )}
        {selectedStudent && (
          <>
            <ChevronRight size={14} />
            <span className="text-primary font-bold">{selectedStudent.studentName}'s Submissions</span>
          </>
        )}
      </div>

      {/* Step 1: Problem Selection */}
      {!selectedQuestion && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(contest.questions || []).length === 0 ? (
            <div className="col-span-full bg-panel border border-dashed border-gray-700 rounded-2xl p-12 text-center">
              <BookOpen size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No problems in this contest</h3>
            </div>
          ) : (
            contest.questions.map((q, idx) => (
              <button
                key={q.questionId}
                onClick={() => handleSelectQuestion(q)}
                className="bg-panel border border-gray-800 rounded-xl p-6 hover:border-primary/50 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-800 w-10 h-10 rounded-lg flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{q.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{q.description}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Step 2: Submissions Table */}
      {selectedQuestion && (
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <button
              onClick={() => {
                if (selectedStudent) {
                  setSelectedStudent(null);
                } else {
                  setSelectedQuestion(null); setSubmissions([]); setResults({});
                }
              }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-white">
              {selectedStudent ? `${selectedStudent.studentName}'s Submissions` : selectedQuestion.title}
            </h2>
          </div>

          {/* Stats */}
          {!loadingSubs && submissions.length > 0 && !selectedStudent && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {(() => {
                const stats = getStats();
                return (
                  <>
                    <div className="bg-panel border border-gray-800 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400 uppercase">Students</p>
                      <p className="text-2xl font-bold text-white mt-1">{studentGroups.length}</p>
                    </div>
                    <div className="bg-panel border border-gray-800 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400 uppercase">Avg Score</p>
                      <p className="text-2xl font-bold text-primary mt-1">{stats.avg}</p>
                    </div>
                    <div className="bg-panel border border-gray-800 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400 uppercase">Highest</p>
                      <p className="text-2xl font-bold text-green-400 mt-1">{stats.highest}</p>
                    </div>
                    <div className="bg-panel border border-gray-800 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400 uppercase">Lowest</p>
                      <p className="text-2xl font-bold text-red-400 mt-1">{stats.lowest}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {loadingSubs ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <span className="ml-3 text-gray-400">Loading submissions...</span>
            </div>
          ) : submissions.length === 0 ? (
            <div className="bg-panel border border-dashed border-gray-700 rounded-2xl p-12 text-center">
              <Users size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No submissions yet</h3>
              <p className="text-gray-400">Students haven't submitted code for this problem yet.</p>
            </div>
          ) : !selectedStudent ? (
            /* Student List */
            <div className="bg-panel border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-background">
                    <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Student</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Attempts</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Best Score</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Latest</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentGroups.map((group) => (
                    <tr key={group.studentId} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4"><p className="text-white font-medium">{group.studentName}</p></td>
                      <td className="text-center px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                          {group.submissions.length} attempts
                        </span>
                      </td>
                      <td className="text-center px-4 py-4">
                        {group.bestResult ? (
                          <span className="text-xl font-bold text-primary">{group.bestResult.totalScore}</span>
                        ) : <span className="text-gray-600">—</span>}
                      </td>
                      <td className="text-center px-4 py-4">
                        <span className="text-sm text-gray-400">{group.latestDate ? group.latestDate.toLocaleString() : "—"}</span>
                      </td>
                      <td className="text-center px-4 py-4">
                        <button
                          onClick={() => setSelectedStudent(group)}
                          className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 px-3 py-1.5 rounded transition-colors text-sm font-medium"
                        >
                          View History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Individual Student Submissions */
            <div className="bg-panel border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-background">
                    <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Submission Time</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">DOM</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Interaction</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Visual</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Total</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Status</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudent.submissions
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((sub) => {
                      const result = results[sub.submissionId];
                      return (
                        <tr key={sub.submissionId} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-300">{new Date(sub.createdAt).toLocaleString()}</p>
                            {result && result.totalScore === selectedStudent.bestResult?.totalScore && (
                              <span className="text-[10px] uppercase font-bold text-green-500 mt-1 inline-block">Best Score</span>
                            )}
                          </td>
                          <td className="text-center px-4 py-4">{result ? <ScoreBadge score={result.domScore || 0} max={40} /> : <span className="text-gray-600">—</span>}</td>
                          <td className="text-center px-4 py-4">{result ? <ScoreBadge score={result.interactionScore || 0} max={30} /> : <span className="text-gray-600">—</span>}</td>
                          <td className="text-center px-4 py-4">{result ? <ScoreBadge score={result.visualScore || 0} max={30} /> : <span className="text-gray-600">—</span>}</td>
                          <td className="text-center px-4 py-4">{result ? <span className="text-xl font-bold text-white">{result.totalScore || 0}</span> : <span className="text-gray-600">—</span>}</td>
                          <td className="text-center px-4 py-4">
                            {result ? <CheckCircle size={16} className="text-green-500 mx-auto" /> : <AlertCircle size={16} className="text-yellow-500 mx-auto" />}
                          </td>
                          <td className="text-center px-4 py-4">
                            <button onClick={() => openStudentDetail(sub)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View Details">
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalSubmission && (
        <StudentDetailModal
          submission={modalSubmission}
          result={modalResult}
          onClose={() => { setModalSubmission(null); setModalResult(null); }}
        />
      )}
    </div>
  );
}
