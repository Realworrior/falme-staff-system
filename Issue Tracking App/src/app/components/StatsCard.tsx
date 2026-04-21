interface StatsCardProps {
  label: string;
  value: number;
  color: string;
}

const gradients: Record<string, string> = {
  'text-blue-600': 'from-blue-50 to-blue-100 border-blue-200',
  'text-yellow-600': 'from-yellow-50 to-yellow-100 border-yellow-200',
  'text-green-600': 'from-green-50 to-green-100 border-green-200',
  'text-gray-900': 'from-gray-50 to-gray-100 border-gray-200'
};

export function StatsCard({ label, value, color }: StatsCardProps) {
  const gradient = gradients[color] || 'from-gray-50 to-gray-100 border-gray-200';

  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-lg border p-5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="text-sm font-medium text-gray-600 mb-2">{label}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
