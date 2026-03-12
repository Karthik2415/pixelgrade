import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import Editor from '@monaco-editor/react';
import { Play, FileCode, FileType, FileJson, ArrowLeft } from 'lucide-react';

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
      } else {
        // Load starter code from question
        setHtmlCode(q.starterHtml || '');
        setCssCode(q.starterCss || '');
        setJsCode(q.starterJs || '');
      }
      
    } catch (error) {
      console.error('Failed to load workspace:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      console.log('--- SUBMITTING CODE ---');
      console.log('HTML Length:', htmlCode?.length);
      console.log('CSS Length:', cssCode?.length);
      console.log('JS Length:', jsCode?.length);
      console.log('JS Content Snapshot:', jsCode?.slice(0, 100));

      // 1. Save submission
      const subRes = await api.post('/submissions', {
        questionId: id,
        htmlCode,
        cssCode,
        jsCode
      });
      
      const submissionId = subRes.data.data.submissionId;
      
      // 2. Trigger evaluation (fire and forget on UI side, or wait if fast enough)
      // Usually evaluation takes a few seconds with Puppeteer. We'll wait.
      await api.post(`/evaluate/${submissionId}`);
      
      // 3. Navigate to results page
      navigate(`/student/results/${submissionId}`);
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit assignment. Please try again.');
      setSubmitting(false);
    }
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
        
        <div className="flex-1 text-center font-semibold text-white">
          {question.title}
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
            {activeTab === 'html' && (
              <div className="absolute inset-0">
                 <Editor
                  height="100%"
                  language="html"
                  theme="vs-dark"
                  value={htmlCode}
                  onChange={(val) => setHtmlCode(val)}
                  options={{ minimap: { enabled: false }, fontSize: 14 }}
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
                  onChange={(val) => setCssCode(val)}
                  options={{ minimap: { enabled: false }, fontSize: 14 }}
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
                  onChange={(val) => setJsCode(val)}
                  options={{ minimap: { enabled: false }, fontSize: 14 }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
