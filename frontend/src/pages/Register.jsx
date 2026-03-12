import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, UserPlus } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(name, email, password, role);
    
    if (result.success) {
      if (role === 'trainer') {
        navigate('/trainer/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary">
          <Code2 size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Create an account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-sidebar py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300">
                I am a...
              </label>
              <div className="mt-1 flex space-x-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors ${
                    role === 'student'
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'border-gray-700 text-gray-400 hover:bg-panel'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('trainer')}
                  className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors ${
                    role === 'trainer'
                      ? 'bg-secondary/20 border-secondary text-secondary'
                      : 'border-gray-700 text-gray-400 hover:bg-panel'
                  }`}
                >
                  Trainer
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 bg-panel rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 bg-panel rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 bg-panel rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-white"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors ${
                  role === 'trainer' 
                    ? 'bg-secondary hover:bg-green-600 focus:ring-secondary' 
                    : 'bg-primary hover:bg-indigo-600 focus:ring-primary'
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Register
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
             <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary hover:text-indigo-400">
                  Sign in here
                </Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
