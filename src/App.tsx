import React, { useEffect } from 'react';
import {
  Home,
  Briefcase,
  Library,
  Settings,
  Bell,
  Plus,
  ArrowLeft,
  Share2,
  Layers,
  Layout,
  Image as ImageIcon,
  Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { WhiteLabelModule } from './components/modules/WhiteLabelModule';
import { ModelAgentModule } from './components/modules/ModelAgentModule';
import { ScenarioEngineModule } from './components/modules/ScenarioEngineModule';
import { TextureMasterModule } from './components/modules/TextureMasterModule';

// --- Types ---
type View = 'dashboard' | 'white-label' | 'model-agent' | 'scenario' | 'texture';

interface ActivityItem {
  id: string;
  title: string;
  time: string;
  module: string;
  icon: React.ReactNode;
  color: string;
}

// --- BottomNav ---
const BottomNav = ({
  currentView,
  setView,
}: {
  currentView: View;
  setView: (v: View) => void;
}) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-3 flex justify-between items-center z-50">
    <button
      onClick={() => setView('dashboard')}
      className={`flex flex-col items-center gap-1 ${
        currentView === 'dashboard' ? 'text-orange-600' : 'text-slate-400'
      }`}
    >
      <Home size={24} />
      <span className="text-[10px] font-medium">Home</span>
    </button>
    <button className="flex flex-col items-center gap-1 text-slate-400">
      <Briefcase size={24} />
      <span className="text-[10px] font-medium">Projects</span>
    </button>
    <div className="relative -top-6">
      <button className="w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-600/30 border-4 border-white">
        <Plus size={28} />
      </button>
    </div>
    <button className="flex flex-col items-center gap-1 text-slate-400">
      <Library size={24} />
      <span className="text-[10px] font-medium">Library</span>
    </button>
    <button className="flex flex-col items-center gap-1 text-slate-400">
      <Settings size={24} />
      <span className="text-[10px] font-medium">Settings</span>
    </button>
  </nav>
);

// --- Dashboard ---
const Dashboard = ({ onModuleClick }: { onModuleClick: (v: View) => void }) => {
  const activities: ActivityItem[] = [
    {
      id: '1',
      title: 'New model generated for "Summer Dr...',
      time: '14 mins ago',
      module: 'Scenario Engine',
      icon: <Layout size={16} />,
      color: 'bg-slate-800',
    },
    {
      id: '2',
      title: 'Texture optimized: Leather_Fine_02',
      time: '2 hours ago',
      module: 'Texture Master',
      icon: <ImageIcon size={16} />,
      color: 'bg-lime-200',
    },
    {
      id: '3',
      title: 'Global Agent: "Western-Style" deploy...',
      time: 'Yesterday',
      module: 'Model Agent',
      icon: <Globe size={16} />,
      color: 'bg-emerald-600',
    },
  ];

  return (
    <div className="pb-24">
      <header className="px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-xl italic">
            V
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            VibeLaunch <span className="text-blue-600">AI</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-400 relative" type="button">
            <Bell size={24} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100">
            <img
              src="https://picsum.photos/seed/user/100/100"
              alt="Avatar"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      <div className="px-6 grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
          <p className="text-slate-500 text-sm mb-1">Total Assets</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">1,284</span>
            <span className="text-emerald-500 text-xs font-bold">+12%</span>
          </div>
        </div>
        <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
          <p className="text-slate-500 text-sm mb-1">Recent Projects</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">24</span>
            <span className="text-blue-600 text-xs font-bold">Active</span>
          </div>
        </div>
      </div>

      <div className="px-6 mb-8">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          Workbench Modules
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onModuleClick('white-label')}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left group hover:border-orange-200 transition-colors"
            type="button"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
              <Layers size={24} />
            </div>
            <h3 className="font-bold text-slate-900">White-Label</h3>
            <p className="text-xs text-slate-400">Hub</p>
          </button>
          <button
            onClick={() => onModuleClick('model-agent')}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left group hover:border-orange-200 transition-colors"
            type="button"
          >
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
              <Globe size={24} />
            </div>
            <h3 className="font-bold text-slate-900">Model Agent</h3>
            <p className="text-xs text-slate-400">Global</p>
          </button>
          <button
            onClick={() => onModuleClick('scenario')}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left group hover:border-orange-200 transition-colors"
            type="button"
          >
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
              <Layout size={24} />
            </div>
            <h3 className="font-bold text-slate-900">Scenario</h3>
            <p className="text-xs text-slate-400">Engine</p>
          </button>
          <button
            onClick={() => onModuleClick('texture')}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left group hover:border-orange-200 transition-colors"
            type="button"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
              <ImageIcon size={24} />
            </div>
            <h3 className="font-bold text-slate-900">Texture</h3>
            <p className="text-xs text-slate-400">Master</p>
          </button>
        </div>
      </div>

      <div className="px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Recent Activity
          </h2>
          <button className="text-blue-600 text-xs font-bold" type="button">
            View All
          </button>
        </div>
        <div className="bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden">
          {activities.map((item, idx) => (
            <div
              key={item.id}
              className={`p-4 flex items-center gap-4 ${
                idx !== activities.length - 1 ? 'border-bottom border-slate-100' : ''
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-white`}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-slate-900 truncate">
                  {item.title}
                </h4>
                <p className="text-[10px] text-slate-400">
                  {item.time} • {item.module}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- App Content (uses useAppState for reset on view change) ---
function AppContent() {
  const [view, setView] = React.useState<View>('dashboard');
  const { reset } = useAppState();

  useEffect(() => {
    if (view !== 'dashboard') {
      reset();
    }
  }, [view, reset]);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen font-sans selection:bg-orange-100 selection:text-orange-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {view === 'dashboard' && <Dashboard onModuleClick={setView} />}
          {view === 'scenario' && (
            <ScenarioEngineModule onBack={() => setView('dashboard')} />
          )}
          {view === 'model-agent' && (
            <ModelAgentModule onBack={() => setView('dashboard')} />
          )}
          {view === 'white-label' && (
            <WhiteLabelModule onBack={() => setView('dashboard')} />
          )}
          {view === 'texture' && (
            <TextureMasterModule onBack={() => setView('dashboard')} />
          )}
        </motion.div>
      </AnimatePresence>
      <BottomNav currentView={view} setView={setView} />
    </div>
  );
}

// --- Main App ---
export default function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}
