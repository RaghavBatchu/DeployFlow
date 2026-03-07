import React, { useState } from "react";

interface PipelineVisualizerProps {
  pipeline: any;
  emitAction: (action: string, data?: any) => void;
  userRole?: string;
}

interface PipelineStage {
  id: string;
  name: string;
  status: "locked" | "in-progress" | "completed" | "failed";
  duration: string;
  user?: string;
}

const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  pipeline,
  emitAction,
  userRole,
}) => {

  const stages: PipelineStage[] = pipeline
    ? [
        {
          id: "build",
          name: "Source Compile",
          status: pipeline.build_status || "locked",
          duration: "1m 12s",
          user: pipeline.build_user,
        },
        {
          id: "test",
          name: "Test Suite",
          status: pipeline.test_status || "locked",
          duration: "3m 45s",
          user: pipeline.test_user,
        },
        {
          id: "deploy",
          name: "Deploy Staging",
          status: pipeline.deploy_status || "locked",
          duration: "45s",
          user: pipeline.deploy_user,
        },
        {
          id: "release",
          name: "Prod Release",
          status: pipeline.release_status || "locked",
          duration: "-",
          user: pipeline.release_user,
        },
      ]
    : [
        {
          id: "build",
          name: "Source Compile",
          status: "locked",
          duration: "-",
        },
        {
          id: "test",
          name: "Test Suite",
          status: "locked",
          duration: "-",
        },
        {
          id: "deploy",
          name: "Deploy Staging",
          status: "locked",
          duration: "-",
        },
        {
          id: "release",
          name: "Prod Release",
          status: "locked",
          duration: "-",
        },
      ];

  const canStartStage = (stageId: string) => {
    if (!userRole || !emitAction) return false;

    const rolePermissions: { [key: string]: string[] } = {
      developer: ["build"],
      qa: ["test"],
      devops: ["deploy", "release"],
      manager: ["build", "test", "deploy", "release"],
    };

    const stageIndex = stages.findIndex((s) => s.id === stageId);
    const currentStage = stages[stageIndex];

    if (currentStage.status !== "locked") return false;
    if (stageIndex > 0 && stages[stageIndex - 1].status !== "completed")
      return false;

    return rolePermissions[userRole]?.includes(stageId);
  };

  const handleStartStage = (stageId: string) => {
    if (!emitAction) return;
    emitAction("start_stage", { stage: stageId });
  };

  const getStatusNodeClasses = (status: string) => {
     switch(status) {
        case "completed": return "border-emerald-500 bg-emerald-50/20 shadow-md ring-1 ring-emerald-500/20";
        case "in-progress": return "border-blue-500 bg-blue-50/20 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50";
        case "failed": return "border-rose-500 bg-rose-50/20 shadow-md ring-1 ring-rose-500/20";
        default: return "border-slate-200 bg-white shadow-sm";
     }
  };

  const getTitleClasses = (status: string) => {
    switch(status) {
        case "completed": return "text-slate-900";
        case "in-progress": return "text-blue-800";
        case "failed": return "text-rose-800";
        default: return "text-slate-700";
     }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="text-emerald-500 text-lg font-black">✓</span>
        );
      case "in-progress":
        return (
          <svg className="w-6 h-6 text-blue-500 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case "failed":
        return (
          <svg className="w-6 h-6 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case "locked":
      default:
        return (
          <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
    }
  };

  const getLineStatus = (current: string, next: string) => {
      if (current === 'completed' && next === 'in-progress') return 'in-progress';
      if (current === 'completed' && next === 'completed') return 'completed';
      if (current === 'completed' && next === 'failed') return 'failed';
      return 'locked';
  };

  return (
    <div className="w-full flex items-center justify-center bg-transparent">
        
        {/* Main Graph Container */}
        <div className="relative w-full flex flex-col items-center">
            
            {/* Header / Project context for Pipeline */}
            <div className="absolute -top-32 left-8 flex items-center space-x-4">
               <div className="p-3 bg-indigo-100 rounded-xl border border-indigo-200 shadow-sm">
                  <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-slate-900 leading-tight">main-workflow.yml</h2>
                 <div className="flex items-center space-x-2 text-base text-slate-500 mt-1">
                    <span className="font-semibold text-slate-700">{pipeline?.project_name || "DeployFlow/core"}</span>
                    <span>•</span>
                    <span className="flex items-center"><svg className="w-4 h-4 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg> Push to main</span>
                 </div>
               </div>
            </div>
            
            <div className="flex justify-center items-center relative w-max mx-auto py-16">
               
               {/* Background connection lines */}
               <div className="absolute left-[12%] right-[12%] top-1/2 -translate-y-1/2 h-1.5 bg-slate-200 z-0 rounded-full"></div>
               
               {/* Nodes */}
               <div className="flex space-x-12 relative z-10 w-full justify-center">
                 {stages.map((stage, index) => {
                    
                    const isLast = index === stages.length - 1;
                    const nextStage = !isLast ? stages[index + 1] : null;
                    const lineStyle = nextStage ? getLineStatus(stage.status, nextStage.status) : 'locked';
                    
                    return (
                      // React fragment to append line
                      <React.Fragment key={stage.id}>
                          <div className="relative z-10 flex flex-col items-center group w-64">
                              
                              {/* The Node Card */}
                              <div className={`w-full rounded-2xl border-2 p-6 transition-all duration-300 relative bg-white
                                  ${getStatusNodeClasses(stage.status)}
                                  ${canStartStage(stage.id) ? "hover:-translate-y-2 hover:shadow-xl cursor-pointer" : ""}
                              `}
                              onClick={() => { if (canStartStage(stage.id)) handleStartStage(stage.id); }}>
                                  
                                  <div className="flex items-center justify-between mb-4">
                                     <div className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                                         JOB {index + 1}
                                     </div>
                                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 ${
                                         stage.status === 'in-progress' ? 'bg-blue-100 border-blue-200' : 
                                         stage.status === 'completed' ? 'bg-emerald-100 border-emerald-200' :
                                         stage.status === 'failed' ? 'bg-rose-100 border-rose-200' :
                                         'bg-slate-100 border-slate-200'
                                     }`}>
                                         {getStatusIcon(stage.status)}
                                     </div>
                                  </div>
                                  
                                  <h3 className={`font-bold text-[18px] mb-4 tracking-tight leading-tight ${getTitleClasses(stage.status)}`}>
                                      {stage.name}
                                  </h3>
                                  
                                  <div className="flex items-center justify-between text-sm">
                                     <div className={`font-semibold py-1 px-2.5 rounded-md flex items-center gap-1.5 -ml-2 ${
                                          stage.status === 'completed' ? 'text-emerald-700 bg-emerald-50' :
                                          stage.status === 'in-progress' ? 'text-blue-700 bg-blue-50' :
                                          stage.status === 'failed' ? 'text-rose-700 bg-rose-50' : 'text-slate-500 bg-slate-50'
                                     }`}>
                                        {stage.status === 'in-progress' && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>}
                                        {stage.status === 'locked' ? 'Pending' : stage.status === 'completed' ? 'Completed ✓' : stage.status.charAt(0).toUpperCase() + stage.status.slice(1)}
                                     </div>
                                     <span className="text-slate-500 font-medium font-mono">{stage.duration}</span>
                                  </div>

                                  {/* Start Overlay for Authorized Users */}
                                  {canStartStage(stage.id) && (
                                      <div className="absolute inset-x-0 bottom-0 translate-y-1/2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                         <button className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold tracking-widest uppercase rounded-full shadow-lg border-2 border-indigo-700 hover:bg-indigo-500 transform hover:scale-105 transition-all">
                                              RUN WORKFLOW
                                         </button>
                                      </div>
                                  )}
                              </div>

                              {/* Job Author */}
                              {stage.user && (
                                  <div className="absolute -bottom-12 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-800 text-slate-200 px-4 py-2 rounded-lg shadow-lg text-sm">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    <span className="font-semibold">{stage.user}</span>
                                  </div>
                              )}
                          </div>

                          {/* Connecting Line Foreground */}
                          {!isLast && (
                              <div className="w-12 h-1.5 relative z-0 mt-auto mb-auto bg-transparent shrink-0">
                                  <div className={`absolute -inset-x-6 top-0 bottom-0 transition-all duration-1000 ${
                                      lineStyle === 'completed' ? 'bg-emerald-400' :
                                      lineStyle === 'failed' ? 'bg-rose-400' :
                                      lineStyle === 'in-progress' ? 'bg-blue-400 animate-pulse' :
                                      'bg-transparent'
                                  }`}></div>
                              </div>
                          )}
                      </React.Fragment>
                    );
                 })}
               </div>
            </div>
        </div>
    </div>
  );
};

export default PipelineVisualizer;
