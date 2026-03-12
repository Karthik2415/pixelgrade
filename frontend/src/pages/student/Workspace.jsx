import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import Editor from '@monaco-editor/react';
import { Play, FileCode, FileType, FileJson, ArrowLeft, Clock, AlertTriangle } from 'lucide-react';

export default function Workspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Editor States
  const [activeTab, setActiveTab] = useState('html'); // html, css, js
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');

  // Timer States
  const [timeLeft, setTimeLeft] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    fetchQuestionAndInitialCode();
  }, [id]);

  const fetchQuestionAndInitialCode = async () => {
    try {
      const qRes = await api.get(`/questions/${id}`);
      const q = qRes.data.data;
      setQuestion(q);
      
      // Try to fetch previous submission to populate editors
      const sRes = await api.get(`/submissions?questionId=${id}`);
      const submissions = sRes.data.data;
      
      if (submissions.length > 0) {
        // Load latest submission
        const latest = submissions[0];
        setHtmlCode(latest.htmlCode || '');
        setCssCode(latest.cssCode || '');
        setJsCode(latest.jsCode || '');
        
        // If already submitted and evaluated/locked, we shouldn't run a timer.
        // Assuming if there's a submission, they've used their attempt.
        // For now, if there's a submission we'll just show it.
      } else {
        // Load starter code from question
        setHtmlCode(q.starterHtml || '');
        setCssCode(q.starterCss || '');
        setJsCode(q.starterJs || '');
        
        // Initialize Timer ONLY if no prior submission exists (meaning they haven't submitted yet)
        if (q.timeLimit) {
          initializeTimer(q.timeLimit, id);
        }
      }
      
    } catch (error) {
      console.error('Failed to load workspace:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeTimer = (timeLimitMinutes, questionId) => {
    const storageKey = `contest_start_${questionId}`;
    let startTime = localStorage.getItem(storageKey);
    
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem(storageKey, startTime);
    }

    const startTimestamp = parseInt(startTime, 10);
    const limitMs = timeLimitMinutes * 60 * 1000;
    
    updateTimer(startTimestamp, limitMs);
    
    timerIntervalRef.current = setInterval(() => {
      updateTimer(startTimestamp, limitMs);
    }, 1000);
  };

  const updateTimer = (startTimestamp, limitMs) => {
    const now = Date.now();
    const elapsed = now - startTimestamp;
    const remainingMs = limitMs - elapsed;

    if (remainingMs <= 0) {
      setTimeLeft(0);
      setIsTimeUp(true);
      clearInterval(timerIntervalRef.current);
      // Auto-submit using a ref or by triggering a functional state update
      // Since closures might have stale state, we'll let a separate useEffect handle auto-submit 
      // when isTimeUp becomes true.
    } else {
      setTimeLeft(Math.ceil(remainingMs / 1000)); // remaining in seconds
    }
  };

  useEffect(() => {
    // Clear interval on unmount
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Auto-submit when time is up
  useEffect(() => {
    if (isTimeUp && !submitting && question) {
      handleSubmit(true);
    }
  }, [isTimeUp]);

  const handleSubmit = async (isAutoSubmit = false) => {
    setSubmitting(true);
    try {
      if (isAutoSubmit) {
        console.log('⏳ Time is up! Auto-submitting code...');
      } else {
        console.log('--- USER TRIGGERED SUBMIT ---');
      }

      // 1. Save submission
      const subRes = await api.post('/submissions', {
        questionId: id,
        htmlCode,
        cssCode,
        jsCode
      });
      
      const submissionId = subRes.data.data.submissionId;
      
      // Clear the local storage timer so it doesn't resume if they visit again
      localStorage.removeItem(`contest_start_${id}`);

      // 2. Trigger evaluation (fire and forget on UI side, or wait if fast enough)
      await api.post(`/evaluate/${submissionId}`);
      
      // 3. Navigate to results page
      navigate(`/student/results/${submissionId}`);
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit assignment. Please try again.');
      setSubmitting(false);
      // If auto-submit fails, we might need a retry mechanism, but for now we throw error
    }
  };

  const formatTime = (totalSeconds) => {
    if (totalSeconds === null) return '--:--';
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!question) {
    return <div className="text-center text-white p-12">Question not found.</div>;
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col -m-6">
      {/* Top action bar */}
      <div className="bg-panel border-b border-gray-800 h-14 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => navigate(question?.roomId ? `/student/rooms/${question.roomId}` : '/student/rooms')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
        </div>
        
        <div className="flex-1 text-center font-semibold text-white flex items-center justify-center space-x-4">
          <span>{question.title}</span>
          
          {question.timeLimit && timeLeft !== null && (
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
              timeLeft <= 60 && !isTimeUp
                ? 'bg-red-500/20 text-red-500 animate-pulse'
                : isTimeUp
                ? 'bg-red-900/50 text-red-500' 
                : 'bg-primary/20 text-primary'
            }`}>
              {isTimeUp ? (
                <AlertTriangle size={14} />
              ) : (
                <Clock size={14} />
              )}
              <span>{isTimeUp ? "TIME UP" : formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center space-x-2 bg-secondary hover:bg-green-600 px-4 py-1.5 rounded text-white font-medium transition-colors text-sm disabled:opacity-50"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Play size={16} className="fill-current" />
          )}
          <span>{submitting ? 'Evaluating...' : 'Submit & Evaluate'}</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Instructions & Reference */}
        <div className="w-1/3 border-r border-gray-800 bg-background flex flex-col overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-bold text-white mb-4">Instructions</h2>
            <div className="prose prose-invert prose-sm text-gray-300 max-w-none mb-8 whitespace-pre-wrap">
              {question.description}
            </div>

            {question.referenceImage && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Target Reference</h3>
                <div className="border border-gray-700 rounded-lg overflow-hidden bg-white p-2">
                  <img 
                    src={`data:image/png;base64,${question.referenceImage}`}
                    alt="Target Design"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Monaco Editor */}
        <div className="w-2/3 flex flex-col bg-editorBg">
          {/* File Tabs */}
          <div className="flex border-b border-gray-800 bg-sidebar">
            <button
              onClick={() => setActiveTab('html')}
              className={`flex items-center px-4 py-3 text-sm font-medium border-t-2 transition-colors ${
                activeTab === 'html' ? 'border-orange-500 bg-editorBg text-orange-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-panel'
              }`}
            >
              <FileCode size={16} className="mr-2" />
              index.html
            </button>
            <button
              onClick={() => setActiveTab('css')}
              className={`flex items-center px-4 py-3 text-sm font-medium border-t-2 transition-colors ${
                activeTab === 'css' ? 'border-blue-500 bg-editorBg text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-panel'
              }`}
            >
              <FileType size={16} className="mr-2" />
              style.css
            </button>
            <button
              onClick={() => setActiveTab('js')}
              className={`flex items-center px-4 py-3 text-sm font-medium border-t-2 transition-colors ${
                activeTab === 'js' ? 'border-yellow-500 bg-editorBg text-yellow-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-panel'
              }`}
            >
              <FileJson size={16} className="mr-2" />
              script.js
            </button>
          </div>

          {/* Editor Area */}
          <div className="flex-1 relative">
            {isTimeUp && (
              <div className="absolute inset-0 z-50 bg-background/80 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-panel border border-red-500/50 p-6 rounded-xl text-center shadow-2xl">
                  <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
                  <h3 className="text-xl font-bold text-white mb-2">Time's Up!</h3>
                  <p className="text-gray-400 text-sm">Your time limit has expired. Automatically submitting your code...</p>
                </div>
              </div>
            )}
            {activeTab === 'html' && (
              <div className="absolute inset-0">
                 <Editor
                  height="100%"
                  language="html"
                  theme="vs-dark"
                  value={htmlCode}
                  onChange={(val) => !isTimeUp && setHtmlCode(val)}
                  options={{ minimap: { enabled: false }, fontSize: 14, readOnly: isTimeUp || submitting }}
                />
              </div>
            )}
            {activeTab === 'css' && (
              <div className="absolute inset-0">
                 <Editor
                  height="100%"
                  language="css"
                  theme="vs-dark"
                  value={cssCode}
                  onChange={(val) => !isTimeUp && setCssCode(val)}
                  options={{ minimap: { enabled: false }, fontSize: 14, readOnly: isTimeUp || submitting }}
                />
              </div>
            )}
            {activeTab === 'js' && (
              <div className="absolute inset-0">
                 <Editor
                  height="100%"
                  language="javascript"
                  theme="vs-dark"
                  value={jsCode}
                  onChange={(val) => !isTimeUp && setJsCode(val)}
                  options={{ minimap: { enabled: false }, fontSize: 14, readOnly: isTimeUp || submitting }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
