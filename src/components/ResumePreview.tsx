import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ICONS } from '../constants';
import Button from './Button';

interface ResumePreviewProps {
  markdownContent: string;
  highlightText?: string | null;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ markdownContent, highlightText }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!contentRef.current) return;
    setIsDownloading(true);

    const element = contentRef.current;
    
    const opt = {
      margin: [10, 10, 10, 10], // mm
      filename: 'Tailored_Resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        scrollY: 0,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // @ts-ignore
      await window.html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error("PDF Download failed", e);
      alert("Failed to download PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper to highlight text if it matches the quote
  const TextWithHighlight = ({ children }: { children: React.ReactNode }) => {
    if (!highlightText || typeof children !== 'string') {
      return <>{children}</>;
    }

    // Normalize for comparison
    const text = children;
    const search = highlightText.trim();
    
    // Simple check: does the text include the highlight phrase?
    // We are matching exact substrings provided by Gemini.
    if (text.includes(search) || search.includes(text)) {
      return <span className="bg-yellow-200 transition-colors duration-200 rounded px-1">{children}</span>;
    }
    
    return <>{children}</>;
  };

  if (!markdownContent) return null;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-sm font-medium text-slate-600">Preview</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          icon={ICONS.Download} 
          onClick={handleDownload}
          isLoading={isDownloading}
        >
          {isDownloading ? 'Downloading...' : 'Download PDF'}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-slate-100/50 p-4">
        <div className="flex justify-center">
          <div 
            id="resume-preview-content" 
            ref={contentRef}
            className="w-[210mm] min-h-[297mm] bg-white shadow-xl p-[20mm] text-slate-900 box-border"
            style={{
              fontSize: '12px',
              lineHeight: '1.5',
              fontFamily: 'Inter, sans-serif'
            }}
          >
             <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold uppercase tracking-wide border-b-2 border-slate-900 pb-2 mb-4 mt-0" {...props} />,
                // Ensure H2 (Section titles) don't get stranded at bottom of page
                h2: ({node, ...props}) => (
                  <h2 
                    className="text-base font-bold uppercase tracking-wide text-slate-800 border-b border-slate-200 pb-1 mb-3 mt-6" 
                    style={{ pageBreakAfter: 'avoid' }}
                    {...props} 
                  />
                ),
                // Custom h3 for Right Aligned Dates + Page Break Protection
                h3: ({node, children, ...props}) => {
                  const textContent = React.Children.toArray(children).join('');
                  if (typeof textContent === 'string' && textContent.includes('|')) {
                    const [title, date] = textContent.split('|').map(s => s.trim());
                    return (
                      <div 
                        className="flex flex-row justify-between items-baseline border-b border-dotted border-slate-200/50 pb-1 mb-1 mt-4"
                        style={{ pageBreakInside: 'avoid' }}
                      >
                        <h3 className="text-sm font-bold text-slate-800" {...props}>
                           <TextWithHighlight>{title}</TextWithHighlight>
                        </h3>
                        <span className="text-xs font-semibold text-slate-600 whitespace-nowrap ml-4">{date}</span>
                      </div>
                    );
                  }
                  return (
                    <h3 
                      className="text-sm font-bold text-slate-800 mb-1 mt-4" 
                      style={{ pageBreakAfter: 'avoid' }}
                      {...props}
                    >
                      <TextWithHighlight>{children}</TextWithHighlight>
                    </h3>
                  );
                },
                p: ({node, children, ...props}) => (
                  <p className="mb-2 text-xs leading-relaxed text-slate-700" {...props}>
                    <TextWithHighlight>{children}</TextWithHighlight>
                  </p>
                ),
                ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 mb-2 space-y-0.5" {...props} />,
                li: ({node, children, ...props}) => (
                  <li className="text-xs text-slate-700 pl-1 leading-snug" {...props}>
                    <TextWithHighlight>{children}</TextWithHighlight>
                  </li>
                ),
                strong: ({node, children, ...props}) => (
                  <strong className="font-bold text-slate-900" {...props}>
                    <TextWithHighlight>{children}</TextWithHighlight>
                  </strong>
                ),
                hr: ({node, ...props}) => <hr className="my-4 border-slate-200" {...props} />,
              }}
             >
               {markdownContent}
             </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;