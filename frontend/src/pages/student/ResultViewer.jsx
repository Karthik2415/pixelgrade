import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function ResultViewer() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      const res = await api.get(`/submissions/${id}/result`);
      setData(res.data.data);
    } catch (err) {
      setError('Failed to fetch results.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchResult();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-900/50 border border-red-500 text-red-200 p-6 rounded-xl max-w-2xl mx-auto mt-12 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 opacity-80" />
        <h2 className="text-xl font-bold mb-2">Error Loading Results</h2>
        <p>{error || 'Result not found.'}</p>
        <Link to="/student/dashboard" className="mt-6 inline-block text-white hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { submission, result } = data;

  if (!result) {
    return (
      <div className="bg-panel border border-gray-800 p-8 rounded-xl max-w-2xl mx-auto mt-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-6"></div>
        <h2 className="text-xl font-bold text-white mb-2">Evaluation in Progress...</h2>
        <p className="text-gray-400 mb-8">
          The automated engine is launching Chromium, running tests, and capturing screenshots. 
          This usually takes 5-15 seconds.
        </p>
        <button 
          onClick={handleRefresh}
          className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-2 rounded-lg transition-colors mx-auto"
        >
          <RefreshCw size={18} />
          <span>Refresh Status</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-6">
        <Link 
          to="/student/dashboard"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm font-medium mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-white">Evaluation Results</h1>
            <p className="text-sm text-gray-400 mt-1">Submitted on {new Date(submission.createdAt).toLocaleString()}</p>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Total Score</p>
            <div className={`text-4xl font-extrabold ${
              result.totalScore >= 90 ? 'text-green-400' :
              result.totalScore >= 70 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {result.totalScore}<span className="text-2xl text-gray-500">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ScoreCard 
          title="DOM Score" 
          score={result.domScore} 
          max={40} 
          icon={<CheckCircle className="text-green-500" />} 
          color="bg-green-500" 
        />
        <ScoreCard 
          title="Interaction Score" 
          score={result.interactionScore} 
          max={30} 
          icon={<AlertCircle className="text-yellow-500" />} 
          color="bg-yellow-500" 
        />
        <ScoreCard 
          title="Visual Score" 
          score={result.visualScore} 
          max={30} 
          icon={<CheckCircle className="text-blue-500" />} 
          color="bg-blue-500" 
          subtitle={`${result.mismatchPercentage.toFixed(2)}% pixel mismatch`}
        />
      </div>

      {/* Failed Tests Alert */}
      {result.failedTests?.length > 0 && (
        <div className="bg-red-900/20 border border-red-900 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
            <XCircle size={20} className="mr-2" />
            Failed Tests ({result.failedTests.length})
          </h3>
          <ul className="space-y-3">
            {result.failedTests.map((failure, idx) => (
              <li key={idx} className="bg-background rounded-lg p-3 text-sm border border-red-900/50">
                <p className="font-medium text-white mb-1">
                  {failure.test.description || `${failure.test.type} on ${failure.test.selector || 'element'}`}
                </p>
                <div className="flex flex-wrap gap-4 text-xs">
                  <span className="text-gray-400">Expected: <span className="text-green-400">{failure.test.expected || 'true'}</span></span>
                  <span className="text-gray-400">Actual: <span className="text-red-400">{failure.actual || 'false'}</span></span>
                  {failure.error && <span className="text-red-500 w-full mt-1">Error: {failure.error}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Visual Diff Panel */}
      <div className="bg-panel border border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-800 bg-sidebar">
          <h2 className="text-lg font-semibold text-white">Visual Comparison</h2>
          <p className="text-sm text-gray-400">Red pixels in the heatmap indicate layout or styling differences.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-800">
          <div className="bg-background p-4 flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-300 mb-4 uppercase tracking-wider">Expected Output</h3>
            <div className="flex-1 w-full bg-white rounded flex items-center justify-center overflow-hidden border border-gray-700 min-h-[300px]">
              {result.screenshots.expectedImage ? (
                <img src={result.screenshots.expectedImage} alt="Expected" className="w-full h-auto object-contain" />
              ) : (
                <span className="text-gray-400 text-sm">No reference provided</span>
              )}
            </div>
          </div>

          <div className="bg-background p-4 flex flex-col items-center">
            <h3 className="text-sm font-medium text-white mb-4 uppercase tracking-wider">Your Output</h3>
            <div className="flex-1 w-full bg-white rounded flex items-center justify-center overflow-hidden border border-gray-700 min-h-[300px] shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              {result.screenshots.actualImage ? (
                <img src={result.screenshots.actualImage} alt="Actual" className="w-full h-auto object-contain" />
              ) : (
                <span className="text-gray-400 text-sm">Preview missing</span>
              )}
            </div>
          </div>

          <div className="bg-background p-4 flex flex-col items-center">
            <h3 className="text-sm font-medium text-red-400 mb-4 uppercase tracking-wider">Diff Heatmap</h3>
            <div className="flex-1 w-full bg-white rounded flex items-center justify-center overflow-hidden border border-red-900/50 min-h-[300px]">
              {result.screenshots.diffImage ? (
                <img src={result.screenshots.diffImage} alt="Diff" className="w-full h-auto object-contain" />
              ) : (
                <span className="text-gray-400 text-sm">Diff missing</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ title, score, max, icon, color, subtitle }) {
  const percentage = Math.round((score / max) * 100);
  
  return (
    <div className="bg-panel border border-gray-800 rounded-xl p-5 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-white">{score}</span>
          <span className="text-sm text-gray-500">/ {max}</span>
        </div>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-gray-800"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className={color.replace('bg-', 'text-')}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${percentage}, 100`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}
