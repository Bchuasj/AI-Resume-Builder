import React, { useRef } from 'react';
import { ICONS } from '../constants';
import { OptimizationAnalysis } from '../types';
import Button from './Button';

interface ResumeAnalysisProps {
  analysis: OptimizationAnalysis;
  onBack: () => void;
  onHoverChange?: (quote: string | null) => void;
}

const ResumeAnalysis: React.FC<ResumeAnalysisProps> = ({ analysis, onBack, onHoverChange }) => {
  const hiddenCoverLetterRef = useRef<HTMLDivElement>(null);

  const handleCopyEmail = () => {
    if (analysis.coverEmail) {
      navigator.clipboard.writeText(analysis.coverEmail);
      alert("Email copied to clipboard!");
    }
  };

  const handleDownloadCoverLetter = async () => {
    if (!hiddenCoverLetterRef.current || !analysis.coverLetter) return;
    
    const element = hiddenCoverLetterRef.current;
    element.innerHTML = analysis.coverLetter.replace(/\n/g, '<br/>');

    const opt = {
      margin: 20,
      filename: 'Cover_Letter.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      await window.html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error(e);
      alert("Error downloading cover letter");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <ICONS.Lightbulb className="w-5 h-5 text-yellow-500" />
          Strategy
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Job Link Info */}
        {analysis.jobUrl && (
           <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between gap-4">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                 <ICONS.Link className="w-4 h-4" />
               </div>
               <div>
                 <h3 className="text-sm font-bold text-slate-700">Source Job</h3>
                 <p className="text-xs text-blue-600 truncate max-w-[200px]">{analysis.jobUrl}</p>
               </div>
             </div>
             <a 
               href={analysis.jobUrl} 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-xs font-semibold text-blue-600 hover:underline"
             >
               Visit
             </a>
           </div>
        )}
        
        {/* Cover Letter / Email Actions */}
        {(analysis.coverLetter || analysis.coverEmail) && (
          <div className="grid grid-cols-2 gap-3">
             {analysis.coverLetter && (
               <Button 
                 variant="outline" 
                 size="sm" 
                 icon={ICONS.Download} 
                 onClick={handleDownloadCoverLetter}
                 className="w-full text-xs"
               >
                 DL Cover Letter
               </Button>
             )}
             {analysis.coverEmail && (
               <Button 
                 variant="outline" 
                 size="sm" 
                 icon={ICONS.Paperclip} 
                 onClick={handleCopyEmail}
                 className="w-full text-xs"
               >
                 Copy Email
               </Button>
             )}
          </div>
        )}

        {/* Hidden Div for Cover Letter PDF Gen */}
        <div 
          ref={hiddenCoverLetterRef} 
          className="fixed top-[-9999px] left-[-9999px] w-[210mm] p-[20mm] bg-white text-black font-serif text-sm leading-relaxed whitespace-pre-line"
        />

        {/* Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Strategy Summary</h3>
          <p className="text-slate-700 leading-relaxed text-sm">
            {analysis.summary}
          </p>
        </div>

        {/* Keywords */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <ICONS.Check className="w-4 h-4 text-emerald-500" />
            Matched Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.keywords.map((keyword, idx) => (
              <span 
                key={idx} 
                className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Changes - Interactive */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <ICONS.List className="w-4 h-4 text-blue-500" />
            Key Improvements
          </h3>
          <p className="text-xs text-slate-400 italic">Hover over items to see them on the resume.</p>
          <div className="space-y-4">
            {analysis.changes.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-slate-50 rounded-lg p-4 border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all cursor-default"
                onMouseEnter={() => onHoverChange?.(item.quote || null)}
                onMouseLeave={() => onHoverChange?.(null)}
              >
                <p className="text-sm font-semibold text-slate-800 mb-1">
                  {item.change}
                </p>
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-blue-600">Why: </span> 
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResumeAnalysis;