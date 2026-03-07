import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, api } from "../../services/api";

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
  connected: boolean;
  onShowTeam?: () => void;
  onSelectPipeline?: (id: number) => void;
  onShowHowItWorks?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, connected, onShowTeam, onSelectPipeline, onShowHowItWorks }) => {
  const [showPipelines, setShowPipelines] = useState(false);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loadingPipelines, setLoadingPipelines] = useState(false);

  const handleTogglePipelines = async () => {
    if (!showPipelines) {
      setLoadingPipelines(true);
      try {
        const data = await api.getPipelines();
        setPipelines(data);
      } catch (err) {
        console.error("Failed to load pipelines", err);
      } finally {
        setLoadingPipelines(false);
      }
    }
    setShowPipelines(!showPipelines);
  };

  return (
    <div className="w-[240px] bg-[#10101a] flex flex-col h-full shrink-0 text-white font-sans border-r border-[#1e1e2d]">
      
      {/* Logo Area */}
      <Link
        to="/"
        className="px-4 py-5 flex items-center space-x-3.5 mb-6 hover:bg-[#151522] transition-colors cursor-pointer"
      >
        <div className="w-8 h-8 rounded shrink-0 bg-[#9333ea] flex items-center justify-center shadow-lg shadow-[#9333ea]/30">
          <svg
            className="w-5 h-5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 12 12 17 22 12"></polyline>
            <polyline points="2 17 12 22 22 17"></polyline>
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          DeployFlow
        </span>
      </Link>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col space-y-2 px-1">
        <div>
          <button
            onClick={handleTogglePipelines}
            className="w-full flex items-center px-4 py-3 border-l-4 border-transparent hover:bg-[#151522] rounded-r-md transition-colors"
          >
            <svg
              className="w-5 h-5 mr-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-[15px] font-medium text-left flex-1">Pipeline History</span>
            <svg className={`w-4 h-4 text-white transition-transform ${showPipelines ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {showPipelines && (
            <div className="flex flex-col mt-1 bg-[#151522] rounded-lg mx-2 p-2 max-h-[30vh] overflow-y-auto">
              {loadingPipelines ? (
                <div className="text-xs text-[#9ca3af] p-2 text-center flex justify-center"><div className="w-4 h-4 border-2 border-[#9ca3af] border-t-transparent rounded-full animate-spin"></div></div>
              ) : pipelines.length > 0 ? (
                pipelines.map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => onSelectPipeline && onSelectPipeline(p.id)}
                    className="text-left text-sm text-[#d1d5db] hover:text-white hover:bg-[#1d1d2b] rounded py-2 px-3 transition-colors flex flex-col mb-1 last:mb-0"
                  >
                     <span className="font-semibold truncate w-full">{p.project_name || "main-workflow.yml"}</span>
                     <span className="text-[10px] text-[#9ca3af] mt-0.5">Pipeline #{p.id}</span>
                  </button>
                ))
              ) : (
                <div className="text-xs text-[#9ca3af] p-2 text-center">No history available</div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => onShowTeam && onShowTeam()}
          className="w-full flex items-center px-4 py-3 border-l-4 border-transparent hover:bg-[#151522] rounded-r-md transition-colors"
        >
          <svg
            className="w-5 h-5 mr-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-[15px] font-medium text-white text-left flex-1">Team</span>
        </button>

        <button
          onClick={() => onShowHowItWorks && onShowHowItWorks()}
          className="w-full flex items-center px-4 py-3 border-l-4 border-transparent hover:bg-[#151522] rounded-r-md transition-colors"
        >
          <svg className="w-5 h-5 mr-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[15px] font-medium text-white text-left flex-1">How it works</span>
        </button>
      </nav>

      {/* Bottom Area */}
      <div className="flex flex-col pb-1">
        
        <div className="flex items-center px-3 py-2.5 bg-[#1d1d2b] border border-[#2a2a3a] rounded-lg mx-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#9333ea] flex items-center justify-center text-base font-bold shadow-sm shrink-0 uppercase text-white">
            {user?.name?.charAt(0) || "R"}
          </div>

          <div className="flex flex-col ml-3 overflow-hidden">
            <span className="text-[15px] font-bold truncate leading-tight">
              {user?.name || "Raghavendra Batchu"}
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {['developer', 'qa', 'devops', 'manager'].filter(r => String(user?.role || 'developer').toLowerCase().includes(r)).map(r => (
                <span key={r} className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[#2a2a3a] uppercase tracking-widest font-bold text-[#9ca3af]">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-2.5">
          <span className="text-[13px] font-medium text-[#9ca3af]">
            Engine Status
          </span>

          <div className="flex items-center space-x-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                connected ? "bg-[#10b981]" : "bg-red-500"
              }`}
            ></span>

            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                connected ? "text-[#10b981]" : "text-red-500"
              }`}
            >
              {connected ? "CONNECTED" : "OFFLINE"}
            </span>
          </div>
        </div>

        <div className="h-px bg-[#1e1e2d] w-full my-1"></div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center py-3 hover:bg-[#151522] transition-colors text-[15px] font-semibold group"
        >
          <svg
            className="w-5 h-5 mr-2 opacity-80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="opacity-90">Sign Out</span>
        </button>

      </div>
    </div>
  );
};

export default Sidebar;