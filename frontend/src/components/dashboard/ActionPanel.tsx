import React, { useState } from "react";
import { User } from "../../services/api";
import { api } from "../../services/api";

interface ActionPanelProps {
  pipeline: any;
  currentUser: User | null;
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  emitAction: (action: string, data?: any) => void;
}

const STAGE_ACTIONS: {
  action: string;
  role: string;
  assigneeIdKey: string;
  statusKey: string;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    action: "build",
    role: "developer",
    assigneeIdKey: "developer_id",
    statusKey: "build_status",
    label: "Complete Build",
    icon: (
      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    action: "test",
    role: "qa",
    assigneeIdKey: "qa_id",
    statusKey: "test_status",
    label: "Run Tests",
    icon: (
      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    action: "deploy",
    role: "devops",
    assigneeIdKey: "devops_id",
    statusKey: "deploy_status",
    label: "Deploy to Staging",
    icon: (
      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
      </svg>
    ),
  },
  {
    action: "release",
    role: "manager",
    assigneeIdKey: "manager_id",
    statusKey: "release_status",
    label: "Approve Release",
    icon: (
      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

const ActionPanel: React.FC<ActionPanelProps> = ({
  pipeline,
  currentUser,
  addToast,
  emitAction,
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const isAssignedAndPending = (item: (typeof STAGE_ACTIONS)[0]) => {
    if (!pipeline || !currentUser) return false;
    const assigneeId = pipeline[item.assigneeIdKey];
    if (assigneeId !== currentUser.id) return false;
    if (pipeline[item.statusKey] === "completed") return false;
    if (item.action === "build") return pipeline.build_status === "pending";
    if (item.action === "test") return pipeline.test_status === "pending" && pipeline.build_status === "completed";
    if (item.action === "deploy") return pipeline.deploy_status === "pending" && pipeline.test_status === "completed";
    if (item.action === "release") return pipeline.release_status === "pending" && pipeline.deploy_status === "completed";
    return false;
  };

  const handleAction = async (actionId: string) => {
    if (!pipeline?.id || !currentUser) return;
    setLoadingAction(actionId);
    try {
      const result = await api.pipelineAction(pipeline.id, actionId);
      if (result.toastMessage) addToast(result.toastMessage);
      emitAction("refresh_pipeline", { pipelineId: pipeline.id });
      emitAction("get_logs", { pipelineId: pipeline.id });
    } catch (err: any) {
      addToast(err.message || "Action failed", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const pipelineStatus = () => {
    if (!pipeline) return "unknown";
    const statuses = [
      pipeline.build_status,
      pipeline.test_status,
      pipeline.deploy_status,
      pipeline.release_status,
    ];
    if (statuses.every((s) => s === "completed")) return "completed";
    if (statuses.includes("pending")) return "in-progress";
    return "pending";
  };

  const status = pipelineStatus();
  const visibleActions = STAGE_ACTIONS.filter(isAssignedAndPending);

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 capitalize">Pipeline Controls</h3>
        <div
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase ${
            status === "completed"
              ? "bg-emerald-100 text-emerald-700"
              : status === "in-progress"
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-500"
          }`}
        >
          {status === "in-progress" && (
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          )}
          <span>{status}</span>
        </div>
      </div>

      {visibleActions.length > 0 ? (
        <div className="space-y-4">
          {visibleActions.map((action) => (
            <button
              key={action.action}
              onClick={() => handleAction(action.action)}
              disabled={loadingAction !== null}
              className="w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl text-base font-bold transition-all bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-70"
            >
              {action.icon}
              <span>{loadingAction === action.action ? "Processing…" : action.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center bg-slate-50 rounded-xl p-6 border border-slate-200 border-dashed">
          <p className="text-base font-medium text-slate-500">
            {pipeline
              ? "No action available for you on this stage. Wait for your turn or for the pipeline to progress."
              : "Start a pipeline to see actions."}
          </p>
        </div>
      )}

    </div>
  );
};

export default ActionPanel;
