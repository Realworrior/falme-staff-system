import { useState } from 'react';
import { Phone, Lock, Users, Wrench } from 'lucide-react';

interface LoginFormProps {
  onLogin: (phone: string, pin: string, role: 'staff' | 'technician') => Promise<boolean>;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<'staff' | 'technician'>('staff');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    setLoading(true);
    const success = await onLogin(phone, pin, role);
    setLoading(false);

    if (!success) {
      setError('Invalid phone number or PIN');
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-white">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mb-4 mx-auto backdrop-blur">
            <Phone className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-center mb-2">BetWin Support</h1>
          <p className="text-green-100 text-center text-sm">Technical Support Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Login As</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('staff')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === 'staff'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className={`w-6 h-6 mx-auto mb-2 ${role === 'staff' ? 'text-green-600' : 'text-gray-400'}`} />
                <div className={`text-sm font-medium ${role === 'staff' ? 'text-green-700' : 'text-gray-600'}`}>
                  Staff
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole('technician')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === 'technician'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Wrench className={`w-6 h-6 mx-auto mb-2 ${role === 'technician' ? 'text-green-600' : 'text-gray-400'}`} />
                <div className={`text-sm font-medium ${role === 'technician' ? 'text-green-700' : 'text-gray-600'}`}>
                  Technician
                </div>
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="123-456-7890"
                maxLength={12}
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              4-Digit PIN
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-2xl tracking-widest"
                placeholder="••••"
                maxLength={4}
                inputMode="numeric"
                required
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800 font-medium mb-2">Demo Accounts:</p>
            <p className="text-xs text-blue-700">Staff: 123-456-7890 / PIN: 1234</p>
            <p className="text-xs text-blue-700">Tech: 098-765-4321 / PIN: 4321</p>
          </div>
        </form>
      </div>
    </div>
  );
}
