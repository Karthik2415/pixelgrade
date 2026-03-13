import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import Editor from '@monaco-editor/react';
import { Play, FileCode, FileType, FileJson, ArrowLeft, Clock, AlertTriangle } from 'lucide-react';

export default function ContestWorkspace() {
  const { id, questionId } = useParams();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Editor States
  const [activeTab, setActiveTab] = useState('html'); 
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');

  // Global Contest Timer
  const [timeLeft, setTimeLeft] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    fetchContestQuestion();
  }, [id, questionId]);

  const fetchContestQuestion = async () => {
    try {
      const qRes = await api.get(`/contests/${id}/questions/${questionId}`);
      const q = qRes.data.data;
      setQuestion(q);
      
      // Try to load the student's latest submission for this contest question
      // so the code persists when navigating back from the results page
      try {
        const sRes = await api.get(`/submissions?questionId=${q.questionId}`);
        const submissions = (sRes.data.data || []).filter(s => s.contestId === id);
        
        if (submissions.length > 0) {
          const latest = submissions[0]; // Already sorted newest first by backend
          setHtmlCode(latest.htmlCode || '');
          setCssCode(latest.cssCode || '');
          setJsCode(latest.jsCode || '');
        } else {
          // No previous submission, load starter code
          setHtmlCode(q.starterHtml || '');
          setCssCode(q.starterCss || '');
          setJsCode(q.starterJs || '');
        }
      } catch (subErr) {
        // If fetching submissions fails, fall back to starter code
        setHtmlCode(q.starterHtml || '');
        setCssCode(q.starterCss || '');
        setJsCode(q.starterJs || '');
      }
      
      // Initialize Global Timer based on contest end time
      if (q.contestEndTime) {
        startGlobalTimer(q.contestEndTime);
      }
      
    } catch (error) {
      console.error('Failed to load contest workspace:', error);
      if (error.response?.status === 403) {
        alert("Contest has not started yet!");
        navigate(`/student/contests/${id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const startGlobalTimer = (endTimeIso) => {
    const endTimestamp = new Date(endTimeIso).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const remainingMs = endTimestamp - now;

      if (remainingMs <= 0) {
        setTimeLeft(0);
        setIsTimeUp(true);
        clearInterval(timerIntervalRef.current);
      } else {
        setTimeLeft(Math.ceil(remainingMs / 1000));
      }
    };

    updateTimer(); // Initial call
    timerIntervalRef.current = setInterval(updateTimer, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Auto-submit when global contest time is up
  useEffect(() => {
    if (isTimeUp && !submitting && question) {
      handleSubmit(true);
    }
  }, [isTimeUp]);

  const handleSubmit = async (isAutoSubmit = false) => {
    setSubmitting(true);
    try {
      if (isAutoSubmit) console.log('⏳ Contest is over! Auto-submitting code...');
      
      // Extract real question ID if embedded 
      const realQuestionId = question.questionId;

      const subRes = await api.post('/submissions', {
        questionId: realQuestionId,
        contestId: id,
        htmlCode,
        cssCode,
        jsCode
      });
      
      const submissionId = subRes.data.data.submissionId;
      await api.post(`/evaluate/${submissionId}`);
      
      // Navigate to results or back to contest dashboard
      navigate(`/student/results/${submissionId}`);
    } catch (error) {
      console.error('Contest submission failed:', error);
      alert('Failed to submit assignment. Please try again.');
      setSubmitting(false);
    }
  };

  const formatTime = (totalSeconds) => {
    if (totalSeconds === null) return '--:--:--';
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return h === '00' ? `${m}:${s}` : `${h}:${m}:${s}`;
  };

  if (loading) return <div className="flex justify-center items-center h-[calc(100vh-8rem)]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;
  if (!question) return <div className="text-center text-white p-12">Question not found in this contest.</div>;

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col -m-6">
      {/* Top action bar */}
      <div className="bg-panel border-b border-gray-800 h-14 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(`/student/contests/${id}`)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <span className="text-orange-500 font-bold tracking-wider uppercase text-xs border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 rounded">
            Contest Mode
          </span>
        </div>
        
        <div className="flex-1 text-center font-semibold text-white flex items-center justify-center space-x-4">
          <span>{question.title}</span>
          
          {timeLeft !== null && (
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
              timeLeft <= 120 && !isTimeUp
                ? 'bg-red-500/20 text-red-500 animate-pulse'
                : isTimeUp
                ? 'bg-red-900/50 text-red-500' 
                : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
            }`}>
              {isTimeUp ? <AlertTriangle size={14} /> : <Clock size={14} />}
              <span>{isTimeUp ? "CONTEST OVER" : formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
        
        <button
          onClick={() => handleSubmit(false)}
          disabled={submitting || isTimeUp}
          className="flex items-center space-x-2 bg-secondary hover:bg-green-600 px-4 py-1.5 rounded text-white font-medium transition-colors text-sm disabled:opacity-50"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Play size={16} className="fill-current" />
          )}
          <span>{submitting ? 'Evaluating...' : 'Submit to Judge'}</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Instructions */}
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
                    src={question.referenceImage.startsWith('data:') ? question.referenceImage : `data:image/png;base64,${question.referenceImage}`}
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
          <div className="flex border-b border-gray-800 bg-sidebar">
            <button onClick={() => setActiveTab('html')} className={`flex items-center px-4 py-3 text-sm font-medium border-t-2 transition-colors ${activeTab === 'html' ? 'border-orange-500 bg-editorBg text-orange-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-panel'}`}>
              <FileCode size={16} className="mr-2" /> index.html
            </button>
            <button onClick={() => setActiveTab('css')} className={`flex items-center px-4 py-3 text-sm font-medium border-t-2 transition-colors ${activeTab === 'css' ? 'border-blue-500 bg-editorBg text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-panel'}`}>
              <FileType size={16} className="mr-2" /> style.css
            </button>
            <button onClick={() => setActiveTab('js')} className={`flex items-center px-4 py-3 text-sm font-medium border-t-2 transition-colors ${activeTab === 'js' ? 'border-yellow-500 bg-editorBg text-yellow-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-panel'}`}>
              <FileJson size={16} className="mr-2" /> script.js
            </button>
          </div>

          <div className="flex-1 relative">
            {isTimeUp && (
              <div className="absolute inset-0 z-50 bg-background/80 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-panel border border-red-500/50 p-6 rounded-xl text-center shadow-2xl">
                  <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
                  <h3 className="text-xl font-bold text-white mb-2">Contest Concluded</h3>
                  <p className="text-gray-400 text-sm">The time limit has expired. Automatically submitting your code to the judge...</p>
                </div>
              </div>
            )}
            {activeTab === 'html' && (
              <div className="absolute inset-0">
                 <Editor height="100%" language="html" theme="vs-dark" value={htmlCode} onChange={(val) => !isTimeUp && setHtmlCode(val)} options={{ minimap: { enabled: false }, fontSize: 14, readOnly: isTimeUp || submitting }} />
              </div>
            )}
            {activeTab === 'css' && (
              <div className="absolute inset-0">
                 <Editor height="100%" language="css" theme="vs-dark" value={cssCode} onChange={(val) => !isTimeUp && setCssCode(val)} options={{ minimap: { enabled: false }, fontSize: 14, readOnly: isTimeUp || submitting }} />
              </div>
            )}
            {activeTab === 'js' && (
              <div className="absolute inset-0">
                 <Editor height="100%" language="javascript" theme="vs-dark" value={jsCode} onChange={(val) => !isTimeUp && setJsCode(val)} options={{ minimap: { enabled: false }, fontSize: 14, readOnly: isTimeUp || submitting }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
