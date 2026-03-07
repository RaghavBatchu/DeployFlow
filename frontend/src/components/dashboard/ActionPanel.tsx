import React from "react";
import { User } from "../../services/api";

interface ActionPanelProps {
  pipeline: any;
  currentUser: User | null;
}

const STAGE_ACTIONS: {
  action: string;
  role: string;
  assigneeIdKey: string;
  statusKey: string;
}[] = [
  {
    action: "build",
    role: "developer",
    assigneeIdKey: "developer_id",
    statusKey: "build_status",
  },
  {
    action: "test",
    role: "qa",
    assigneeIdKey: "qa_id",
    statusKey: "test_status",
  },
  {
    action: "deploy",
    role: "devops",
    assigneeIdKey: "devops_id",
    statusKey: "deploy_status",
  },
  {
    action: "release",
    role: "manager",
    assigneeIdKey: "manager_id",
    statusKey: "release_status",
  },
];

const ActionPanel: React.FC<ActionPanelProps> = ({
  pipeline,
  currentUser,
}) => {
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
        <div className="text-center bg-blue-50/50 rounded-xl p-6 border border-blue-100">
           <svg className="w-8 h-8 text-blue-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           <p className="text-sm font-medium text-blue-800">
             It's your turn! Please click <strong>"Review Action"</strong> on the active pipeline card to continue.
           </p>
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
