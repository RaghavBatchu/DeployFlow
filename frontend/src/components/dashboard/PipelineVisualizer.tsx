import React from "react";
import { api, User } from "../../services/api";

interface PipelineVisualizerProps {
  pipeline: any;
  currentUser: User | null;
  addToast?: (message: string, type?: "success" | "error" | "info") => void;
  emitAction?: (action: string, data?: any) => void;
}

interface PipelineStage {
  id: string;
  name: string;
  status: "locked" | "pending" | "completed";
  displayStatus: "locked" | "in-progress" | "completed";
  roleLabel: string;
  assignedName: string | null;
  assigneeId: number | null;
}

const STAGES: { id: string; name: string; statusKey: string; userKey: string; assigneeIdKey: string; roleLabel: string }[] = [
  { id: "build", name: "Source Compile", statusKey: "build_status", userKey: "developer_name", assigneeIdKey: "developer_id", roleLabel: "Developer" },
  { id: "test", name: "Test Suite", statusKey: "test_status", userKey: "qa_name", assigneeIdKey: "qa_id", roleLabel: "QA" },
  { id: "deploy", name: "Deploy Staging", statusKey: "deploy_status", userKey: "devops_name", assigneeIdKey: "devops_id", roleLabel: "DevOps" },
  { id: "release", name: "Prod Release", statusKey: "release_status", userKey: "manager_name", assigneeIdKey: "manager_id", roleLabel: "Manager" },
];

