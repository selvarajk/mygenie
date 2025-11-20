import React, { useState } from 'react';
import { Circular, Task, Priority } from '../types';
import { ArrowLeft, Calendar, AlertTriangle, Users, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { generateSuggestedTasks } from '../services/geminiService';

interface CircularDetailProps {
  circular: Circular;
  onBack: () => void;
  onAssignTask: (task: Partial<Task>) => void;
}

export const CircularDetail: React.FC<CircularDetailProps> = ({ circular, onBack, onAssignTask }) => {
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  
  if (!circular.summary) return <div>Loading summary...</div>;

  const { whatChanged, impactedDepartments, deadline, priority } = circular.summary;

  const handleAutoGenerateTasks = async () => {
    if (!circular.summary) return;
    setIsGeneratingTasks(true);
    const suggestions = await generateSuggestedTasks(circular.summary);
    suggestions.forEach(s => {
        onAssignTask({
            title: s.title,
            assignedTo: s.department,
            circularId: circular.id,
            priority: circular.summary?.priority,
            dueDate: circular.summary?.deadline
        });
    });
    setIsGeneratingTasks(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">{circular.regulator}</span>
            <span className="text-slate-400 text-xs">{circular.referenceNumber}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 line-clamp-1">{circular.title}</h1>
        </div>
        <div className="ml-auto flex gap-3">
            <button 
                onClick={handleAutoGenerateTasks}
                disabled={isGeneratingTasks}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium border border-indigo-200 transition-colors"
            >
                {isGeneratingTasks ? 'Thinking...' : '✨ AI Suggest Tasks'}
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium shadow-sm transition-colors">
                Download Original PDF
            </button>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
        
        {/* Left: Original Document (Simulated) */}
        <div className="bg-slate-900 rounded-xl p-6 overflow-y-auto border border-slate-700 shadow-inner">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-4">
                <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wider">Document Source</h3>
                <span className="text-xs text-slate-500">Page 1 of 4</span>
            </div>
            <div className="font-mono text-slate-300 text-sm whitespace-pre-wrap leading-relaxed opacity-90">
                {circular.originalText || "Original text content not available in simulated mode."}
            </div>
        </div>

        {/* Right: AI Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <BotIcon />
                    <h3 className="font-bold text-blue-900">GeniusAI Analysis</h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1
                    ${priority === Priority.HIGH ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}
                `}>
                    <AlertCircle size={12} />
                    {priority.toUpperCase()} PRIORITY
                </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-8">
                
                {/* What Changed */}
                <section>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CheckCircle size={16} className="text-blue-500" />
                        What Changed
                    </h4>
                    <ul className="space-y-3">
                        {whatChanged.map((change, i) => (
                            <li key={i} className="flex gap-3 text-slate-700 text-sm leading-relaxed p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="font-bold text-blue-400 text-lg leading-none">•</span>
                                {change}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Who is Impacted */}
                <section>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Users size={16} className="text-indigo-500" />
                        Who's Impacted
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                        {impactedDepartments.map((dept, i) => (
                            <div key={i} className="border border-slate-200 rounded-lg p-3 hover:border-indigo-300 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start">
                                    <span className="font-semibold text-slate-800 text-sm">{dept.name}</span>
                                    <button 
                                        onClick={() => onAssignTask({ assignedTo: dept.name, circularId: circular.id, priority })}
                                        className="text-xs bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 px-2 py-1 rounded transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1"
                                    >
                                        <Plus size={12} /> Assign Task
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{dept.impact}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Deadline */}
                <section className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                    <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Calendar size={14} />
                        Implementation Deadline
                    </h4>
                    <p className="text-lg font-bold text-slate-900">{deadline}</p>
                    {priority === Priority.HIGH && (
                        <p className="text-xs text-orange-700 mt-1 flex items-center gap-1">
                            <AlertTriangle size={12} /> 
                            Less than 30 days remaining
                        </p>
                    )}
                </section>

            </div>
        </div>

      </div>
    </div>
  );
};

const BotIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2V4" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.93 4.93L6.34 6.34" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19.07 4.93L17.66 6.34" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="4" y="8" width="16" height="12" rx="2" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 13C9 13 10 14 12 14C14 14 15 13 15 13" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 10H9.01" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 10H15.01" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);