import React from 'react';
import { User } from '../../services/api';

interface OnlinePlayersProps {
  users: any[];
  currentUser: User | null;
}

const OnlinePlayers: React.FC<OnlinePlayersProps> = ({ users, currentUser }) => {

  const getRoleBadge = (role: string) => {
     switch(role) {
        case 'developer': return "bg-blue-100 text-blue-700";
        case 'qa': return "bg-purple-100 text-purple-700";
        case 'devops': return "bg-emerald-100 text-emerald-700";
        case 'manager': return "bg-amber-100 text-amber-700";
        default: return "bg-slate-100 text-slate-600";
     }
  };

  return (
    <div className="flex flex-col w-full">
       <div className="flex items-center justify-between mb-6">
         <h3 className="text-lg font-bold text-slate-900 capitalize">Team Online</h3>
         <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {users?.length || 0} Active
         </span>
       </div>

       <div className="space-y-3">
         {!users || users.length === 0 ? (
            <p className="text-sm font-medium text-slate-500 text-center py-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed">No team members online</p>
         ) : (
            users.map((user, index) => (
                <div key={user.id || index} className="flex items-center justify-between group p-3 hover:bg-slate-50 rounded-xl transition-colors -mx-3">
                   <div className="flex items-center space-x-4">
                      <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-sm font-bold text-slate-600 shadow-sm relative z-10 overflow-hidden">
                              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt="avatar" />
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white z-20"></div>
                      </div>
                      <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                              <span className="text-base font-semibold text-slate-900 leading-tight">{user.name}</span>
                              {user.id === currentUser?.id && <span className="text-[11px] font-bold text-slate-500 uppercase">(You)</span>}
                          </div>
                          {['developer', 'qa', 'devops', 'manager'].some(r => String(user.role || '').toLowerCase().includes(r)) ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {['developer', 'qa', 'devops', 'manager'].filter(r => String(user.role || '').toLowerCase().includes(r)).map(r => (
                                  <span key={r} className={`text-[9px] uppercase tracking-wider font-bold rounded px-1.5 py-0.5 ${getRoleBadge(r)}`}>
                                      {r}
                                  </span>
                                ))}
                              </div>
                          ) : (
                              <span className={`text-[9px] uppercase tracking-wider font-bold truncate inline-block mt-1 w-fit rounded px-1.5 py-0.5 ${getRoleBadge(user.role)}`}>
                                  {String(user.role || 'No Role')}
                              </span>
                          )}
                      </div>
                   </div>
                   <button className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-indigo-600 transition-all p-2 rounded-lg hover:bg-slate-200">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                   </button>
                </div>
            ))
         )}
       </div>
    </div>
  );
};

export default OnlinePlayers;
