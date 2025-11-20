import React, { useState } from 'react';
import { UploadCloud, FileText, Database, Bot, CheckCircle2, Loader2, X } from 'lucide-react';
import { generateRegulatorySummary } from '../services/geminiService';
import { Circular } from '../types';

interface UploadIngestProps {
  onUploadComplete: (circular: Circular) => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 1, label: "Ingesting PDF", icon: UploadCloud },
  { id: 2, label: "Parsing & Chunking (Server)", icon: FileText },
  { id: 3, label: "Vectorizing to Astra DB", icon: Database },
  { id: 4, label: "Gemini AI Summarization", icon: Bot },
];

export const UploadIngest: React.FC<UploadIngestProps> = ({ onUploadComplete, onCancel }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = idle, 1-4 = processing
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // For the prototype, we allow the user to paste text to simulate the PDF extraction 
  // because we can't actually parse a binary PDF in this browser sandbox environment effectively without libraries.
  const [simulatedText, setSimulatedText] = useState(''); 
  const [showTextInput, setShowTextInput] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    // In a real app, this is where we'd upload to backend.
    // For prototype, we check if it's a text file or just mock the process
    setShowTextInput(true); // Ask user for text content to make the demo "Real"
  };

  const startRagPipeline = async () => {
    if (!file || !simulatedText) return;
    
    setError(null);
    
    // Step 1: Ingest
    setCurrentStep(1);
    await new Promise(r => setTimeout(r, 800));

    // Step 2: Parse
    setCurrentStep(2);
    await new Promise(r => setTimeout(r, 1000));

    // Step 3: Vectorize
    setCurrentStep(3);
    await new Promise(r => setTimeout(r, 1000));

    // Step 4: Summarize (REAL API CALL)
    setCurrentStep(4);
    try {
      const summary = await generateRegulatorySummary(simulatedText, "RBI");
      
      const newCircular: Circular = {
        id: Date.now().toString(),
        referenceNumber: `RBI/2024-25/${Math.floor(Math.random() * 100)}`,
        title: file.name.replace('.pdf', ''),
        date: new Date().toISOString(),
        regulator: 'RBI',
        status: 'New',
        originalText: simulatedText,
        summary: summary
      };

      onUploadComplete(newCircular);
    } catch (e) {
      setError("Failed to generate summary. Please try again.");
      setCurrentStep(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-[600px] shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Bot className="text-blue-600" />
            Ingest New Circular
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="p-8">
          {/* Pipeline Visualizer */}
          {currentStep > 0 && (
             <div className="mb-8">
               <div className="flex justify-between items-center relative">
                 {/* Progress Line */}
                 <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-100 -z-10"></div>
                 <div 
                    className="absolute left-0 top-1/2 h-1 bg-blue-500 -z-10 transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                 ></div>

                 {STEPS.map((step) => {
                   const Icon = step.icon;
                   const isActive = currentStep >= step.id;
                   const isCompleted = currentStep > step.id;
                   
                   return (
                     <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                         isActive ? 'bg-blue-600 text-white scale-110' : 'bg-slate-100 text-slate-400'
                       }`}>
                         {isCompleted ? <CheckCircle2 size={20} /> : (isActive && currentStep === step.id ? <Loader2 className="animate-spin" size={20} /> : <Icon size={20} />)}
                       </div>
                       <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                         {step.label.split(' ')[0]}
                       </span>
                     </div>
                   );
                 })}
               </div>
               <p className="text-center text-sm text-slate-500 mt-6 font-medium animate-pulse">
                  {STEPS[currentStep - 1]?.label}...
               </p>
             </div>
          )}

          {/* Upload State */}
          {currentStep === 0 && !showTextInput && (
            <div 
              className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer
                ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'}
              `}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
              }}
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Click to upload or drag and drop</h3>
              <p className="text-slate-500 text-sm text-center max-w-xs">
                PDF, DOCX only. Max 10MB. <br/>
                We extract text via <span className="font-mono text-blue-600">PyPDF</span> & process with <span className="font-mono text-blue-600">Astra DB</span>.
              </p>
              <input 
                type="file" 
                className="hidden" 
                id="file-upload"
                accept=".pdf"
                onChange={(e) => {
                    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                }}
              />
              <label htmlFor="file-upload" className="absolute inset-0 cursor-pointer"></label>
            </div>
          )}

          {/* Text Input Simulation (To make the RAG "Real" in this demo) */}
          {currentStep === 0 && showTextInput && (
             <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 text-red-600 p-2 rounded">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">{file?.name}</p>
                            <p className="text-xs text-slate-500">Ready for processing</p>
                        </div>
                    </div>
                    <button onClick={() => {setFile(null); setShowTextInput(false);}} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs text-yellow-800">
                    <strong>Prototype Note:</strong> Since we cannot run a server-side PDF parser here, please paste the <em>text content</em> of the circular below to simulate the extraction step. This text will be sent to Gemini.
                </div>

                <textarea 
                    className="w-full h-32 border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Paste circular text here..."
                    value={simulatedText}
                    onChange={(e) => setSimulatedText(e.target.value)}
                ></textarea>

                <button 
                    onClick={startRagPipeline}
                    disabled={!simulatedText}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center gap-2"
                >
                    <Bot size={20} />
                    Run RAG Pipeline
                </button>
             </div>
          )}
          
          {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                  {error}
              </div>
          )}

        </div>
      </div>
    </div>
  );
};