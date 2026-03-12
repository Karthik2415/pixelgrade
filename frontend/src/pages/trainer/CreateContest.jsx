import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/api";
import Editor from "@monaco-editor/react";
import { ChevronLeft, Plus, Trash2, Code, Flame } from "lucide-react";

const DEFAULT_JSON = `[
  {
    "input": { "html": "<button>Click Me</button>", "css": "" },
    "expectedOutput": { "html": "<button>Click Me</button>", "css": "" },
    "isHidden": false
  }
]`;

export default function CreateContest() {
  const navigate = useNavigate();

  // Contest Metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Questions Array
  const [questions, setQuestions] = useState([]);
  
  // Current Question being built
  const [qTitle, setQTitle] = useState("");
  const [qDesc, setQDesc] = useState("");
  const [qReferenceImage, setQReferenceImage] = useState(null);
  const [qTestCases, setQTestCases] = useState(DEFAULT_JSON);
  const [qHtml, setQHtml] = useState("<!-- Starter HTML -->");
  const [qCss, setQCss] = useState("/* Starter CSS */");
  const [qJs, setQJs] = useState("// Starter JS");
  
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQReferenceImage(reader.result.split(',')[1]); 
      };
      reader.readAsDataURL(file);
    }
  };

  const addQuestion = () => {
    if (!qTitle.trim() || !qDesc.trim()) return alert("Question title and description required");
    
    let parsedTestCases;
    try {
      parsedTestCases = JSON.parse(qTestCases);
    } catch (err) {
      return alert("Invalid JSON for Test Cases");
    }

    const newQ = {
      title: qTitle,
      description: qDesc,
      referenceImage: qReferenceImage,
      testCases: parsedTestCases,
      starterHtml: qHtml,
      starterCss: qCss,
      starterJs: qJs
    };

    setQuestions([...questions, newQ]);
    
    // Reset Form
    setQTitle("");
    setQDesc("");
    setQReferenceImage(null);
    setQTestCases(DEFAULT_JSON);
    setQHtml("<!-- Starter HTML -->");
    setQCss("/* Starter CSS */");
    setQJs("// Starter JS");
    setShowQuestionForm(false);
  };

  const removeQuestion = (index) => {
    const newQs = [...questions];
    newQs.splice(index, 1);
    setQuestions(newQs);
  };

  const handleSubmitContest = async (e) => {
    e.preventDefault();
    if (questions.length === 0) return alert("Must add at least one question");
    if (!startTime || !endTime) return alert("Start and End times are required");
    
    if (new Date(startTime) >= new Date(endTime)) {
      return alert("End time must be strictly after start time.");
    }

    setSubmitting(true);
    try {
      await api.post("/contests", {
        title,
        description,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        questions
      });

      navigate("/trainer/contests");
    } catch (err) {
      console.error(err);
      alert("Failed to create contest");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pb-20">
      <Link
        to="/trainer/contests"
        className="flex items-center text-gray-400 hover:text-white transition-colors mb-6 inline-flex"
      >
        <ChevronLeft size={20} className="mr-1" />
        <span>Back to Contests</span>
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-orange-500/20 rounded-xl">
          <Flame className="text-orange-500" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Create Contest</h1>
          <p className="text-gray-400 mt-1">Schedule a global competitive event</p>
        </div>
      </div>

      <form onSubmit={handleSubmitContest} className="space-y-8">
        {/* Contest Metadata */}
        <div className="bg-panel border border-gray-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-3">Contest Details</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Contest Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Weekend UI Challenge #1"
                className="w-full bg-background border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-primary focus:ring-1 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What is this contest about?"
                className="w-full bg-background border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-primary focus:ring-1 outline-none resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Start Time (Local)</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-background border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-primary focus:ring-1 outline-none color-scheme-dark"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">End Time (Local)</label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-background border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-primary focus:ring-1 outline-none color-scheme-dark"
                  />
               </div>
            </div>
          </div>
        </div>

        {/* Added Questions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Problems ({questions.length})</h2>
          </div>

          {questions.map((q, idx) => (
            <div key={idx} className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center font-bold text-gray-300">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{q.title}</h4>
                    <p className="text-xs text-gray-400 line-clamp-1 max-w-lg">{q.description}</p>
                  </div>
               </div>
               <button type="button" onClick={() => removeQuestion(idx)} className="text-red-400 hover:bg-red-500/10 p-2 rounded">
                 <Trash2 size={16} />
               </button>
            </div>
          ))}

          {!showQuestionForm ? (
            <button
              type="button"
              onClick={() => setShowQuestionForm(true)}
              className="w-full border-2 border-dashed border-gray-700 hover:border-primary hover:bg-primary/5 rounded-xl p-6 text-center text-gray-400 hover:text-white transition-all content-center font-medium flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Add Problem
            </button>
          ) : (
             <div className="bg-panel border border-primary/50 rounded-xl p-6 shadow-2xl relative">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-800 pb-3">
                  <Code size={20} className="text-primary" /> New Problem
                </h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Problem Title</label>
                    <input type="text" value={qTitle} onChange={(e) => setQTitle(e.target.value)} className="w-full bg-background border border-gray-700 rounded px-3 py-2 text-sm text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea value={qDesc} onChange={(e) => setQDesc(e.target.value)} rows={3} className="w-full bg-background border border-gray-700 rounded px-3 py-2 text-sm text-white resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Reference Image (Optional)</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-300 mb-1">Evaluation Test Cases (JSON)</label>
                     <div className="h-48 border border-gray-700 rounded overflow-hidden">
                       <Editor language="json" theme="vs-dark" value={qTestCases} onChange={(v) => setQTestCases(v)} options={{ minimap: { enabled: false } }} />
                     </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-800">
                  <button type="button" onClick={() => setShowQuestionForm(false)} className="px-4 py-2 rounded text-gray-400 hover:bg-gray-800">Cancel</button>
                  <button type="button" onClick={addQuestion} className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded font-medium">Save Problem to Contest</button>
                </div>
             </div>
          )}
        </div>

        <div className="flex justify-end pt-8 border-t border-gray-800">
          <button
            type="submit"
            disabled={submitting || questions.length === 0}
            className="bg-secondary hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2 transition-all"
          >
            {submitting ? "Publishing Contest..." : "Publish Contest"}
          </button>
        </div>

      </form>
    </div>
  );
}
