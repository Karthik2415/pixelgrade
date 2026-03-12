import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';
import Editor from '@monaco-editor/react';
import { ChevronLeft, Save, AlertCircle, Image as ImageIcon, Code, Beaker } from 'lucide-react';

const DEFAULT_JSON = `{
  "domTests": [
    { "selector": "h1", "type": "exists", "description": "Title element exists" },
    { "selector": "h1", "type": "textContains", "expected": "Todo", "description": "Title contains Todo" },
    { "selector": "#taskInput", "type": "exists", "description": "Input field present" },
    { "selector": "#addBtn", "type": "exists", "description": "Add button present" }
  ],
  "interactionTests": [
    {
      "description": "Add a task",
      "actions": [
        { "type": "type", "selector": "#taskInput", "value": "Test Task" },
        { "type": "click", "selector": "#addBtn" }
      ],
      "verify": { "selector": "#taskList li", "type": "countEquals", "expected": "1" }
    }
  ]
}`;

export default function CreateQuestion() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [referenceImage, setReferenceImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [testCases, setTestCases] = useState(DEFAULT_JSON);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { roomId } = useParams();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // Strip data:image/png;base64, prefix for the backend
        const base64String = reader.result.replace(/^data:image\/[a-z]+;base64,/, "");
        setReferenceImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate JSON
      JSON.parse(testCases);

      const formData = {
        title,
        description,
        referenceImage,
        testCases,
        timeLimit: timeLimit ? parseInt(timeLimit, 10) : null,
      };

      await api.post('/questions', {
        ...formData,
        roomId,
      });

      navigate(`/trainer/rooms/${roomId}`);
    } catch (err) {
      setError(err.name === 'SyntaxError' ? 'Invalid JSON format in test cases' : err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Create Question</h1>
          <p className="text-sm text-gray-400 mt-1">Design a new frontend assessment</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center space-x-2 bg-primary hover:bg-indigo-600 px-6 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Save size={18} />
              <span>Save Question</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form Info */}
        <div className="space-y-6">
          <div className="bg-panel rounded-xl shadow-sm border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Code size={18} className="mr-2 text-primary" />
              Basic Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Responsive Pricing Component"
                  className="w-full bg-background border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description / Instructions
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Describe the task, rules, and requirements..."
                  className="w-full bg-background border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Time Limit (minutes) <span className="text-gray-500 text-xs font-normal">- Optional</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  placeholder="e.g., 30"
                  className="w-full bg-background border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-panel rounded-xl shadow-sm border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <ImageIcon size={18} className="mr-2 text-pink-500" />
              Reference Image (Target UI)
            </h2>
            
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-lg bg-background hover:border-gray-500 transition-colors">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="mb-4">
                    <img src={imagePreview} alt="Preview" className="mx-auto h-48 object-contain rounded" />
                    <button 
                      type="button"
                      onClick={() => { setImagePreview(null); setReferenceImage(null); }}
                      className="mt-2 text-xs text-red-400 hover:text-red-300"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-500" />
                )}
                
                <div className="flex justify-center text-sm text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-background rounded-md font-medium text-primary hover:text-indigo-400 focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png" onChange={handleImageUpload} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG up to 10MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: JSON Config */}
        <div className="bg-panel rounded-xl shadow-sm border border-gray-800 p-6 flex flex-col h-full min-h-[600px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Code size={18} className="mr-2 text-secondary" />
              Puppeteer Test Cases (JSON)
            </h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Define DOM and Interaction tests for the automated evaluation engine.
          </p>
          
          <div className="flex-1 border border-gray-700 rounded-lg overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="json"
              theme="vs-dark"
              value={testCases}
              onChange={(val) => setTestCases(val)}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                formatOnPaste: true,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
