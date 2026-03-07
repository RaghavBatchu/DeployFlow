import React, { useEffect, useRef } from "react";

interface ActivityLogProps {
  logs: any[];
}

interface LogEntry {
  id: number;
  user_name: string;
  role: string;
  action: string;
  timestamp: string;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ logs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  const parseAction = (actionStr: string) => {
       if (actionStr.includes('stage')) {
           return actionStr.replace('stage', '').trim();
       }
       return actionStr;
  }

  return (
    <div className="flex flex-col w-full h-full pb-6">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <h3 className="text-lg font-bold text-slate-900 capitalize">Pipeline Events</h3>
        <button className="text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg">
          Live Feed
        </button>
      </div>

      {/* Vertical Timeline */}
      <div className="flex-1 overflow-y-auto relative pl-4 pr-2 group/timeline scrollbar-hide">
        <div className="absolute left-[35px] top-6 bottom-8 w-[2px] bg-slate-200 rounded-full group-hover/timeline:bg-slate-300 transition-colors z-0"></div>
        
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm font-medium text-slate-400">Waiting for pipeline events...</p>
          </div>
        ) : (
          <div className="space-y-8 relative z-10 pt-2 pb-6">
              {logs.map((log: LogEntry, index: number) => (
                <div
                  key={log.id || `${log.timestamp}-${index}`}
                  className="flex items-start animate-fadeIn relative"
                >
                  {/* Avatar Icon Node */}
                  <div className="mr-5 mt-0.5 w-11 h-11 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 shadow-sm z-10 overflow-hidden relative group/node">
                     <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${log.user_name}`} alt="avatar" className="opacity-100 w-full h-full object-cover"/>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                     <div className="flex items-center space-x-2 text-sm text-slate-600 leading-snug">
                        <span className="font-bold text-slate-900">{log.user_name}</span>
                        <span>
                            {log.action.includes('error') || log.action.includes('failed') ? (
                                <span className="text-rose-600 font-medium">Encountered an error: {parseAction(log.action)}</span>
                            ) : (
                                <span>Triggered <span className="font-semibold text-slate-800">{parseAction(log.action)}</span></span>
                            )}
                        </span>
                     </div>
                     <span className="block mt-1 text-xs font-semibold text-slate-400">
                         {formatTimestamp(log.timestamp)}
                     </span>
                  </div>
                </div>
              ))}
          </div>
        )}
        <div ref={logEndRef} className="h-4" />
      </div>
    </div>
  );
};

export default ActivityLog;
