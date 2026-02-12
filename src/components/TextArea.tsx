import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  icon?: LucideIcon;
  helperText?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ 
  label, 
  icon: Icon, 
  helperText, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-slate-500" />}
          {label}
        </label>
        {helperText && <span className="text-xs text-slate-500">{helperText}</span>}
      </div>
      <textarea
        className={`
          w-full min-h-[200px] p-4 
          bg-white border border-slate-200 rounded-xl 
          text-slate-800 text-sm leading-relaxed
          placeholder:text-slate-400
          focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
          transition-all resize-y
          shadow-sm
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

export default TextArea;