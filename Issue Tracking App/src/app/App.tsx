import { useState, useEffect } from 'react';
import { Plus, Ticket, LayoutDashboard, Filter, LogOut } from 'lucide-react';
import { TicketCard } from './components/TicketCard';
import { NewTicketModal } from './components/NewTicketModal';
import { StatsCard } from './components/StatsCard';
import { SeedButton } from './components/SeedButton';
import { LoginForm } from './components/LoginForm';
import { projectId, publicAnonKey } from '../../utils/supabase/info.tsx';

interface User {
  id: string;
  phone: string;
  role: 'staff' | 'technician';
  name: string;
}

const sampleTickets = [
  {
    title: 'Withdrawal request pending for 48 hours',
    description: 'Customer ID: BET8974532. Requested withdrawal of $1,250 to bank account ending in 4532. Status still shows pending after 48 hours.',
    priority: 'high' as const,
    createdBy: 'Customer #8974532'
  },
  {
    title: 'Bet settlement incorrect - Premier League match',
    description: 'Bet ID: PL456789. Placed bet on Liverpool to win at 2.1 odds. Match won but bet marked as lost. Request immediate review.',
    priority: 'urgent' as const,
    createdBy: 'Customer #7823451'
  },
  {
    title: 'Unable to login - Password reset not working',
    description: 'Customer cannot access account. Password reset email not arriving. Tried multiple times over last 3 hours.',
    priority: 'high' as const,
    createdBy: 'Customer #5643219'
  },
  {
    title: 'Live betting odds not updating',
    description: 'During Champions League match, odds frozen for 10+ minutes. Multiple customers affected. Requires technical investigation.',
    priority: 'urgent' as const,
    createdBy: 'System Monitor'
  },
  {
    title: 'Bonus not credited to account',
    description: 'Customer deposited $100 for welcome bonus. Deposit confirmed but bonus amount not reflected in account balance.',
    priority: 'medium' as const,
    createdBy: 'Customer #9234567'
  },
  {
    title: 'Mobile app crashes on Android',
    description: 'App version 3.2.1 crashing when accessing bet history on Android 14. Affecting multiple users.',
    priority: 'high' as const,
    createdBy: 'Customer Support Team'
  },
  {
    title: 'Duplicate charge on credit card',
    description: 'Customer ID: BET3456789. Single deposit of $50 charged twice. Bank statement shows two transactions.',
    priority: 'urgent' as const,
    createdBy: 'Customer #3456789'
  },
  {
    title: 'Account verification documents rejected',
    description: 'Uploaded passport and utility bill for verification. Both rejected without clear reason. Customer requesting explanation.',
    priority: 'medium' as const,
    createdBy: 'Customer #6781234'
  }
];

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

const technicians = ['Alex Chen', 'Maria Garcia', 'James Wilson', 'Sarah Kim'];

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-07e1ed14`;

console.log('Supabase Config:', { projectId, publicAnonKey: publicAnonKey?.substring(0, 20) + '...', API_URL });

const fetchTickets = async () => {
  try {
    const response = await fetch(`${API_URL}/tickets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched tickets:', data);
    return data.tickets || [];
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return [];
  }
};

const createTicket = async (ticketData: any) => {
  try {
    console.log('Creating ticket:', ticketData);
    const response = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify(ticketData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Created ticket:', data);
    return data.ticket;
  } catch (error) {
    console.error('Error creating ticket:', error);
    return null;
  }
};

const updateTicket = async (ticketId: string, updates: any) => {
  try {
    console.log('Updating ticket:', ticketId, updates);
    const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Updated ticket:', data);
    return data.ticket;
  } catch (error) {
    console.error('Error updating ticket:', error);
    return null;
  }
};

const loginUser = async (phone: string, pin: string, role: 'staff' | 'technician') => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ phone, pin, role })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('betwin_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user]);

  const loadTickets = async () => {
    setLoading(true);
    const data = await fetchTickets();
    setTickets(data);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: Ticket['status']) => {
    const updated = await updateTicket(id, { status });
    if (updated) {
      setTickets(tickets.map(ticket =>
        ticket.id === id ? updated : ticket
      ));
    }
  };

  const handleAssign = async (id: string, assignee: string) => {
    const updated = await updateTicket(id, { assignee, status: 'in-progress' });
    if (updated) {
      setTickets(tickets.map(ticket =>
        ticket.id === id ? updated : ticket
      ));
    }
  };

  const handleNewTicket = async (ticketData: { title: string; description: string; priority: 'low' | 'medium' | 'high' | 'urgent' }) => {
    const newTicket = await createTicket({
      ...ticketData,
      createdBy: user?.name || 'Customer',
      status: 'open'
    });
    if (newTicket) {
      setTickets([newTicket, ...tickets]);
    }
  };

  const handleSeedData = async () => {
    setLoading(true);
    for (const ticket of sampleTickets) {
      await createTicket(ticket);
    }
    await loadTickets();
  };

  const handleLogin = async (phone: string, pin: string, role: 'staff' | 'technician') => {
    const userData = await loginUser(phone, pin, role);
    if (userData) {
      setUser(userData);
      localStorage.setItem('betwin_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('betwin_user');
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const filteredTickets = filterStatus === 'all'
    ? tickets
    : tickets.filter(ticket => ticket.status === filterStatus);

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    total: tickets.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-lg">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">BetWin Support</h1>
                <p className="text-xs text-gray-500">Technical Support Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right mr-3">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user.role}</div>
              </div>
              {user.role === 'staff' && (
                <button
                  onClick={() => setShowNewTicketModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Report Issue
                </button>
              )}
              {tickets.length === 0 && !loading && (
                <SeedButton onSeed={handleSeedData} />
              )}
              <button
                onClick={handleLogout}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {user.role === 'staff' ? 'Customer Support Dashboard' : 'Technical Support Dashboard'}
          </h2>
          <p className="text-sm text-gray-600">
            {user.role === 'staff'
              ? 'Report issues and track your submitted tickets'
              : 'Manage and resolve customer support tickets'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard label="Open" value={stats.open} color="text-blue-600" />
          <StatsCard label="In Progress" value={stats.inProgress} color="text-yellow-600" />
          <StatsCard label="Resolved" value={stats.resolved} color="text-green-600" />
          <StatsCard label="Total Tickets" value={stats.total} color="text-gray-900" />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Tickets</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <span className="text-sm text-gray-600">
              {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'}
            </span>
          </div>

          <div className="p-4 space-y-3">
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <div className="w-12 h-12 mx-auto mb-3 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p>Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <LayoutDashboard className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No tickets found</p>
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onStatusChange={handleStatusChange}
                  onAssign={handleAssign}
                  userRole={user.role}
                  userName={user.name}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {showNewTicketModal && (
        <NewTicketModal
          onClose={() => setShowNewTicketModal(false)}
          onSubmit={handleNewTicket}
        />
      )}
    </div>
  );
}