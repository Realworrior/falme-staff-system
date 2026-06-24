import React from 'react';
import { Clock, User as UserIcon, Phone, DollarSign, Target, Copy } from 'lucide-react';

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

const statusConfig = {
  open: { bg: 'bg-[#baff55]/10', text: 'text-[#baff55]', border: 'border-[#baff55]/20', dot: 'bg-[#baff55]' },
  'in-progress': { bg: 'bg-[#ffa64d]/10', text: 'text-[#ffa64d]', border: 'border-[#ffa64d]/20', dot: 'bg-[#ffa64d]' },
  resolved: { bg: 'bg-[#3b82f6]/10', text: 'text-[#3b82f6]', border: 'border-[#3b82f6]/20', dot: 'bg-[#3b82f6]' },
  closed: { bg: 'bg-[#3a3b3f]', text: 'text-[#8e8e93]', border: 'border-[#3a3b3f]', dot: 'bg-[#8e8e93]' },
};

const priorityConfig = {
  low: { bg: 'bg-[#3a3b3f]', text: 'text-[#8e8e93]', border: 'border-[#3a3b3f]' },
  medium: { bg: 'bg-[#3b82f6]/10', text: 'text-[#3b82f6]', border: 'border-[#3b82f6]/20' },
  high: { bg: 'bg-[#ffa64d]/10', text: 'text-[#ffa64d]', border: 'border-[#ffa64d]/20' },
  urgent: { bg: 'bg-[#ff4d4d]/10', text: 'text-[#ff4d4d]', border: 'border-[#ff4d4d]/20' },
};

export function TicketCard({ ticket, onStatusChange, onAssign, userRole, userName }) {
  const s = ticket.status?.toLowerCase() || 'open';
  const displayStatus = s === 'closed' ? 'closed' : s === 'resolved' ? 'resolved' : s === 'in-progress' ? 'in-progress' : 'open';
  const displayPriority = ticket.priority?.toLowerCase() || 'medium';
  const sc = statusConfig[displayStatus] || statusConfig.open;
  const pc = priorityConfig[displayPriority] || priorityConfig.medium;

  const handleCopy = (text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-[#1e1f22] rounded-[24px] p-5 group">
      {/* Top Row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-[#baff55] font-mono">
              #{(ticket.ticket_id || ticket.id?.substring(0, 6) || '').toUpperCase()}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#3a3b3f]" />
            <span className="text-xs text-[#8e8e93]">
              {ticket.category || 'General Issue'}
            </span>
          </div>
          <h3 className="text-base font-semibold text-white mb-2 leading-snug group-hover:text-[#baff55] transition-colors">
            {ticket.title}
          </h3>
          <p className="text-sm text-[#8e8e93] leading-relaxed line-clamp-2">
            "{ticket.comments || ticket.description || 'No description provided.'}"
          </p>

          {/* Copyable Data Pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {ticket.phone && (
              <button 
                type="button"
                onClick={(e) => handleCopy(ticket.phone, e)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2b2f] border border-[#3a3b3f] rounded-full hover:border-[#baff55]/30 transition-colors group/btn shrink-0"
              >
                <Phone className="w-3 h-3 text-[#ff4d4d]/60 group-hover/btn:text-[#ff4d4d]" />
                <span className="text-xs font-mono text-white">{ticket.phone}</span>
                <Copy className="w-3 h-3 text-[#4a4b50] opacity-0 group-hover/btn:opacity-100" />
              </button>
            )}
            {ticket.amount && (
              <button 
                type="button"
                onClick={(e) => handleCopy(ticket.amount, e)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2b2f] border border-[#3a3b3f] rounded-full hover:border-[#baff55]/30 transition-colors group/btn shrink-0"
              >
                <DollarSign className="w-3 h-3 text-[#baff55]/60 group-hover/btn:text-[#baff55]" />
                <span className="text-xs font-mono text-white">{ticket.amount}</span>
                <Copy className="w-3 h-3 text-[#4a4b50] opacity-0 group-hover/btn:opacity-100" />
              </button>
            )}
            {(ticket.bet_id || ticket.betId) && (
              <button 
                type="button"
                onClick={(e) => handleCopy(ticket.bet_id || ticket.betId, e)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2b2f] border border-[#3a3b3f] rounded-full hover:border-[#baff55]/30 transition-colors group/btn shrink-0"
              >
                <Target className="w-3 h-3 text-[#3b82f6]/60 group-hover/btn:text-[#3b82f6]" />
                <span className="text-xs font-mono text-white">{ticket.bet_id || ticket.betId}</span>
                <Copy className="w-3 h-3 text-[#4a4b50] opacity-0 group-hover/btn:opacity-100" />
              </button>
            )}
          </div>
        </div>

        {/* Priority Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border h-fit shrink-0 ${pc.bg} ${pc.text} ${pc.border}`}>
          {displayPriority}
        </span>
      </div>

      {/* Bottom Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#2a2b2f]">
        <div className="flex items-center gap-4 text-xs text-[#8e8e93]">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>{formatDate(ticket.created_at || ticket.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <UserIcon className="w-3 h-3" />
            <span>{ticket.author || ticket.createdBy}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {ticket.assignee ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#baff55]/10 border border-[#baff55]/20 flex items-center justify-center text-[#baff55] text-xs font-semibold">
                {ticket.assignee.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-xs text-[#8e8e93]">{ticket.assignee}</span>
            </div>
          ) : userRole === 'technician' ? (
            <button
              onClick={() => onAssign(ticket.id, userName || 'Technician')}
              className="pill-dark text-xs py-2 px-4"
            >
              Assign to me
            </button>
          ) : null}

          {userRole === 'technician' ? (
            <select
              value={displayStatus}
              onChange={(e) => onStatusChange(ticket.id, e.target.value)}
              className={`px-3 py-2 bg-[#2a2b2f] rounded-full text-xs font-semibold border outline-none cursor-pointer transition-all ${sc.bg} ${sc.text} ${sc.border}`}
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          ) : (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-semibold ${sc.bg} ${sc.text} ${sc.border}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {displayStatus.replace('-', ' ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
