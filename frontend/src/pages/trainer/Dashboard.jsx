import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { PlusCircle, Search, Users, Code, CheckCircle } from 'lucide-react';

export default function TrainerDashboard() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/questions');
      setQuestions(res.data.data);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-panel rounded-xl shadow-sm border border-gray-800 p-6 flex items-center space-x-4">
          <div className="p-3 bg-primary/20 text-primary rounded-lg">
            <Code size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Total Questions</p>
            <p className="text-2xl font-bold text-white">{questions.length}</p>
          </div>
        </div>
        
        <div className="bg-panel rounded-xl shadow-sm border border-gray-800 p-6 flex items-center space-x-4">
          <div className="p-3 bg-secondary/20 text-secondary rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Active Students</p>
            <p className="text-2xl font-bold text-white">42</p>
          </div>
        </div>

        <div className="bg-panel rounded-xl shadow-sm border border-gray-800 p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Submissions</p>
            <p className="text-2xl font-bold text-white">156</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-panel rounded-xl shadow-sm border border-gray-800 flex flex-col h-[calc(100vh-16rem)]">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Your Questions</h2>
          <Link 
            to="/trainer/questions/new" 
            className="flex items-center space-x-2 bg-primary hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <PlusCircle size={18} />
            <span>Create Question</span>
          </Link>
        </div>

        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search questions..." 
              className="w-full bg-background border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <Code size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No questions yet</h3>
              <p className="text-gray-400 text-sm">Create your first frontend assessment to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q.questionId} className="bg-background border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">{q.title}</h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{q.description}</p>
                    <div className="flex items-center space-x-4 mt-4 text-xs font-medium text-gray-500">
                      <span>Created: {new Date(q.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        <span>Active</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-sm text-gray-400 hover:text-white px-3 py-1 bg-gray-800 rounded transition-colors">Edit</button>
                    <button className="text-sm text-white hover:bg-primary/90 px-3 py-1 bg-primary rounded transition-colors">Submissions</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
