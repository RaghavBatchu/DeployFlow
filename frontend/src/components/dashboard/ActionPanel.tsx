import React, { useState } from "react";

interface ActionPanelProps {
  emitAction: (action: string, data?: any) => void;
  userRole?: string;
  pipeline: any;
}

const ActionPanel: React.FC<ActionPanelProps> = ({
  emitAction,
  userRole,
  pipeline,
}) => {
  const getRoleActions = () => {
    const actions: {
      [key: string]: Array<{
        id: string;
        label: string;
        icon: React.ReactNode;
        variant: "primary" | "secondary" | "danger";
      }>;
    } = {
      developer: [
        {
          id: "start_build",
          label: "Run Workflow",
          icon: <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
          variant: "primary",
        },
        {
          id: "fix_build",
          label: "Re-run Failed",
          icon: <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
          variant: "secondary",
        },
      ],
      qa: [
        {
          id: "run_tests",
          label: "Execute Tests",
          icon: <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          variant: "primary",
        },
      ],
      devops: [
         {
          id: "deploy_production",
          label: "Deploy to Prod",
          icon: <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 11l7-7 7 7M5 19l7-7 7 7" /></svg>,
          variant: "primary",
        },
        {
          id: "rollback",
          label: "Rollback Version",
          icon: <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
          variant: "danger",
        },
      ]
    };
    
    const userRoleStr = String(userRole || "").toLowerCase();
    const allowedActions = new Map();
    Object.entries(actions).forEach(([role, roleActions]) => {
         if (userRoleStr.includes(role)) {
             roleActions.forEach(action => allowedActions.set(action.id, action));
         }
    });

    return Array.from(allowedActions.values());
  };

  const handleAction = (actionId: string) => {
    if (!emitAction) return;
    emitAction("pipeline_action", {
      action: actionId,
      message: `Action triggered via ops panel`,
      timestamp: new Date().toISOString(),
    });
  };

  const getPipelineStatus = () => {
    if (!pipeline) return "unknown";
    const statuses = [
      pipeline.build_status,
      pipeline.test_status,
      pipeline.deploy_status,
      pipeline.release_status,
    ];
    if (statuses.includes("failed")) return "failed";
    if (statuses.includes("in-progress")) return "in-progress";
    if (statuses.every((status) => status === "completed")) return "completed";
    return "locked";
  };

  const pipelineStatus = getPipelineStatus();
  const actions = getRoleActions();

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-6">
         <h3 className="text-lg font-bold text-slate-900 capitalize">Pipeline Controls</h3>
         <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase ${
             pipelineStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' :
             pipelineStatus === 'failed' ? 'bg-rose-100 text-rose-700' :
             pipelineStatus === 'in-progress' ? 'bg-blue-100 text-blue-700' :
             'bg-slate-100 text-slate-500'
         }`}>
             {pipelineStatus === 'in-progress' && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
             <span>{pipelineStatus}</span>
         </div>
      </div>

      {actions.length > 0 ? (
        <div className="space-y-4">
          {actions.map((action) => (
             <button
               key={action.id}
               onClick={() => handleAction(action.id)}
               className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl text-base font-bold transition-all shadow-sm transform hover:scale-[1.02]
                  ${action.variant === 'primary' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20' :
                    action.variant === 'danger' ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200' :
                    'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'}
               `}
             >
               {action.icon}
               <span>{action.label}</span>
             </button>
          ))}
        </div>
      ) : (
        <div className="text-center bg-slate-50 rounded-xl p-6 border border-slate-200 border-dashed">
          <p className="text-base font-medium text-slate-500">No actions available</p>
        </div>
      )}

      {/* Sync Buttons */}
      <div className="mt-6 flex gap-3 w-full">
         <button
            onClick={() => emitAction("refresh_pipeline")}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            <span>Sync Stats</span>
          </button>
          <button
            onClick={() => emitAction("get_logs")}
             className="flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span>View Logs</span>
          </button>
      </div>

    </div>
  );
};

export default ActionPanel;
