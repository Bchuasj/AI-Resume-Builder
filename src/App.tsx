import React, { useState } from 'react';
import Button from './components/Button';
import ResumePreview from './components/ResumePreview';
import ResumeAnalysis from './components/ResumeAnalysis';
import FileUpload from './components/FileUpload';
import { ICONS } from './constants';
import { optimizeResume } from './services/geminiService';
import { AppStatus, JobInput, JobResult, UploadedFile } from './types';

const App: React.FC = () => {
  // Input State
  const [resumeFile, setResumeFile] = useState<UploadedFile | null>(null);
  const [jobs, setJobs] = useState<JobInput[]>([{ id: '1', text: '' }]);
  
  // App State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<Record<string, JobResult>>({});
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  // Interaction State
  const [hoveredHighlight, setHoveredHighlight] = useState<string | null>(null);

  // Job Management
  const addJobInput = () => {
    setJobs([...jobs, { id: crypto.randomUUID(), text: '' }]);
  };

  const removeJobInput = (id: string) => {
    if (jobs.length > 1) {
      setJobs(jobs.filter(j => j.id !== id));
    }
  };

  const updateJobText = (id: string, text: string) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, text } : j));
  };

  // Optimization Logic
  const handleOptimizeAll = async () => {
    if (!resumeFile) return;
    
    const validJobs = jobs.filter(j => j.text.trim().length > 0);
    if (validJobs.length === 0) return;

    setIsAnalyzing(true);
    const newResults: Record<string, JobResult> = {};

    validJobs.forEach(job => {
      newResults[job.id] = { jobId: job.id, status: AppStatus.LOADING, result: null, error: null };
    });
    setResults(newResults);
    
    setSelectedJobId(validJobs[0].id);

    await Promise.all(validJobs.map(async (job) => {
      try {
        const result = await optimizeResume({ 
          resumeData: resumeFile.data,
          resumeMimeType: resumeFile.type,
          jobDescription: job.text 
        });
        
        setResults(prev => ({
          ...prev,
          [job.id]: { jobId: job.id, status: AppStatus.SUCCESS, result, error: null }
        }));
      } catch (err: any) {
        setResults(prev => ({
          ...prev,
          [job.id]: { jobId: job.id, status: AppStatus.ERROR, result: null, error: err.message || "Failed" }
        }));
      }
    }));

    setIsAnalyzing(false);
  };

  const resetState = () => {
    setResults({});
    setIsAnalyzing(false);
    setSelectedJobId(null);
    setHoveredHighlight(null);
  };

  const hasResults = Object.keys(results).length > 0;
  const currentResult = selectedJobId ? results[selectedJobId] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 print:hidden h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
            <ICONS.Magic className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Resume AI Builder</span>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 h-[calc(100vh-4rem)]">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Left Column: Input List OR Result List */}
          <div className="lg:col-span-4 flex flex-col h-full overflow-hidden transition-all duration-300">
            <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              
              {hasResults ? (
                // RESULT LIST VIEW
                <>
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h2 className="font-bold text-slate-800">Your Applications</h2>
                    <Button variant="ghost" size="sm" onClick={resetState}>
                      <ICONS.Refresh className="w-4 h-4 mr-1" /> New Batch
                    </Button>
                  </div>
                  <div className="overflow-y-auto p-2 space-y-2">
                    {Object.values(results).map((res, idx) => (
                      <button
                        key={res.jobId}
                        onClick={() => setSelectedJobId(res.jobId)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          selectedJobId === res.jobId 
                            ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500/20' 
                            : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job {idx + 1}</span>
                          {res.status === AppStatus.LOADING && <ICONS.Refresh className="w-3 h-3 animate-spin text-blue-500"/>}
                          {res.status === AppStatus.SUCCESS && <ICONS.Check className="w-4 h-4 text-emerald-500"/>}
                          {res.status === AppStatus.ERROR && <ICONS.Close className="w-4 h-4 text-red-500"/>}
                        </div>
                        <div className="text-sm font-medium text-slate-800 line-clamp-2">
                           {jobs.find(j => j.id === res.jobId)?.text.substring(0, 50)}...
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                // INPUT FORM VIEW
                <>
                  <div className="p-6 border-b border-slate-100">
                    <h1 className="text-xl font-bold text-slate-800 mb-2">New Batch</h1>
                    <p className="text-sm text-slate-500">
                      Upload your resume once, then add multiple job descriptions. I'll tailor a unique resume for each one.
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs">1</span>
                        Base Resume
                      </label>
                      <FileUpload selectedFile={resumeFile} onFileSelect={setResumeFile} />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs">2</span>
                        Target Jobs
                      </label>
                      
                      <div className="space-y-4">
                        {jobs.map((job, index) => (
                          <div key={job.id} className="relative animate-in slide-in-from-left-2 duration-300">
                            <div className="absolute top-3 left-3 text-slate-400">
                              <span className="text-xs font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">#{index + 1}</span>
                            </div>
                            <textarea 
                              className="w-full pl-12 pr-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none h-24"
                              placeholder="Paste job link or description..."
                              value={job.text}
                              onChange={(e) => updateJobText(job.id, e.target.value)}
                            />
                            {jobs.length > 1 && (
                              <button 
                                onClick={() => removeJobInput(job.id)}
                                className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <ICONS.Close className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={addJobInput}
                        className="w-full border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-300"
                      >
                        <span className="text-lg mr-2">+</span> Add Another Job
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <Button 
                      className="w-full py-3 text-base shadow-lg shadow-blue-500/20"
                      onClick={handleOptimizeAll}
                      disabled={!resumeFile || jobs.every(j => !j.text.trim())}
                      isLoading={isAnalyzing}
                      icon={ICONS.Magic}
                    >
                      {isAnalyzing ? 'Processing...' : `Generate ${jobs.filter(j => j.text.trim()).length} Resumes`}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Preview & Analysis */}
          <div className="lg:col-span-8 flex flex-col h-full transition-all duration-300">
             {hasResults && currentResult ? (
                <div className="h-full flex flex-col gap-4 animate-in fade-in duration-500">
                   
                   {currentResult.status === AppStatus.LOADING && (
                     <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                        <ICONS.Refresh className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800">Optimizing Resume...</h3>
                        <p className="text-slate-500 max-w-sm mt-2">
                          Analyzing keywords and restructuring your experience for this specific role.
                        </p>
                     </div>
                   )}

                   {currentResult.status === AppStatus.ERROR && (
                      <div className="flex-1 flex flex-col items-center justify-center bg-red-50 rounded-2xl border border-red-100 p-8 text-center">
                        <ICONS.Close className="w-8 h-8 text-red-500 mb-4" />
                        <h3 className="text-lg font-semibold text-red-800">Optimization Failed</h3>
                        <p className="text-red-600 mt-2">{currentResult.error}</p>
                      </div>
                   )}

                   {currentResult.status === AppStatus.SUCCESS && currentResult.result && (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
                        {/* Analysis Panel (Left in result view) */}
                        <div className="h-full overflow-hidden">
                          <ResumeAnalysis 
                            analysis={currentResult.result.analysis} 
                            onBack={() => {}} 
                            onHoverChange={setHoveredHighlight}
                          />
                        </div>
                        {/* Preview Panel (Right in result view) */}
                        <div className="h-full overflow-hidden">
                          <ResumePreview 
                            markdownContent={currentResult.result.markdown} 
                            highlightText={hoveredHighlight}
                          />
                        </div>
                     </div>
                   )}

                </div>
             ) : (
               <div className="h-full bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center p-8 text-center hidden lg:flex">
                 <div className="max-w-xs space-y-4">
                   <div className="w-16 h-16 bg-white rounded-2xl shadow-sm mx-auto flex items-center justify-center">
                     <ICONS.Resume className="w-8 h-8 text-slate-300" />
                   </div>
                   <div>
                     <h3 className="text-lg font-semibold text-slate-900">Ready to Optimize</h3>
                     <p className="text-sm text-slate-500 mt-1">
                       Add your target jobs on the left and start the batch process.
                     </p>
                   </div>
                 </div>
               </div>
             )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;