const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  pipeline,
  currentUser,
  addToast,
  emitAction,
}) => {
  const [reviewStageId, setReviewStageId] = React.useState<string | null>(null);
  const [comment, setComment] = React.useState("");
  const [loadingAction, setLoadingAction] = React.useState(false);

  const stages: PipelineStage[] = pipeline
    ? STAGES.map((s) => {
        const status = (pipeline[s.statusKey] as string) || "locked";
        const displayStatus =
          status === "pending" ? "in-progress" : status === "completed" ? "completed" : "locked";
        return {
          id: s.id,
          name: s.name,
          status: status as "locked" | "pending" | "completed",
          displayStatus,
          roleLabel: s.roleLabel,
          assignedName: pipeline[s.userKey] ?? null,
          assigneeId: pipeline[s.assigneeIdKey] ?? null,
        };
      })
    : STAGES.map((s) => ({
        id: s.id,
        name: s.name,
        status: "locked" as const,
        displayStatus: "locked" as const,
        roleLabel: s.roleLabel,
        assignedName: null as string | null,
        assigneeId: null as number | null,
      }));

  const handleAction = async (decision: "approve" | "reject") => {
    if (!pipeline?.id || !currentUser || !reviewStageId) return;
    if (!comment.trim()) {
       addToast?.("Comment is required.", "error");
       return;
    }
    setLoadingAction(true);
    try {
      const result = await api.pipelineAction(pipeline.id, reviewStageId, decision, comment);
      if (result.toastMessage) addToast?.(result.toastMessage, decision === "reject" ? "info" : "success");
      emitAction?.("refresh_pipeline", { pipelineId: pipeline.id });
      emitAction?.("get_logs", { pipelineId: pipeline.id });
      setReviewStageId(null);
      setComment("");
    } catch (err: any) {
      addToast?.(err.message || "Action failed", "error");
    } finally {
      setLoadingAction(false);
    }
  };

  const getStatusNodeClasses = (displayStatus: string) => {
    switch (displayStatus) {
      case "completed":
        return "border-emerald-500 bg-emerald-50/20 shadow-md ring-1 ring-emerald-500/20";
      case "in-progress":
        return "border-blue-500 bg-blue-50/20 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50";
      default:
        return "border-slate-200 bg-white shadow-sm";
    }
  };

  const getTitleClasses = (displayStatus: string) => {
    switch (displayStatus) {
      case "completed":
        return "text-slate-900";
      case "in-progress":
        return "text-blue-800";
      default:
        return "text-slate-700";
    }
  };

  const getStatusIcon = (displayStatus: string) => {
    switch (displayStatus) {
      case "completed":
        return <span className="text-emerald-500 text-lg font-black">✓</span>;
      case "in-progress":
        return (
          <svg
            className="w-6 h-6 text-blue-500 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        );
      case "locked":
      default:
        return (
          <svg
            className="w-5 h-5 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        );
    }
  };

  const getLineStatus = (current: string, next: string) => {
    if (current === "completed" && next === "in-progress") return "in-progress";
    if (current === "completed" && next === "completed") return "completed";
    return "locked";
  };

  return (
    <div className="w-full flex items-center justify-center bg-transparent">
      <div className="relative w-full flex flex-col items-center">
        <div className="absolute -top-32 left-8 flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 rounded-xl border border-indigo-200 shadow-sm">
            <svg
              className="w-6 h-6 text-indigo-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              {pipeline?.name || "main-workflow"}
            </h2>
            <div className="flex items-center space-x-2 text-base text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">
                {pipeline?.project_name || "DeployFlow/core"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center relative w-max mx-auto py-16">
          <div className="absolute left-[12%] right-[12%] top-1/2 -translate-y-1/2 h-1.5 bg-slate-200 z-0 rounded-full"></div>

          <div className="flex items-stretch relative z-10 w-full justify-center">
            {stages.map((stage, index) => {
              const isLast = index === stages.length - 1;
              const nextStage = !isLast ? stages[index + 1] : null;
              const lineStyle = nextStage
                ? getLineStatus(stage.displayStatus, nextStage.displayStatus)
                : "locked";

              return (
                <React.Fragment key={stage.id}>
                  <div className="relative z-10 flex flex-col group w-64 shrink-0">
                    <div
                      className={`w-full h-full flex flex-col rounded-2xl border-2 p-6 transition-all duration-300 relative bg-white ${getStatusNodeClasses(stage.displayStatus)}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                          JOB {index + 1}
                        </div>
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 ${
                            stage.displayStatus === "in-progress"
                              ? "bg-blue-100 border-blue-200"
                              : stage.displayStatus === "completed"
                                ? "bg-emerald-100 border-emerald-200"
                                : "bg-slate-100 border-slate-200"
                          }`}
                        >
                          {getStatusIcon(stage.displayStatus)}
                        </div>
                      </div>

                      <h3
                        className={`font-bold text-[18px] mb-2 tracking-tight leading-tight ${getTitleClasses(stage.displayStatus)}`}
                      >
                        {stage.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                        {stage.roleLabel}
                      </p>

                      <div className="flex items-center justify-between text-sm">
                        <div
                          className={`font-semibold py-1 px-2.5 rounded-md flex items-center gap-1.5 -ml-2 ${
                            stage.displayStatus === "completed"
                              ? "text-emerald-700 bg-emerald-50"
                              : stage.displayStatus === "in-progress"
                                ? "text-blue-700 bg-blue-50"
                                : "text-slate-500 bg-slate-50"
                          }`}
                        >
                          {stage.displayStatus === "in-progress" && (
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                          )}
                          {stage.displayStatus === "locked"
                            ? "Pending"
                            : stage.displayStatus === "completed"
                              ? "Completed ✓"
                              : "Running"}
                        </div>
                      </div>

                      {stage.assignedName && (
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-slate-600">
                          <svg
                            className="w-4 h-4 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span className="text-sm font-medium">
                            {stage.assignedName}
                            {currentUser?.name === stage.assignedName && (
                              <span className="text-indigo-600 ml-1">(You)</span>
                            )}
                          </span>
                        </div>
                      )}

                      {currentUser && stage.assigneeId === currentUser.id && stage.displayStatus === "in-progress" && (
                        <div className="mt-4 pt-4 border-t border-blue-100 flex flex-col">
                           <button
                             onClick={() => setReviewStageId(stage.id)}
                             className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                           >
                              Review Action
                           </button>
                        </div>
                      )}
                      
                      {/* Invisible spacer if assignedName is absent but we want to maintain geometry if needed, though flex-col h-full handles it */}
                      {!stage.assignedName && (
                         <div className="mt-auto"></div>
                      )}
                    </div>
                  </div>

                  {!isLast && (
                    <div className="w-12 flex items-center justify-center shrink-0 relative z-0">
                      <div
                        className={`w-full h-1.5 transition-all duration-1000 ${
                          lineStyle === "completed"
                            ? "bg-emerald-500"
                            : lineStyle === "in-progress"
                              ? "bg-blue-500 animate-pulse"
                              : "bg-transparent"
                        }`}
                      ></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {reviewStageId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden text-slate-800">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Review Pipeline Action</h2>
              <button
                onClick={() => { setReviewStageId(null); setComment(""); }}
                className="w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Comment (Required)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Explain why you are approving or rejecting this code..."
                className="w-full h-32 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              ></textarea>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center space-x-4">
              {reviewStageId !== "build" && (
                <button
                  onClick={() => handleAction("reject")}
                  disabled={loadingAction || !comment.trim()}
                  className="px-6 py-2.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg text-sm font-bold disabled:opacity-50"
                >
                  {loadingAction ? "Processing..." : "Reject & Send Back"}
                </button>
              )}
              {reviewStageId === "build" && <div></div>}
              <button
                onClick={() => handleAction("approve")}
                disabled={loadingAction || !comment.trim()}
                className="px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-bold shadow disabled:opacity-50"
              >
                {loadingAction ? "Processing..." : "Approve & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineVisualizer;
