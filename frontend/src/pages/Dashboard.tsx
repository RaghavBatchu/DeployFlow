import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, api, User } from "../services/api";
import { useSocket } from "../contexts/SocketContext";
import { useToast } from "../contexts/ToastContext";
import Sidebar from "../components/dashboard/Sidebar.tsx";
import PipelineVisualizer from "../components/dashboard/PipelineVisualizer.tsx";
import ActivityLog from "../components/dashboard/ActivityLog.tsx";
import OnlinePlayers from "../components/dashboard/OnlinePlayers.tsx";
import ActionPanel from "../components/dashboard/ActionPanel.tsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const { connected, onlineUsers, logs, pipeline, emitAction } = useSocket();
  const { addToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingPipeline, setCreatingPipeline] = useState(false);

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);

  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [pipelineName, setPipelineName] = useState("");
  const [selectedQaId, setSelectedQaId] = useState<string>("");
  const [selectedDevopsId, setSelectedDevopsId] = useState<string>("");
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [selectedCoDeveloperId, setSelectedCoDeveloperId] = useState<string>("");

  const loadTeamMembers = async () => {
    try {
      const users = await api.getUsers();
      setTeamMembers(users);
    } catch (error) {
      console.error("Failed to fetch team members", error);
      addToast("Failed to load team members", "error");
    }
  };

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate("/auth");
      return;
    }

    const currentUser = auth.getUser();
    setUser(currentUser);

    const fetchInitialData = () => {
      emitAction("refresh_pipeline");
      emitAction("get_logs");
      setLoading(false);
    };

    fetchInitialData();
    loadTeamMembers();
  }, [navigate, emitAction]);

  const handleLogout = () => {
    auth.clearAuth();
    navigate("/auth");
  };

  const handleShowTeam = async () => {
    setShowTeamModal(true);
  };

  const handleStartNewPipeline = async () => {
    if (user?.role !== "developer" || creatingPipeline) return;
    setShowPipelineModal(true);
    if (!teamMembers.length) {
      await loadTeamMembers();
    }
  };

  const handleSubmitNewPipeline = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (user?.role !== "developer" || creatingPipeline) return;

    if (!selectedQaId || !selectedDevopsId || !selectedManagerId) {
      addToast("Please select QA, DevOps and Manager.", "error");
      return;
    }

    setCreatingPipeline(true);
    try {
      const newPipeline = await api.createPipeline({
        projectName: pipelineName.trim() || "DeployFlow",
        qaId: Number(selectedQaId),
        devopsId: Number(selectedDevopsId),
        managerId: Number(selectedManagerId),
        developerId: user.id,
        coDeveloperId: selectedCoDeveloperId ? Number(selectedCoDeveloperId) : undefined,
      });

      addToast("Pipeline created successfully");
      setShowPipelineModal(false);
      setPipelineName("");
      setSelectedQaId("");
      setSelectedDevopsId("");
      setSelectedManagerId("");
      setSelectedCoDeveloperId("");

      emitAction("refresh_pipeline", { pipelineId: newPipeline.id });
      emitAction("get_logs", { pipelineId: newPipeline.id });
    } catch (err: any) {
      addToast(err.message || "Failed to create pipeline", "error");
    } finally {
      setCreatingPipeline(false);
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
      <Sidebar 
        user={user} 
        onLogout={handleLogout} 
        connected={connected} 
        onShowTeam={handleShowTeam} 
        onSelectPipeline={(id: string | number) => {
          emitAction("refresh_pipeline", { pipelineId: id });
          emitAction("get_logs", { pipelineId: id });
        }}
        onShowHowItWorks={() => setShowHowItWorksModal(true)}
      />

      {/* 2 & 3. Main Center Area + Right Sidebar */}
      <div className="flex-1 flex overflow-hidden">
         
         <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <header className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-10 shrink-0">
               <div>
                 <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CI/CD Workflows</h1>
               </div>
               <div className="flex items-center space-x-4">
                 {user?.role === "developer" && (
                   <button
                     onClick={handleStartNewPipeline}
                     disabled={creatingPipeline}
                     className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl shadow-md transition-colors"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                     {creatingPipeline ? "Creating…" : "Start New Pipeline"}
                   </button>
                 )}
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
                    currentUser={user}
                    addToast={addToast}
                    emitAction={emitAction}
                 />
               </div>
            </div>
         </div>

         {/* 3. Right Activity Panel */}
         <div className="w-96 border-l border-slate-200 bg-white flex flex-col shrink-0 h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.02)]">
            <div className="flex-1 overflow-y-auto flex flex-col py-6 space-y-6">
               <div className="px-6">
                  <ActionPanel pipeline={pipeline} currentUser={user} />
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

      {showPipelineModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl border border-slate-200 overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <form onSubmit={handleSubmitNewPipeline}>

              {/* HEADER */}
              <div className="border-b border-slate-100 flex items-start justify-between" style={{ padding: '32px 40px 24px' }}>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    New Pipeline
                  </h2>
                  <p className="mt-2 text-base text-slate-500 leading-relaxed">
                    Define the pipeline name and assign owners for each stage.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPipelineModal(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors -mt-1 -mr-1"
                >
                  ✕
                </button>
              </div>

              {/* BODY */}
              <div className="max-h-[85vh] overflow-y-auto" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

                {/* Pipeline Details */}
                <section className="space-y-5">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                    Pipeline Details
                  </h3>

                  <div className="rounded-xl border border-slate-200 bg-slate-50" style={{ padding: '32px' }}>
                    <label className="block text-base font-medium text-slate-600 mb-3">
                      Pipeline name
                    </label>

                    <input
                      type="text"
                      value={pipelineName}
                      onChange={(e) => setPipelineName(e.target.value)}
                      placeholder="example: main-workflow.yml"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                </section>

                {/* Role Assignments */}
                <section className="space-y-5">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                    Role Assignments
                  </h3>

                  <div className="rounded-xl border border-slate-200 bg-slate-50" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {/* QA */}
                      <div>
                        <label className="block text-base font-medium text-slate-600 mb-3">
                          QA Engineer
                        </label>

                        <select
                          value={selectedQaId}
                          onChange={(e) => setSelectedQaId(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                          required
                        >
                    <option value="">Select QA</option>

                    {teamMembers
                      .filter((member) =>
                        Array.isArray(member.roles) && member.roles.length
                          ? member.roles.some((r) => r.toLowerCase() === "qa")
                          : member.role === "qa"
                      )
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                        </select>
                      </div>

                      {/* DevOps */}
                      <div>
                        <label className="block text-base font-medium text-slate-600 mb-3">
                          DevOps Engineer
                        </label>

                        <select
                          value={selectedDevopsId}
                          onChange={(e) => setSelectedDevopsId(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                          required
                        >
                    <option value="">Select DevOps</option>

                    {teamMembers
                      .filter((member) =>
                        Array.isArray(member.roles) && member.roles.length
                          ? member.roles.some((r) => r.toLowerCase() === "devops")
                          : member.role === "devops"
                      )
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                        </select>
                      </div>

                      {/* Manager */}
                      <div>
                        <label className="block text-base font-medium text-slate-600 mb-3">
                          Manager
                        </label>

                        <select
                          value={selectedManagerId}
                          onChange={(e) => setSelectedManagerId(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                          required
                        >
                    <option value="">Select Manager</option>

                    {teamMembers
                      .filter((member) =>
                        Array.isArray(member.roles) && member.roles.length
                          ? member.roles.some((r) => r.toLowerCase() === "manager")
                          : member.role === "manager"
                      )
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                        </select>
                      </div>

                    </div>

                    {/* Additional Dev */}
                    <div>
                      <label className="block text-base font-medium text-slate-600 mb-3">
                        Additional Developer
                        <span className="text-slate-400 ml-1 font-normal">(optional)</span>
                      </label>

                      <select
                        value={selectedCoDeveloperId}
                        onChange={(e) => setSelectedCoDeveloperId(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                      >
                  <option value="">None</option>

                  {teamMembers
                    .filter((member) =>
                      Array.isArray(member.roles) && member.roles.length
                        ? member.roles.some((r) => r.toLowerCase() === "developer")
                        : member.role === "developer"
                    )
                    .filter((member) => member.id !== user?.id)
                    .map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                      </select>
                    </div>
                  </div>
                </section>
              </div>

              {/* FOOTER */}
              <div className="border-t border-slate-100 flex justify-between items-center gap-3 bg-slate-50/70" style={{ padding: '28px 40px' }}>
                <button
                  type="button"
                  onClick={() => setShowPipelineModal(false)}
                  className="px-6 py-3 text-base font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-white hover:border-slate-400 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingPipeline}
                  className="px-8 py-3 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-200 disabled:opacity-60 transition-colors"
                >
                  {creatingPipeline ? "Creating..." : "Create Pipeline"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

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
                                {(() => {
                                  const rolesToShow = Array.isArray(member.roles) && member.roles.length
                                    ? member.roles
                                    : (member.role ? [member.role] : []);
                                  const pipelineRoles = ['developer', 'qa', 'devops', 'manager'];
                                  const hasRoles = rolesToShow.some((r: string) => pipelineRoles.includes(String(r).toLowerCase()));
                                  return hasRoles ? (
                                    <div className="flex flex-col gap-1.5 items-end flex-wrap">
                                      {rolesToShow.filter((r: string) => pipelineRoles.includes(String(r).toLowerCase())).map((r: string) => (
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
                                  );
                                })()}
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

      {showHowItWorksModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
                <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                How It Works: CI/CD Pipeline
              </h2>
              <button onClick={() => setShowHowItWorksModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 text-slate-600">
              
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-2">The CI/CD Pipeline Process</h3>
                <p className="mb-3 text-sm leading-relaxed">
                  The DeployFlow application simulates a real-world Continuous Integration and Continuous Deployment (CI/CD) pipeline. When a developer creates a new pipeline, they assign various team members to specific roles for that project.
                </p>
                <p className="text-sm leading-relaxed">
                  The pipeline progresses through multiple stages (e.g., Code Setup, Build, Test, Deploy). As the pipeline reaches each stage, the system waits for the assigned user (Role) to approve or trigger the necessary action. Real-time WebSockets ensure that all team members are updated instantly about the pipeline's progress and any activity logs.
                </p>
              </section>

              <hr className="border-slate-100" />

              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Function of Each Role</h3>
                <div className="space-y-4">
                  <div className="flex bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 shrink-0 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold mr-4">DEV</div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Developer</h4>
                      <p className="text-sm">Developers are responsible for initiating pipelines, writing code, and triggering the build process. They can view the complete history of pipelines and manage the initial stages of the CI/CD process.</p>
                    </div>
                  </div>

                  <div className="flex bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 shrink-0 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center font-bold mr-4">QA</div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">QA Engineer (Quality Assurance)</h4>
                      <p className="text-sm">QA Engineers step in during the testing stage. Their role is to review and test the application, and they have the authority to approve or reject the pipeline based on the test results before it reaches deployment.</p>
                    </div>
                  </div>

                  <div className="flex bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 shrink-0 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold mr-4">OPS</div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">DevOps Engineer</h4>
                      <p className="text-sm">DevOps Engineers manage the deployment infrastructure. Once the code passes testing, they are responsible for deploying the application to staging or production environments.</p>
                    </div>
                  </div>

                  <div className="flex bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 shrink-0 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center font-bold mr-4">MGR</div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Manager</h4>
                      <p className="text-sm">Managers oversee the entire workflow. They monitor overall progress and provide final approvals for critical deployment stages, ensuring all business and security requirements are met.</p>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
