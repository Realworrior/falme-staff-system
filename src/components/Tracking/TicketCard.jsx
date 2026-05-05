import React from 'react';
import { Clock, User as UserIcon, AlertCircle, Phone, DollarSign, Target, Copy } from 'lucide-react';

const formatDate = (isoString) => {
  if (!isoString) return 'Pending...';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const statusColors = {
  open: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'in-progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  closed: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
};

const priorityColors = {
  low: 'bg-gray-500/10 text-gray-400',
  medium: 'bg-blue-500/10 text-blue-400',
  high: 'bg-orange-500/10 text-orange-400',
  urgent: 'bg-red-500/10 text-red-500'
};

export function TicketCard({ ticket, onStatusChange, onAssign, userRole, userName }) {
  const s = ticket.status?.toLowerCase();
  const displayStatus = (s === 'resolved' || s === 'closed') ? 'resolved' : 'open';
  const displayPriority = ticket.priority?.toLowerCase() || 'medium';

  const handleCopy = (text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border hover:border-red-500/20 transition-all group relative overflow-hidden">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-red-500/60 uppercase tracking-widest font-mono">
              #{ (ticket.ticket_id || ticket.id?.substring(0, 6) || '').toUpperCase() }
            </span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">
              {ticket.category || 'General Issue'}
            </span>
          </div>
          <h3 className="text-lg font-black text-white font-heading uppercase tracking-tight mb-2 group-hover:text-red-500 transition-colors">
            {ticket.title}
          </h3>
          <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-2 italic">
            "{ticket.comments || ticket.description || 'No detailed description provided.'}"
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            {ticket.phone && (
              <button 
                type="button"
                onClick={(e) => handleCopy(ticket.phone, e)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg hover:bg-white/10 transition-colors group/btn shrink-0 active:scale-95"
              >
                <Phone className="w-3 h-3 text-red-500/50 group-hover/btn:text-red-500 transition-colors" />
                <span className="text-[10px] font-mono font-black text-white">{ticket.phone}</span>
                <Copy className="w-3 h-3 text-gray-600 group-hover/btn:text-white ml-0.5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </button>
            )}
            {ticket.amount && (
              <button 
                type="button"
                onClick={(e) => handleCopy(ticket.amount, e)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg hover:bg-white/10 transition-colors group/btn shrink-0 active:scale-95"
              >
                <DollarSign className="w-3 h-3 text-green-500/50 group-hover/btn:text-green-500 transition-colors" />
                <span className="text-[10px] font-mono font-black text-white">{ticket.amount}</span>
                <Copy className="w-3 h-3 text-gray-600 group-hover/btn:text-white ml-0.5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </button>
            )}
            {(ticket.bet_id || ticket.betId) && (
              <button 
                type="button"
                onClick={(e) => handleCopy(ticket.bet_id || ticket.betId, e)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg hover:bg-white/10 transition-colors group/btn shrink-0 active:scale-95"
              >
                <Target className="w-3 h-3 text-purple-500/50 group-hover/btn:text-purple-500 transition-colors" />
                <span className="text-[10px] font-mono font-black text-white">{ticket.bet_id || ticket.betId}</span>
                <Copy className="w-3 h-3 text-gray-600 group-hover/btn:text-white ml-0.5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest border h-fit ${priorityColors[displayPriority]}`}>
          {displayPriority}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-600">
          <div className="flex items-center gap-1.5 flex-nowrap">
            <Clock className="w-3 h-3 text-red-500/50" />
            <span>{formatDate(ticket.created_at || ticket.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <UserIcon className="w-3 h-3 text-red-500/50" />
            <span>{ticket.author || ticket.createdBy}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {ticket.assignee ? (
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <div className="w-6 h-6 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 text-[10px] font-black">
                {ticket.assignee.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline">{ticket.assignee}</span>
            </div>
          ) : userRole === 'technician' ? (
            <button
              onClick={() => onAssign(ticket.id, userName || 'Technician')}
              className="px-4 py-2 text-[9px] font-black uppercase tracking-widest bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-600/20 transition-all active:scale-95"
            >
              Assign to me
            </button>
          ) : null}

          {userRole === 'technician' ? (
            <select
              value={displayStatus}
              onChange={(e) => onStatusChange(ticket.id, e.target.value)}
              className={`px-3 py-2 bg-black/40 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 outline-none cursor-pointer focus:border-red-500/30 transition-all ${statusColors[displayStatus] || statusColors.open}`}
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          ) : (
            <span className={`px-4 py-2 border rounded-xl text-[9px] font-black uppercase tracking-widest ${statusColors[displayStatus] || statusColors.open}`}>
              {displayStatus.replace('-', ' ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
