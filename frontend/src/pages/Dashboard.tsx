import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, api, User } from "../services/api";
import { useSocket } from "../contexts/SocketContext";
import Sidebar from "../components/dashboard/Sidebar.tsx";
import PipelineVisualizer from "../components/dashboard/PipelineVisualizer.tsx";
import ActivityLog from "../components/dashboard/ActivityLog.tsx";
import OnlinePlayers from "../components/dashboard/OnlinePlayers.tsx";
import ActionPanel from "../components/dashboard/ActionPanel.tsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const { socket, connected, onlineUsers, logs, pipeline, emitAction } =
    useSocket();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate("/auth");
      return;
    }

    const currentUser = auth.getUser();
    setUser(currentUser);

    const fetchInitialData = async () => {
      try {
        emitAction("refresh_pipeline");
        emitAction("get_logs");
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [navigate, emitAction]);

  const handleLogout = () => {
    auth.clearAuth();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden text-slate-800 font-sans">
      {/* 1. Left Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} connected={connected} />

      {/* 2 & 3. Main Center Area + Right Sidebar */}
      <div className="flex-1 flex overflow-hidden">
         
         <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <header className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-10 shrink-0">
               <div>
                 <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CI/CD Workflows</h1>
               </div>
               <div className="flex items-center space-x-6">
                 <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                 </button>
               </div>
            </header>

            {/* Central Pipeline Area - Centered both vertically and horizontally */}
            <div className="flex-1 overflow-y-auto relative flex flex-col justify-center items-center py-12 px-8">
              {/* Background grid */}
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
                   style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
              </div>

               <div className="w-full max-w-[1400px] relative z-10 flex flex-col items-center justify-center h-full">
                 <PipelineVisualizer 
                    pipeline={pipeline}
                    emitAction={emitAction}
                    userRole={user?.role}
                 />
               </div>
            </div>
         </div>

         {/* 3. Right Activity Panel */}
         <div className="w-96 border-l border-slate-200 bg-white flex flex-col shrink-0 h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.02)]">
            <div className="flex-1 overflow-y-auto flex flex-col py-6 space-y-6">
               <div className="px-6">
                  <ActionPanel pipeline={pipeline} emitAction={emitAction} userRole={user?.role} />
               </div>
               <div className="h-px bg-slate-100 mx-6"></div>
               <div className="px-6">
                  <OnlinePlayers users={onlineUsers} currentUser={user} />
               </div>
               <div className="h-px bg-slate-100 mx-6"></div>
               <div className="px-6 flex-1 flex flex-col">
                  <ActivityLog logs={logs} />
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
