import { Clock, User, AlertCircle } from 'lucide-react';

const formatDate = (isoString: string) => {
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

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  createdBy: string;
  createdAt: string;
}

interface TicketCardProps {
  ticket: Ticket;
  onStatusChange: (id: string, status: Ticket['status']) => void;
  onAssign: (id: string, assignee: string) => void;
  userRole: 'staff' | 'technician';
  userName?: string;
}

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600'
};

export function TicketCard({ ticket, onStatusChange, onAssign, userRole, userName }: TicketCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">{ticket.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[ticket.priority]}`}>
          {ticket.priority}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDate(ticket.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{ticket.createdBy}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {ticket.assignee ? (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-medium">
                {ticket.assignee.charAt(0).toUpperCase()}
              </div>
              <span>{ticket.assignee}</span>
            </div>
          ) : userRole === 'technician' ? (
            <button
              onClick={() => onAssign(ticket.id, userName || 'Technician')}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
            >
              Assign to me
            </button>
          ) : null}

          {userRole === 'technician' ? (
            <select
              value={ticket.status}
              onChange={(e) => onStatusChange(ticket.id, e.target.value as Ticket['status'])}
              className={`px-3 py-1 rounded text-sm font-medium border-0 cursor-pointer ${statusColors[ticket.status]}`}
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          ) : (
            <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors[ticket.status]}`}>
              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
