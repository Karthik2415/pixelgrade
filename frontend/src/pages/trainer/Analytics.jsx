import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../lib/api";
import {
  BarChart2,
  ChevronRight,
  ChevronLeft,
  Users,
  BookOpen,
  Award,
  Eye,
  X,
  Code,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

// ─── Score Badge Component ───────────────────────────────────────────────────
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
        {/* Header */}
        <div className="sticky top-0 bg-panel border-b border-gray-800 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-white">
              {submission.studentName || "Student"}
            </h2>
            <p className="text-sm text-gray-400">
              Submitted {new Date(submission.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Score Summary */}
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

          {/* Visual Comparison */}
          {result && result.screenshots && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <ImageIcon size={18} className="mr-2 text-pink-500" />
                Visual Comparison
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background rounded-xl border border-gray-800 p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 text-center">Expected</p>
                  {result.screenshots.expectedImage ? (
                    <img
                      src={result.screenshots.expectedImage?.startsWith("data:") ? result.screenshots.expectedImage : `${API_BASE}${result.screenshots.expectedImage}`}
                      alt="Expected"
                      className="w-full rounded-lg border border-gray-700"
                      onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; e.target.parentNode.insertAdjacentHTML("beforeend", '<p class="text-gray-500 text-sm text-center py-8">Image not available</p>'); }}
                    />
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-8">No expected image</p>
                  )}
                </div>
                <div className="bg-background rounded-xl border border-gray-800 p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 text-center">Student Output</p>
                  {result.screenshots.actualImage ? (
                    <img
                      src={result.screenshots.actualImage.startsWith("http") ? result.screenshots.actualImage : `${API_BASE}${result.screenshots.actualImage}`}
                      alt="Student Output"
                      className="w-full rounded-lg border border-gray-700"
                      onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; e.target.parentNode.insertAdjacentHTML("beforeend", '<p class="text-gray-500 text-sm text-center py-8">Image not available</p>'); }}
                    />
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-8">No screenshot captured</p>
                  )}
                </div>
                <div className="bg-background rounded-xl border border-gray-800 p-3">
                  <p className="text-xs text-red-400 uppercase tracking-wide mb-2 text-center font-bold">Diff Heatmap</p>
                  {result.screenshots.diffImage ? (
                    <img
                      src={result.screenshots.diffImage.startsWith("http") ? result.screenshots.diffImage : `${API_BASE}${result.screenshots.diffImage}`}
                      alt="Diff Heatmap"
                      className="w-full rounded-lg border border-red-900/50"
                      onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; e.target.parentNode.insertAdjacentHTML("beforeend", '<p class="text-gray-500 text-sm text-center py-8">Image not available</p>'); }}
                    />
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-8">No diff available</p>
                  )}
                </div>
              </div>
              {result.mismatchPercentage !== undefined && (
                <p className="text-sm text-gray-400 mt-2 text-center">
                  Pixel mismatch: <span className="text-white font-mono">{result.mismatchPercentage.toFixed(2)}%</span>
                </p>
              )}
            </div>
          )}

          {/* Failed Tests */}
          {result && result.failedTests && result.failedTests.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <XCircle size={18} className="mr-2 text-red-500" />
                Failed Tests
              </h3>
              <div className="space-y-2">
                {result.failedTests.map((t, i) => (
                  <div key={i} className="bg-red-900/20 border border-red-800/30 rounded-lg p-3 text-sm">
                    <p className="text-red-300 font-medium">{t.test?.description || `Test ${i + 1}`}</p>
                    {t.actual && <p className="text-gray-400 mt-1">Got: <span className="text-gray-300">{t.actual}</span></p>}
                    {t.error && <p className="text-red-400/70 mt-1 text-xs">{t.error}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Code */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Code size={18} className="mr-2 text-secondary" />
              Student Code
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-orange-400 uppercase tracking-wide mb-1 font-bold">HTML</p>
                <pre className="bg-background border border-gray-800 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto max-h-60 overflow-y-auto font-mono whitespace-pre-wrap">
                  {submission.htmlCode || "No HTML code submitted"}
                </pre>
              </div>
              <div>
                <p className="text-xs text-blue-400 uppercase tracking-wide mb-1 font-bold">CSS</p>
                <pre className="bg-background border border-gray-800 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto max-h-60 overflow-y-auto font-mono whitespace-pre-wrap">
                  {submission.cssCode || "No CSS code submitted"}
                </pre>
              </div>
              <div>
                <p className="text-xs text-yellow-400 uppercase tracking-wide mb-1 font-bold">JavaScript</p>
                <pre className="bg-background border border-gray-800 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto max-h-60 overflow-y-auto font-mono whitespace-pre-wrap">
                  {submission.jsCode || "No JavaScript code submitted"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Analytics Page ─────────────────────────────────────────────────────
export default function Analytics() {
  const [searchParams] = useSearchParams();
  const preselectedTaskId = searchParams.get("taskId");

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(false);

  // Modal state
  const [modalSubmission, setModalSubmission] = useState(null);
  const [modalResult, setModalResult] = useState(null);

  // ── Fetch trainer's rooms on mount ─────────────────────────────────
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await api.get("/rooms");
      setRooms(res.data.data || []);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
    setLoading(false);
  };

  // ── When a room is selected, fetch its tasks ───────────────────────
  const handleSelectRoom = async (room) => {
    setSelectedRoom(room);
    setSelectedTask(null);
    setSelectedStudent(null);
    setSubmissions([]);
    setResults({});

    try {
      const res = await api.get(`/questions?roomId=${room.roomId}`);
      const taskList = res.data.data || [];
      setTasks(taskList);

      // If there's a preselected task from the URL, auto-select it
      if (preselectedTaskId) {
        const match = taskList.find((t) => t.questionId === preselectedTaskId);
        if (match) {
          handleSelectTask(match);
        }
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // ── When a task is selected, fetch all submissions for it ──────────
  const handleSelectTask = async (task) => {
    setSelectedTask(task);
    setSelectedStudent(null);
    setLoadingSubs(true);
    setResults({});

    try {
      const res = await api.get(`/submissions?questionId=${task.questionId}`);
      const subs = res.data.data || [];
      setSubmissions(subs);

      // Fetch evaluation results for each submission
      const resultsMap = {};
      await Promise.all(
        subs.map(async (sub) => {
          try {
            const resultRes = await api.get(`/submissions/${sub.submissionId}/result`);
            if (resultRes.data.data?.result) {
              resultsMap[sub.submissionId] = resultRes.data.data.result;
            }
          } catch (e) {
            // No result yet
          }
        })
      );
      setResults(resultsMap);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
    setLoadingSubs(false);
  };

  // ── Open modal with student details ────────────────────────────────
  const openStudentDetail = (sub) => {
    setModalSubmission(sub);
    setModalResult(results[sub.submissionId] || null);
  };

  // ── Auto-select room if preselectedTaskId is set ───────────────────
  useEffect(() => {
    if (preselectedTaskId && rooms.length > 0 && !selectedRoom) {
      // Try to find which room has this task by checking each room
      rooms.forEach((room) => handleSelectRoom(room));
    }
  }, [rooms, preselectedTaskId]);

  // ── Calculate stats ────────────────────────────────────────────────
  const getStats = () => {
    const resultValues = Object.values(results);
    if (resultValues.length === 0) return { avg: 0, highest: 0, lowest: 0, count: 0 };
    const scores = resultValues.map((r) => r.totalScore || 0);
    return {
      avg: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
      count: scores.length,
    };
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <BarChart2 size={28} className="mr-3 text-primary" />
          Analytics Dashboard
        </h1>
        <p className="text-gray-400 mt-1">View student performance across your rooms and tasks</p>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
        <button
          onClick={() => { setSelectedRoom(null); setSelectedTask(null); setSubmissions([]); setResults({}); }}
          className={`hover:text-white transition-colors ${!selectedRoom ? "text-primary font-bold" : ""}`}
        >
          Rooms
        </button>
        {selectedRoom && (
          <>
            <ChevronRight size={14} />
            <button
              onClick={() => { setSelectedTask(null); setSubmissions([]); setResults({}); }}
              className={`hover:text-white transition-colors ${selectedRoom && !selectedTask ? "text-primary font-bold" : ""}`}
            >
              {selectedRoom.name}
            </button>
          </>
        )}
        {selectedTask && (
          <>
            <ChevronRight size={14} />
            <button
              onClick={() => setSelectedStudent(null)}
              className={`hover:text-white transition-colors ${selectedTask && !selectedStudent ? "text-primary font-bold" : ""}`}
            >
              {selectedTask.title}
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

      {/* ── Step 1: Room Selection ──────────────────────────────────── */}
      {!selectedRoom && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.length === 0 ? (
            <div className="col-span-full bg-panel border border-dashed border-gray-700 rounded-2xl p-12 text-center">
              <BookOpen size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No rooms yet</h3>
              <p className="text-gray-400">Create a room first to see analytics.</p>
            </div>
          ) : (
            rooms.map((room) => (
              <button
                key={room.roomId}
                onClick={() => handleSelectRoom(room)}
                className="bg-panel border border-gray-800 rounded-xl p-6 hover:border-primary/50 transition-all text-left group"
              >
                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                  {room.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{room.description || "No description"}</p>
                <div className="flex items-center space-x-4 mt-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Users size={14} className="mr-1" />
                    {room.students?.length || 0} students
                  </span>
                  <span className="font-mono bg-gray-800 px-2 py-0.5 rounded">{room.roomCode}</span>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* ── Step 2: Task Selection ──────────────────────────────────── */}
      {selectedRoom && !selectedTask && (
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <button
              onClick={() => { setSelectedRoom(null); setTasks([]); }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-white">Tasks in {selectedRoom.name}</h2>
          </div>

          {tasks.length === 0 ? (
            <div className="bg-panel border border-dashed border-gray-700 rounded-2xl p-12 text-center">
              <BookOpen size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No tasks in this room</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task) => (
                <button
                  key={task.questionId}
                  onClick={() => handleSelectTask(task)}
                  className="bg-panel border border-gray-800 rounded-xl p-5 hover:border-primary/50 transition-all text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-800 w-10 h-10 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                        {task.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Created {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Submissions Table ──────────────────────────────── */}
      {selectedTask && (
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <button
              onClick={() => {
                if (selectedStudent) {
                  setSelectedStudent(null);
                } else {
                  setSelectedTask(null); setSubmissions([]); setResults({});
                }
              }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-white">
              {selectedStudent ? `${selectedStudent.studentName}'s Submissions` : selectedTask.title}
            </h2>
          </div>

          {/* Stats Bar */}
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
              <p className="text-gray-400">Students haven't submitted code for this task yet.</p>
            </div>
          ) : !selectedStudent ? (
            <div className="bg-panel border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-background">
                    <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Student</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Total Attempts</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Best Score</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Latest Attempt</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentGroups.map((group) => (
                    <tr
                      key={group.studentId}
                      className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-white font-medium">{group.studentName}</p>
                      </td>
                      <td className="text-center px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                          {group.submissions.length} attempts
                        </span>
                      </td>
                      <td className="text-center px-4 py-4">
                        {group.bestResult ? (
                          <span className="text-xl font-bold text-primary">{group.bestResult.totalScore}</span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="text-center px-4 py-4">
                        <span className="text-sm text-gray-400">
                          {group.latestDate ? group.latestDate.toLocaleString() : "—"}
                        </span>
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
                      <tr
                        key={sub.submissionId}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-300">{new Date(sub.createdAt).toLocaleString()}</p>
                          {result && result.totalScore === selectedStudent.bestResult?.totalScore && (
                            <span className="text-[10px] uppercase font-bold text-green-500 mt-1 inline-block">Best Score</span>
                          )}
                        </td>
                        <td className="text-center px-4 py-4">
                          {result ? (
                            <ScoreBadge score={result.domScore || 0} max={40} />
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="text-center px-4 py-4">
                          {result ? (
                            <ScoreBadge score={result.interactionScore || 0} max={30} />
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="text-center px-4 py-4">
                          {result ? (
                            <ScoreBadge score={result.visualScore || 0} max={30} />
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="text-center px-4 py-4">
                          {result ? (
                            <span className="text-xl font-bold text-white">{result.totalScore || 0}</span>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="text-center px-4 py-4">
                          {result ? (
                            <span className="flex items-center justify-center">
                              <CheckCircle size={16} className="text-green-500" />
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              <AlertCircle size={16} className="text-yellow-500" />
                            </span>
                          )}
                        </td>
                        <td className="text-center px-4 py-4">
                          <button
                            onClick={() => openStudentDetail(sub)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="View Details"
                          >
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

      {/* Student Detail Modal */}
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
