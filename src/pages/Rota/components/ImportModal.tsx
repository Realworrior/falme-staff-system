import React, { useState } from 'react';
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

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Record<string, Record<string, string>>) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      const rows = text.split('\n').filter(row => row.trim());
      const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
      
      const dataRows = rows.slice(1).map(row => {
        const values = row.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((h, i) => obj[h] = values[i]);
        return obj;
      });

      setPreview(dataRows.slice(0, 5));
    };
    reader.readAsText(file);
  };

  const handleProcess = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').filter(row => row.trim());
      const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
      
      const result: Record<string, Record<string, string>> = {};

      rows.slice(1).forEach(row => {
        const values = row.split(',').map(v => v.trim());
        const date = values[headers.indexOf('date')];
        const staff = values[headers.indexOf('staff')];
        const shift = values[headers.indexOf('shift')];

        if (date && staff && shift) {
          if (!result[date]) result[date] = {};
          result[date][staff] = shift.toUpperCase();
        }
      });

      onImport(result);
      onClose();
      setFile(null);
      setPreview([]);
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#0a0a0f] border-white/5 text-white max-w-xl p-0 overflow-hidden rounded-[32px]">
        <div className="p-8 border-b border-white/5 bg-black/40">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Upload className="text-red-500" />
              Bulk Schedule Import
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">
              Synchronize External Operation Logs
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
                <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest font-black">Format: Date, Staff, Shift</p>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
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
                  onClick={() => { setFile(null); setPreview([]); }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-500"
                >
                  <X size={16} />
                </button>
              </div>

              {preview.length > 0 && (
                <div className="space-y-2">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Data Preview (First 5 records)</p>
                   <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
                      <table className="w-full text-[10px] text-left">
                        <thead>
                          <tr className="bg-white/5 text-gray-400 uppercase tracking-widest">
                            <th className="p-3">Date</th>
                            <th className="p-3">Staff</th>
                            <th className="p-3">Shift</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {preview.map((row, i) => (
                            <tr key={i} className="text-gray-300">
                              <td className="p-3 font-mono">{row.date}</td>
                              <td className="p-3">{row.staff}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black">
                                  {row.shift?.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
               Initialize Sync
             </button>
           </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
