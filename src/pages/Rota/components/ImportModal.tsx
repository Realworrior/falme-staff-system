import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STAFF_CONFIG } from '../utils/scheduleGenerator';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Record<string, Record<string, string>>) => void;
  year: number;
  month: number;
}

export function ImportModal({ isOpen, onClose, onImport, year, month }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [shouldReplace, setShouldReplace] = useState(false);

  // Helper to split CSV line respecting double quotes
  const splitCSVLine = (line: string, delimiter: string) => {
    if (delimiter === ';') return line.split(';').map(v => v.trim());
    
    // Regex for comma split only if outside quotes
    const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    return line.split(regex).map(v => {
      let trimmed = v.trim();
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        trimmed = trimmed.substring(1, trimmed.length - 1);
      }
      return trimmed;
    });
  };

  const normalizeDate = (raw: string): string | null => {
    if (!raw) return null;
    const clean = raw.trim();
    
    // Check if it's "Wed, 1" or "1"
    const match = clean.match(/(\d+)/);
    if (match) {
      const dayNum = parseInt(match[1]);
      if (dayNum >= 1 && dayNum <= 31) {
        // Use the context year/month
        const d = new Date(year, month, dayNum);
        return format(d, 'yyyy-MM-dd');
      }
    }

    // Try standard parsing
    try {
      const d = new Date(clean);
      if (!isNaN(d.getTime())) return format(d, 'yyyy-MM-dd');
    } catch {
      return null;
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Please upload a valid CSV file');
        return;
      }
      setFile(selectedFile);
      setError(null);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 1) return;

      const firstLine = lines[0];
      const delimiter = firstLine.includes(';') ? ';' : ',';

      const headers = splitCSVLine(firstLine, delimiter);
      setPreviewHeaders(headers);
      
      const rows = lines.slice(1, 6).map(line => {
        return splitCSVLine(line, delimiter);
      });
      setPreviewRows(rows);
    };
    reader.readAsText(file);
  };

  const handleProcess = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 2) {
        setError('File contains no data');
        return;
      }

      const delimiter = lines[0].includes(';') ? ';' : ',';
      const headers = splitCSVLine(lines[0], delimiter);
      const staffIndices: { name: string; index: number }[] = [];
      const validStaffNames = STAFF_CONFIG.map(s => s.name.toLowerCase());

      // Map columns to staff members
      headers.forEach((h, i) => {
        if (i === 0) return; // Column A is date
        if (validStaffNames.includes(h.toLowerCase())) {
          const properName = STAFF_CONFIG.find(s => s.name.toLowerCase() === h.toLowerCase())?.name;
          if (properName) staffIndices.push({ name: properName, index: i });
        }
      });

      const result: Record<string, Record<string, string>> = {};
      const invalidEntries: string[] = [];

      lines.slice(1).forEach((line, lineIdx) => {
        const values = splitCSVLine(line, delimiter);
        const rawDate = values[0];
        const dateKey = normalizeDate(rawDate);

        if (!dateKey) {
          if (rawDate) invalidEntries.push(`Row ${lineIdx + 2}: Invalid date "${rawDate}"`);
          return;
        }

        staffIndices.forEach(({ name, index }) => {
          const shift = values[index]?.toUpperCase();
          if (shift && ['AM', 'PM', 'NT', 'OFF'].includes(shift)) {
            if (!result[dateKey]) result[dateKey] = {};
            result[dateKey][name] = shift;
          }
        });
      });

      if (invalidEntries.length > 0) {
        setError("Import issues: " + invalidEntries.slice(0, 3).join('; ') + (invalidEntries.length > 3 ? ` (+${invalidEntries.length - 3} more)` : ''));
        return;
      }

      // Pass the mode along with data if needed, or handle in App.tsx
      // For simplicity, we'll wrap result with metadata if App.tsx supports it
      (onImport as any)(result, shouldReplace); 
      onClose();
      setFile(null);
      setPreviewRows([]);
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#0a0a0f] border-white/5 text-white max-w-4xl p-0 overflow-hidden rounded-[32px]">
        <div className="p-8 border-b border-white/5 bg-black/40">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Upload className="text-red-500" />
              Advanced Matrix Import
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">
              Sync Operational Data with Quoted Comma Support
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-6">
          {!file ? (
            <div 
              className="border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 hover:border-red-500/30 transition-all group cursor-pointer relative"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile) handleFileChange({ target: { files: [droppedFile] } } as any);
              }}
            >
              <input 
                type="file" 
                accept=".csv" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileChange}
              />
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:scale-110 group-hover:text-red-500 transition-all">
                <FileText size={32} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold">Drop CSV file here or click to browse</p>
                <div className="mt-2 text-[9px] text-gray-600 uppercase tracking-widest font-black flex flex-col gap-1">
                   <span>Handles Dates like "Wed, 1" (Matrix Format)</span>
                   <span>Supports Comma and Semicolon delimiters</span>
                </div>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 text-emerald-500 rounded-lg">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{file.name}</p>
                    <p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setFile(null); setPreviewRows([]); }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-500"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Advanced Options */}
              <div className="p-4 bg-red-600/5 border border-red-500/10 rounded-2xl">
                 <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${shouldReplace ? 'bg-red-500 border-red-500' : 'border-white/20 bg-black/40'}`}>
                       <input 
                         type="checkbox" 
                         className="hidden" 
                         checked={shouldReplace} 
                         onChange={(e) => setShouldReplace(e.target.checked)} 
                       />
                       {shouldReplace && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-red-400 transition-colors">
                          Replace Existing Shifts
                       </span>
                       <span className="text-[8px] text-gray-500 uppercase tracking-tighter">
                          Wipe all manual overrides for the dates in this file before import
                       </span>
                    </div>
                 </label>
              </div>

              {previewRows.length > 0 && (
                <div className="space-y-2">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Live Grid Preview</p>
                   {/* FIXED SCROLL CONTAINER */}
                   <div className="relative group/scroll bg-black/40 border border-white/5 rounded-2xl">
                      <div className="overflow-x-auto overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        <table className="w-full text-left whitespace-nowrap table-fixed min-w-[800px]">
                          <thead className="sticky top-0 z-10">
                            <tr className="bg-[#0f0f17] text-gray-400 uppercase tracking-widest text-[9px]">
                              {previewHeaders.map((h, i) => (
                                <th key={i} className={`p-3 border-b border-white/5 ${i === 0 ? 'sticky left-0 bg-[#0f0f17] z-20 w-[120px]' : 'w-[100px]'}`}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {previewRows.map((row, i) => (
                              <tr key={i} className="text-gray-300 text-[10px]">
                                {row.map((val, j) => (
                                  <td key={j} className={`p-3 ${j === 0 ? 'sticky left-0 bg-[#12121a] font-black text-white border-r border-white/5' : ''}`}>
                                    {j === 0 ? val : (
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                                        val?.toUpperCase() === 'AM' ? 'bg-orange-500/10 text-orange-400' :
                                        val?.toUpperCase() === 'PM' ? 'bg-emerald-500/10 text-emerald-400' :
                                        val?.toUpperCase() === 'NT' ? 'bg-indigo-500/10 text-indigo-400' :
                                        val?.toUpperCase() === 'OFF' ? 'bg-red-500/10 text-red-500' :
                                        'bg-gray-500/10 text-gray-500'
                                      }`}>
                                        {val || '-'}
                                      </span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {/* Visual hint for horizontal scroll */}
                      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-black/20 to-transparent pointer-events-none rounded-r-2xl" />
                   </div>
                </div>
              )}
            </motion.div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-black/40">
           <DialogFooter className="flex gap-3">
             <button 
               onClick={onClose}
               className="flex-1 px-6 py-4 rounded-2xl border border-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
             >
               Cancel
             </button>
             <button 
               onClick={handleProcess}
               disabled={!file}
               className="flex-1 px-6 py-4 rounded-2xl accent-gradient text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
             >
               Execute Matrix Sync
             </button>
           </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
