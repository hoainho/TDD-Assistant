
import React, { useState, useRef, useEffect } from 'react';
import { BotMessageSquare, FileText, Rocket, MonitorPlay } from 'lucide-react';
import { AIPoweredRequirementAnalyzer } from './components/AIPoweredRequirementAnalyzer';
import { TDDGenerator } from './components/TDDGenerator';
import { MarkdownPreviewer } from './components/MarkdownPreviewer';
import { usePixiBackground } from './hooks/usePixiBackground';
import 
{ SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';

enum AppTab {
  MARKDOWN_PREVIEWER = 'MARKDOWN_PREVIEWER',
  ANALYZER = 'ANALYZER',
  GENERATOR = 'GENERATOR',
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.GENERATOR);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  usePixiBackground(canvasRef);

  const renderTabContent = () => {
    switch (activeTab) {
      case AppTab.MARKDOWN_PREVIEWER:
        return <MarkdownPreviewer />;
      case AppTab.ANALYZER:
        return <AIPoweredRequirementAnalyzer />;
      case AppTab.GENERATOR:
        return <TDDGenerator />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{
    tabId: AppTab;
    icon: React.ReactNode;
    label: string;
  }> = ({ tabId, icon, label }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-opacity-75 ${
        activeTab === tabId
          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.3)]'
          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="relative min-h-screen w-full bg-gray-900 text-white font-sans overflow-hidden">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />
      <SpeedInsights />
      <Analytics />
      <div className="relative z-10 flex flex-col items-center w-full min-h-screen p-4 sm:p-6 lg:p-8">
        <header className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center mb-6 backdrop-blur-sm bg-black/30 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3">
            <Rocket size={40} className="text-cyan-400" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">
              GearGames AI TDD Assistant
            </h1>
          </div>
          <nav className="flex flex-wrap justify-center gap-4 mt-4 sm:mt-0">
            <TabButton tabId={AppTab.MARKDOWN_PREVIEWER} icon={<MonitorPlay size={20} />} label="Markdown Previewer" />
            <TabButton tabId={AppTab.ANALYZER} icon={<BotMessageSquare size={20} />} label="Requirement Analyzer" />
            <TabButton tabId={AppTab.GENERATOR} icon={<FileText size={20} />} label="Auto TDD Generator" />
          </nav>
        </header>

        <main className="w-full max-w-7xl mx-auto flex-grow flex flex-col">
          {renderTabContent()}
        </main>
        
        <footer className="w-full max-w-7xl mx-auto mt-8 text-center text-xs text-gray-500">
            <p>Powered by Hoai-Nho. Designed for modern engineering workflows.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;