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

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);

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

  const handleShowTeam = async () => {
     setShowTeamModal(true);
     try {
        const users = await api.getUsers();
        setTeamMembers(users);
     } catch (error) {
        console.error("Failed to fetch team members", error);
     }
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
      <Sidebar user={user} onLogout={handleLogout} connected={connected} onShowTeam={handleShowTeam} />

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

      {showTeamModal && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
               <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
                     <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                     Project Team Members
                  </h2>
                  <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors p-1">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
               </div>
               <div className="p-6 max-h-[60vh] overflow-y-auto">
                   {teamMembers.length > 0 ? (
                      <div className="space-y-4">
                         {teamMembers.map((member: User) => (
                            <div key={member.id} className="flex items-center space-x-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-colors group">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-indigo-700 shrink-0 border border-slate-200 group-hover:bg-indigo-50">
                                   {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <div className="flex items-center space-x-2">
                                       <span className="text-base font-bold text-slate-900 leading-tight">{member.name}</span>
                                       {member.id === user?.id && <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-1.5 rounded">(You)</span>}
                                   </div>
                                   <p className="text-sm text-slate-500 truncate mt-0.5">{member.email}</p>
                                </div>
                                {['developer', 'qa', 'devops', 'manager'].some(r => String(member.role || '').toLowerCase().includes(r)) ? (
                                    <div className="flex flex-col gap-1.5 items-end">
                                      {['developer', 'qa', 'devops', 'manager'].filter(r => String(member.role || '').toLowerCase().includes(r)).map(r => (
                                        <span key={r} className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-md ${
                                            r === 'developer' ? 'bg-blue-100 text-blue-700' :
                                            r === 'qa' ? 'bg-purple-100 text-purple-700' :
                                            r === 'devops' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                           {r}
                                        </span>
                                      ))}
                                    </div>
                                ) : (
                                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-md bg-slate-100 text-slate-700">
                                       {String(member.role || 'No Role')}
                                    </span>
                                )}
                            </div>
                         ))}
                      </div>
                   ) : (
                      <div className="text-center py-8">
                         <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
                         </div>
                         <p className="text-slate-500 font-medium">Fetching team members...</p>
                      </div>
                   )}
               </div>
            </div>
         </div>
      )}

    </div>
  );
}
