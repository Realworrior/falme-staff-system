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
import { Upload, FileText, CheckCircle2, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STAFF_CONFIG } from '../utils/scheduleGenerator';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Record<string, Record<string, string>>, shouldReplace: boolean) => void;
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
    // Clean double commas or extra noise
    const clean = raw.trim().replace(/,+/g, ',');
    
    // Check if it's "Wed, 1" or "1"
    const match = clean.match(/(\d+)/);
    if (match) {
      const dayNum = parseInt(match[1]);
      if (dayNum >= 1 && dayNum <= 31) {
        const d = new Date(year, month, dayNum);
        return format(d, 'yyyy-MM-dd');
      }
    }

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

  const adaptiveSplitAndMerge = (line: string, delimiter: string, expectedLen: number): string[] => {
    let values = splitCSVLine(line, delimiter);
    
    // If we have more values than expected, and it's a date column issue
    if (values.length > expectedLen && expectedLen > 0) {
      const extraCount = values.length - expectedLen;
      const mergedDate = values.slice(0, extraCount + 1).join(' ');
      return [mergedDate, ...values.slice(extraCount + 1)];
    }
    return values;
  };

  const cleanShift = (raw: string) => {
    if (!raw) return '';
    // Strip everything except alphanumeric, then upper
    const cleaned = raw.replace(/[^a-zA-Z]/g, '').toUpperCase();
    return cleaned;
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 1) return;

      const firstLine = lines[0];
      const delimiter = firstLine.includes(';') ? ';' : ',';

      const headers = splitCSVLine(firstLine, delimiter).filter(h => h.trim() !== '');
      setPreviewHeaders(headers);
      
      const rows = lines.slice(1, 6).map(line => {
        return adaptiveSplitAndMerge(line, delimiter, headers.length);
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
      const headers = splitCSVLine(lines[0], delimiter).filter(h => h.trim() !== '');
      const staffIndices: { name: string; index: number }[] = [];
      const validStaffNames = STAFF_CONFIG.map(s => s.name.toLowerCase());

      headers.forEach((h, i) => {
        if (i === 0) return;
        if (validStaffNames.includes(h.toLowerCase())) {
          const properName = STAFF_CONFIG.find(s => s.name.toLowerCase() === h.toLowerCase())?.name;
          if (properName) staffIndices.push({ name: properName, index: i });
        }
      });

      const result: Record<string, Record<string, string>> = {};
      const invalidEntries: string[] = [];

      lines.slice(1).forEach((line, lineIdx) => {
        const values = adaptiveSplitAndMerge(line, delimiter, headers.length);
        const rawDate = values[0];
        const dateKey = normalizeDate(rawDate);

        if (!dateKey) {
          if (rawDate) invalidEntries.push(`Row ${lineIdx + 2}: Invalid date "${rawDate}"`);
          return;
        }

        staffIndices.forEach(({ name, index }) => {
          const shift = cleanShift(values[index]);
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

      if (Object.keys(result).length === 0) {
        setError('No valid shift data found. Ensure staff names in CSV match the system exactly (e.g. Ascar, Chris).');
        return;
      }

      onImport(result, shouldReplace); 
      onClose();
      setFile(null);
      setPreviewRows([]);
    };
    reader.readAsText(file);
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#0a0a0f] border-white/5 text-white max-w-7xl w-[98vw] max-h-[92vh] p-0 overflow-hidden rounded-[32px] flex flex-col">
        <div className="p-8 border-b border-white/5 bg-black/40">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Upload className="text-red-500" />
              Advanced Matrix Import
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">
              Sync Operational Data with Atomic Override support
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
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
              <div className="p-4 bg-white/2 border border-white/10 rounded-2xl">
                 <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${shouldReplace ? 'bg-red-500 border-red-500 shadow-lg shadow-red-500/20' : 'border-white/20 bg-black/40'}`}>
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
                       <span className="text-[8px] text-gray-500 uppercase tracking-tighter mt-0.5">
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
                      <div className="overflow-x-auto overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-white/5">
                        <table className="w-full text-left whitespace-nowrap table-auto min-w-max">
                          <thead className="sticky top-0 z-10">
                            <tr className="bg-[#0f0f17] text-gray-400 uppercase tracking-widest text-[9px]">
                              {previewHeaders.map((h, i) => (
                                <th key={i} className={`p-4 border-b border-white/10 ${i === 0 ? 'sticky left-0 bg-[#0f0f17] z-20 min-w-[180px]' : 'min-w-[140px]'}`}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {previewRows.map((row, i) => (
                              <tr key={i} className="text-gray-300 text-[10px]">
                                {row.map((val, j) => {
                                  const rawVal = val?.trim() || '';
                                  const displayVal = j === 0 ? rawVal.replace(/,+/g, ', ') : cleanShift(rawVal);
                                  return (
                                    <td key={j} className={`p-3 ${j === 0 ? 'sticky left-0 bg-[#12121a] font-black text-white border-r border-white/5' : ''}`}>
                                      {j === 0 ? displayVal : (
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                                          displayVal === 'AM' ? 'bg-orange-500/10 text-orange-400' :
                                          displayVal === 'PM' ? 'bg-emerald-500/10 text-emerald-400' :
                                          displayVal === 'NT' ? 'bg-indigo-500/10 text-indigo-400' :
                                          displayVal === 'OFF' ? 'bg-red-500/10 text-red-500' :
                                          'bg-gray-500/10 text-gray-500'
                                        }`}>
                                          {displayVal || '-'}
                                        </span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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

        <div className="p-8 border-t border-white/5 bg-black/40">
           <div className="flex flex-col sm:flex-row gap-4">
             <button 
               onClick={onClose}
               className="order-2 sm:order-1 flex-1 px-8 py-4 rounded-2xl border border-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all text-center"
             >
               Cancel
             </button>
             <button 
               onClick={handleProcess}
               disabled={!file}
               className="order-1 sm:order-2 flex-[2] px-8 py-4 rounded-2xl accent-gradient text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all text-center flex items-center justify-center gap-2"
             >
               {shouldReplace ? <ShieldAlert size={14} className="text-white animate-pulse" /> : <Upload size={14} />}
               {shouldReplace ? 'Execute Full Wipe & Sync' : 'Execute Matrix Sync'}
             </button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
