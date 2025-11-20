import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatsCard } from './components/StatsCard';
import { CircularDetail } from './components/CircularDetail';
import { UploadIngest } from './components/UploadIngest';
import { MOCK_CIRCULARS, MOCK_TASKS } from './mockData';
import { Circular as CircularType, Task as TaskType, TaskStatus, Priority } from './types';
import { Bell, Search, Filter, Plus, FileText, AlertOctagon, CheckSquare, Clock } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [circulars, setCirculars] = useState<CircularType[]>(MOCK_CIRCULARS);
  const [tasks, setTasks] = useState<TaskType[]>(MOCK_TASKS);
  const [selectedCircular, setSelectedCircular] = useState<CircularType | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Add task modal state (simplified inline for prototype)
  const handleAddTask = (newTask: Partial<TaskType>) => {
      const task: TaskType = {
          id: Date.now().toString(),
          circularId: newTask.circularId || '',
          title: newTask.title || 'New Action Item',
          assignedTo: newTask.assignedTo || 'Unassigned',
          dueDate: newTask.dueDate || new Date().toISOString(),
          priority: newTask.priority || Priority.MEDIUM,
          status: TaskStatus.PENDING
      };
      setTasks([task, ...tasks]);
      // Switch to tasks view to show the "Audit Trail" effect
      setActiveTab('tasks');
      setSelectedCircular(null);
  };

  const handleUploadComplete = (newCircular: CircularType) => {
    setCirculars([newCircular, ...circulars]);
    setIsUploadModalOpen(false);
    setSelectedCircular(newCircular); // Navigate immediately to the analysis
  };

  // Renders
  const renderContent = () => {
    if (selectedCircular) {
      return (
        <CircularDetail 
          circular={selectedCircular} 
          onBack={() => setSelectedCircular(null)}
          onAssignTask={handleAddTask}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Compliance Overview</h2>
                <p className="text-slate-500 text-sm">Welcome back, John. You have 3 high priority items.</p>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-blue-900/10 transition-all"
              >
                <Plus size={20} /> Ingest Circular
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <StatsCard title="Compliance Score" value="92%" icon={<CheckSquare size={24}/>} trend="2.1%" trendUp={true} />
               <StatsCard title="Open Tasks" value={tasks.filter(t => t.status !== TaskStatus.COMPLETED).length} icon={<Clock size={24}/>} trend="4" trendUp={false} />
               <StatsCard title="High Priority" value={tasks.filter(t => t.priority === Priority.HIGH).length} icon={<AlertOctagon size={24}/>} colorClass="bg-red-50 border-red-100" />
               <StatsCard title="New Circulars" value={circulars.filter(c => c.status === 'New').length} icon={<FileText size={24}/>} />
            </div>

            {/* Recent Activity / Inbox Preview */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Recent Circulars</h3>
                    <button onClick={() => setActiveTab('inbox')} className="text-blue-600 text-sm font-medium hover:underline">View All</button>
                </div>
                <div className="divide-y divide-slate-50">
                    {circulars.slice(0, 5).map(circular => (
                        <div key={circular.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => setSelectedCircular(circular)}>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs
                                    ${circular.regulator === 'RBI' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}
                                `}>
                                    {circular.regulator}
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">{circular.title}</h4>
                                    <p className="text-xs text-slate-500">{circular.referenceNumber} • {new Date(circular.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {circular.summary?.priority === Priority.HIGH && (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded">High Priority</span>
                                )}
                                <span className="text-slate-300 group-hover:text-blue-500">→</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        );
      
      case 'inbox':
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-900">Circular Inbox</h2>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Search circulars..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"><Filter size={20} /></button>
                        <button onClick={() => setIsUploadModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Upload New</button>
                    </div>
                </div>
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                    {circulars.map(circular => (
                        <div key={circular.id} onClick={() => setSelectedCircular(circular)} className="p-6 hover:bg-slate-50 cursor-pointer transition-colors">
                             <div className="flex justify-between mb-2">
                                <span className="text-xs font-bold text-slate-400">{circular.referenceNumber}</span>
                                <span className="text-xs text-slate-400">{new Date(circular.date).toLocaleDateString()}</span>
                             </div>
                             <h3 className="text-lg font-bold text-slate-900 mb-2">{circular.title}</h3>
                             <div className="flex gap-2 mt-3">
                                 <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">{circular.regulator}</span>
                                 {circular.status === 'New' && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">New</span>}
                                 {circular.summary?.priority === Priority.HIGH && <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">High Priority</span>}
                             </div>
                        </div>
                    ))}
                 </div>
            </div>
        );

      case 'tasks':
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">Task Audit Trail</h2>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Task Title</th>
                                <th className="px-6 py-4 font-medium">Assigned To</th>
                                <th className="px-6 py-4 font-medium">Due Date</th>
                                <th className="px-6 py-4 font-medium">Priority</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tasks.map(task => (
                                <tr key={task.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{task.title}</td>
                                    <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                            {task.assignedTo.charAt(0)}
                                        </div>
                                        {task.assignedTo}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{new Date(task.dueDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            task.priority === Priority.HIGH ? 'bg-red-100 text-red-700' :
                                            task.priority === Priority.MEDIUM ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                         <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            task.status === TaskStatus.COMPLETED ? 'bg-slate-100 text-slate-600 line-through decoration-slate-400' : 'bg-blue-50 text-blue-700'
                                        }`}>
                                            {task.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );

      default:
        return <div>Section under construction</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="ml-64 flex-1 p-8 transition-all duration-300 ease-in-out">
        {/* Top Bar */}
        <div className="flex justify-end mb-6 gap-4">
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
        </div>

        {renderContent()}
      </main>

      {isUploadModalOpen && (
        <UploadIngest 
            onCancel={() => setIsUploadModalOpen(false)}
            onUploadComplete={handleUploadComplete}
        />
      )}
    </div>
  );
};

export default App;