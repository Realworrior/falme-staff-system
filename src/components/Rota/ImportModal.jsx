import React, { useState } from 'react';
import { format } from 'date-fns';
import Papa from 'papaparse';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '../ui/dialog';
import { Upload, FileText, CheckCircle2, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { STAFF_CONFIG } from '../../utils/Rota/scheduleGenerator';
import { predictMonthRota, validateRota } from '../../utils/Rota/smartPredictor';

export function ImportModal({ isOpen, onClose, onImport, year, month, allOverrides = {} }) {
  const [activeTab, setActiveTab] = useState('excel');
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [previewHeaders, setPreviewHeaders] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [error, setError] = useState(null);
  const [shouldReplace, setShouldReplace] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [pasteText, setPasteText] = useState('');

  const normalizeDate = (raw) => {
    if (!raw) return null;
    const clean = raw.trim()
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/(\d+)(st|nd|rd|th)/i, '$1')
      .replace(/\s+/g, ' ');
    
    // Robust match for "Fri, , 1" or "Fri, 1" or just "1" with any amount of spacing/commas
    const dayMatch = clean.match(/(?:[a-zA-Z]{2,10}|,|\s)*\s*(\d{1,2})$/i);
    if (dayMatch) {
      const dayNum = parseInt(dayMatch[1]);
      if (dayNum >= 1 && dayNum <= 31) {
        try {
          const d = new Date(year, month, dayNum);
          if (!isNaN(d.getTime())) return format(d, 'yyyy-MM-dd');
        } catch (e) { return null; }
      }
    }

    const dmyMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1]);
      const monthIdx = parseInt(dmyMatch[2]) - 1;
      let fullYear = parseInt(dmyMatch[3]);
      if (fullYear < 100) fullYear += 2000;
      const d = new Date(fullYear, monthIdx, day);
      if (!isNaN(d.getTime())) return format(d, 'yyyy-MM-dd');
    }

    try {
      const d = new Date(clean);
      if (!isNaN(d.getTime())) return format(d, 'yyyy-MM-dd');
    } catch {
      return null;
    }
    return null;
  };

  const cleanShift = (raw) => {
    if (!raw) return '';
    const s = raw.trim().toUpperCase();
    if (s.includes('AM')) return 'AM';
    if (s.includes('PM')) return 'PM';
    if (s.includes('NT') || s.includes('NIGHT')) return 'NT';
    if (s.includes('OFF')) return 'OFF';
    return '';
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file) => {
    Papa.parse(file, {
      skipEmptyLines: 'greedy',
      complete: (results) => {
        const data = results.data.filter(row => row.some(cell => cell.trim() !== ''));
        if (data.length < 1) {
          setError('File appears to be empty');
          return;
        }
        
        setParsedData(data);
        const headers = data[0].map(h => h?.trim() || '');
        setPreviewHeaders(headers);
        
        const previewData = data.slice(1, 6).map(row => {
          const arr = new Array(headers.length).fill('');
          for (let i = 0; i < Math.min(row.length, headers.length); i++) {
            arr[i] = row[i]?.trim() || '';
          }
          return arr;
        });
        setPreviewRows(previewData);
      }
    });
  };

  const handlePaste = (text) => {
    setPasteText(text);
    if (!text.trim()) {
      setParsedData(null);
      setPreviewRows([]);
      return;
    }

    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length === 0) return;

    const data = lines.map(line => line.split('\t'));
    setParsedData(data);
    
    const headers = data[0].map(h => h?.trim() || '');
    setPreviewHeaders(headers);
    
    const previewData = data.slice(1, 10).map(row => {
      const arr = new Array(headers.length).fill('');
      for (let i = 0; i < Math.min(row.length, headers.length); i++) {
        arr[i] = row[i]?.trim() || '';
      }
      return arr;
    });
    setPreviewRows(previewData);
  };

  const handleProcess = () => {
    if (!parsedData || parsedData.length < 2) {
      setError('No valid data to process');
      return;
    }

    const headers = parsedData[0].map(h => h?.trim().toLowerCase() || '');
    let staffIndices = [];
    
    STAFF_CONFIG.forEach(staff => {
      const lowerName = staff.name.toLowerCase();
      const index = headers.findIndex(h => h.includes(lowerName) || lowerName.includes(h));
      if (index > 0) {
        staffIndices.push({ name: staff.name, index });
      }
    });

    // Fallback: If no headers matched (e.g. user didn't copy the header row), 
    // assume the standard 10-column layout from the spreadsheet:
    // Date, Chris, Faye, Joyce, Linda, Nickson, Pauline, Sylvia, Terry, Ascar
    if (staffIndices.length === 0 && parsedData[0].length >= 9) {
      const standardOrder = ['Chris', 'Faye', 'Joyce', 'Linda', 'Nickson', 'Pauline', 'Sylvia', 'Terry', 'Ascar'];
      staffIndices = standardOrder.map((name, idx) => ({ name, index: idx + 1 }));
    } else if (staffIndices.length === 0) {
      setError('Could not identify any staff columns. Ensure headers match staff names or the columns follow the standard layout.');
      return;
    }

    const result = {};
    let processedRows = 0;

    // If we used the fallback, we need to process from row 0 instead of row 1 
    // because row 0 might be actual data, not a header row.
    const startRow = headers.some(h => h.includes('date') || h.includes('chris') || h.includes('faye')) ? 1 : 0;

    parsedData.slice(startRow).forEach((row) => {
      const rawDate = row[0]?.trim();
      if (!rawDate) return;

      const dateKey = normalizeDate(rawDate);
      if (!dateKey) return;

      let rowHasData = false;
      staffIndices.forEach(({ name, index }) => {
        const shift = cleanShift(row[index]);
        if (shift) {
          if (!result[dateKey]) result[dateKey] = {};
          result[dateKey][name] = shift;
          rowHasData = true;
        }
      });
      if (rowHasData) processedRows++;
    });

    if (processedRows === 0) {
      setError('No valid shift data found in the pasted content. Check if the dates and staff names match.');
      return;
    }

    onImport(result, shouldReplace); 
    onClose();
    setFile(null);
    setParsedData(null);
    setPreviewRows([]);
    setPasteText('');
  };

  const handlePredict = () => {
    try {
      const predicted = predictMonthRota(year, month, allOverrides);
      setPredictionResult(predicted);
      
      const { errors } = validateRota(predicted);
      setValidationErrors(errors);
      
      const dates = Object.keys(predicted).sort();
      const headers = ['Date', ...STAFF_CONFIG.map(s => s.name)];
      setPreviewHeaders(headers);
      
      const previewRows = dates.slice(0, 10).map(date => {
        return [date, ...STAFF_CONFIG.map(s => predicted[date][s.name])];
      });
      setPreviewRows(previewRows);
      setError(null);
    } catch (err) {
      setError('Prediction failed: ' + err.message);
    }
  };

  const handleApplyPrediction = () => {
    if (predictionResult) {
      onImport(predictionResult, true); 
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-background border-border text-white max-w-7xl w-[98vw] max-h-[92vh] p-0 overflow-hidden rounded-2xl flex flex-col">
        <div className="p-8 border-b border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Upload className="text-red-500" />
              Advanced Matrix Sync
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2 flex items-center justify-between">
              <span>Operational Data & AI Prediction Support</span>
              <span className="text-red-500/80 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
                Target: {format(new Date(year, month, 1), 'MMMM yyyy')}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mt-6">
            <button 
              onClick={() => { setActiveTab('excel'); setError(null); setParsedData(null); setPreviewRows([]); setFile(null); }}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'excel' ? 'bg-white/10 text-white border border-border' : 'text-gray-500 hover:text-gray-300'}`}
            >
              CSV File
            </button>
            <button 
              onClick={() => { setActiveTab('paste'); setError(null); setParsedData(null); setPreviewRows([]); }}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'paste' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Smart Paste
            </button>
            <button 
              onClick={() => { setActiveTab('ai'); setError(null); setPreviewRows([]); }}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ai' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'text-gray-500 hover:text-gray-300'}`}
            >
              AI Prediction
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin">
          {activeTab === 'excel' && (
            !file ? (
              <div 
                className="border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 hover:border-red-500/30 transition-all group cursor-pointer relative"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile) handleFileChange({ target: { files: [droppedFile] } });
                }}
              >
                <input type="file" accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:scale-110 group-hover:text-red-500 transition-all">
                  <FileText size={32} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold">Drop CSV file here or click to browse</p>
                  <p className="mt-2 text-[9px] text-gray-600 uppercase tracking-widest font-black">Standard Matrix Format</p>
                </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 text-emerald-500 rounded-lg"><CheckCircle2 size={16} /></div>
                    <div>
                      <p className="text-xs font-bold">{file.name}</p>
                      <p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button onClick={() => { setFile(null); setParsedData(null); setPreviewRows([]); }} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-500"><X size={16} /></button>
                </div>
                <div className="p-4 bg-white/2 border border-white/10 rounded-2xl">
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${shouldReplace ? 'bg-red-500 border-red-500 shadow-lg' : 'border-white/20 bg-black/40'}`}>
                         <input type="checkbox" className="hidden" checked={shouldReplace} onChange={(e) => setShouldReplace(e.target.checked)} />
                         {shouldReplace && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-red-400">Replace Existing Shifts</span>
                         <span className="text-[8px] text-gray-500 uppercase tracking-tighter mt-0.5">Wipe all manual overrides for the dates in this file before import</span>
                      </div>
                   </label>
                </div>
              </motion.div>
            )
          )}

          {activeTab === 'paste' && (
            <div className="space-y-6">
              <div className="relative">
                <textarea
                  value={pasteText}
                  onChange={(e) => handlePaste(e.target.value)}
                  placeholder="Paste cells from Excel here... (Include header row)"
                  className="w-full h-48 bg-black/40 border border-white/10 rounded-3xl p-6 text-sm font-mono text-gray-300 focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                />
                <div className="absolute bottom-4 right-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60">Live TSV Engine Active</span>
                </div>
              </div>
              
              <div className="p-4 bg-white/2 border border-white/10 rounded-2xl">
                 <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${shouldReplace ? 'bg-emerald-500 border-emerald-500 shadow-lg' : 'border-white/20 bg-black/40'}`}>
                       <input type="checkbox" className="hidden" checked={shouldReplace} onChange={(e) => setShouldReplace(e.target.checked)} />
                       {shouldReplace && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-emerald-400">Synchronize Entire Matrix</span>
                       <span className="text-[8px] text-gray-500 uppercase tracking-tighter mt-0.5">Overwrite all existing data with these Excel values</span>
                    </div>
                 </label>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="p-8 border border-white/5 bg-white/[0.02] rounded-[32px] text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                  <ShieldAlert className="text-red-500" size={32} />
                </div>
                <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Smart Prediction System</h4>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed">Generates an optimized matrix based on operational flow.</p>
                <button onClick={handlePredict} className="mt-8 px-12 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">Generate AI Prediction</button>
              </div>
              {validationErrors.length > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest"><AlertCircle size={14} />Constraint Warnings</div>
                  <div className="max-h-24 overflow-y-auto text-[9px] text-amber-500/70 space-y-1">{validationErrors.map((err, i) => <div key={i}>• {err}</div>)}</div>
                </div>
              )}
            </div>
          )}

          {previewRows.length > 0 && (
            <div className="space-y-2">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Live Grid Preview</p>
                <div className="relative group/scroll bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
                    <table className="w-full text-left whitespace-nowrap table-auto min-w-max">
                      <thead>
                        <tr className="bg-muted text-gray-400 uppercase tracking-widest text-[9px]">
                          {previewHeaders.map((h, i) => <th key={i} className={`p-4 border-b border-border ${i === 0 ? 'sticky left-0 bg-muted z-20 min-w-[180px]' : 'min-w-[140px]'}`}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {previewRows.map((row, i) => {
                          const dateKey = row[0];
                          const dbDateOverrides = allOverrides[dateKey] || {};
                          return (
                            <tr key={i} className="text-gray-300 text-[10px]">
                              {row.map((val, j) => {
                                const displayVal = j === 0 ? val?.trim().replace(/,+/g, ', ') : cleanShift(val);
                                const staffName = previewHeaders[j];
                                const dbVal = (j > 0 && !shouldReplace) ? dbDateOverrides[staffName] : null;
                                const finalVal = displayVal || dbVal;
                                return (
                                  <td key={j} className={`p-3 ${j === 0 ? 'sticky left-0 bg-[#12121a] font-black text-white border-r border-white/5' : ''}`}>
                                    {j === 0 ? displayVal : (
                                      <div className="flex flex-col gap-1">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                                          finalVal === 'AM' ? 'bg-orange-500/10 text-orange-400' :
                                          finalVal === 'PM' ? 'bg-emerald-500/10 text-emerald-400' :
                                          finalVal === 'NT' ? 'bg-indigo-500/10 text-indigo-400' :
                                          finalVal === 'OFF' ? 'bg-red-500/10 text-red-500' :
                                          'bg-gray-500/10 text-gray-500'
                                        }`}>{finalVal || '-'}</span>
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}

          {error && <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs"><AlertCircle size={14} />{error}</div>}
        </div>

        <div className="p-8 border-t border-border bg-card">
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={onClose} className="flex-1 px-8 py-4 rounded-xl border border-border text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all text-center">Cancel</button>
              {activeTab === 'excel' || activeTab === 'paste' ? (
                <button onClick={handleProcess} disabled={activeTab === 'excel' ? !file : !parsedData} className="flex-[2] px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg disabled:opacity-50 transition-all">Execute Matrix Sync</button>
              ) : (
                <button onClick={handleApplyPrediction} disabled={!predictionResult} className="flex-[2] px-8 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg disabled:opacity-50 transition-all">Apply & Wipe Overrides</button>
              )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
