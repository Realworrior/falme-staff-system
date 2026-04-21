import { Database } from 'lucide-react';

interface SeedButtonProps {
  onSeed: () => void;
}

export function SeedButton({ onSeed }: SeedButtonProps) {
  return (
    <button
      onClick={onSeed}
      className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
    >
      <Database className="w-4 h-4" />
      Load Sample Data
    </button>
  );
}
