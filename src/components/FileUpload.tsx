import React, { useRef, useState } from 'react';
import { ICONS } from '../constants';
import { UploadedFile } from '../types';

interface FileUploadProps {
  onFileSelect: (file: UploadedFile | null) => void;
  selectedFile: UploadedFile | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are supported.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Remove Data URL prefix to get raw base64
      const base64Data = result.split(',')[1];
      
      onFileSelect({
        name: file.name,
        type: file.type,
        data: base64Data
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  if (selectedFile) {
    return (
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl group animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm text-blue-600">
            <ICONS.Resume className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-slate-800 truncate block">
              {selectedFile.name}
            </span>
            <span className="text-xs text-slate-500">Ready to analyze</span>
          </div>
        </div>
        <button 
          onClick={() => {
            onFileSelect(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          title="Remove file"
        >
          <ICONS.Close className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`
        relative group cursor-pointer
        border-2 border-dashed rounded-xl p-8
        flex flex-col items-center justify-center gap-3
        transition-all duration-200
        ${isDragging 
          ? 'border-blue-500 bg-blue-50/50 scale-[0.99]' 
          : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
        }
      `}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        ref={fileInputRef}
        type="file" 
        accept="application/pdf"
        className="hidden" 
        onChange={handleFileChange}
      />
      
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-200">
        <ICONS.Upload className="w-6 h-6" />
      </div>
      
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-slate-700">
          Drop your resume here
        </p>
        <p className="text-xs text-slate-500">
          Supports PDF only
        </p>
      </div>
    </div>
  );
};

export default FileUpload;