import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { BookOpen, CheckCircle, Code } from 'lucide-react';

export default function StudentDashboard() {
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch both assignments and user's submissions
      const [qRes, sRes] = await Promise.all([
        api.get('/questions'),
        api.get('/submissions')
      ]);

      setQuestions(qRes.data.data);
      
      // Map submissions by questionId for easy lookup
      const subMap = {};
      sRes.data.data.forEach(sub => {
        // Keep the most recent submission if there are multiple
        if (!subMap[sub.questionId]) {
          subMap[sub.questionId] = sub;
        }
      });
      setSubmissions(subMap);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-panel rounded-xl shadow-sm border border-gray-800 p-6">
        <h2 className="text-xl font-bold text-white flex items-center mb-6">
          <BookOpen className="mr-2 text-primary" />
          Available Assignments
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12">
            <Code size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No assignments yet</h3>
            <p className="text-gray-400 text-sm">Waiting for trainers to post new challenges.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map((q) => {
              const submission = submissions[q.questionId];
              const isEvaluated = submission?.status === 'evaluated';
              const isEvaluating = submission?.status === 'evaluating';

              return (
                <div key={q.questionId} className="bg-background border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors flex flex-col h-full">
                  {/* Image Header */}
                  {q.referenceImage ? (
                    <div className="h-40 bg-gray-900 overflow-hidden relative border-b border-gray-800">
                      <img 
                        src={`data:image/png;base64,${q.referenceImage}`} 
                        alt="Reference" 
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
                    </div>
                  ) : (
                    <div className="h-40 bg-gray-900 flex items-center justify-center border-b border-gray-800">
                      <Code size={40} className="text-gray-700" />
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-2">{q.title}</h3>
                    <p className="text-sm text-gray-400 flex-1 line-clamp-3 mb-4">
                      {q.description}
                    </p>

                    {/* Status Badge */}
                    <div className="mb-4">
                      {isEvaluated ? (
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          <CheckCircle size={12} className="mr-1" />
                          Score: {submission.totalScore}/100
                        </div>
                      ) : isEvaluating ? (
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-1"></div>
                          Evaluating...
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400">
                          Not started
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto grid grid-cols-2 gap-2">
                       <Link 
                        to={`/student/workspace/${q.questionId}`}
                        className={`text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                          submission 
                            ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                            : 'bg-primary hover:bg-indigo-600 text-white'
                        }`}
                      >
                        {submission ? 'Modify' : 'Start Challenge'}
                      </Link>
                      
                      {submission && (
                        <Link 
                          to={`/student/results/${submission.submissionId}`}
                          className="text-center py-2 rounded-lg text-sm font-medium bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
                        >
                          View Results
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
