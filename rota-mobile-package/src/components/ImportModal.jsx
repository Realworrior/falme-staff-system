import React, { useState } from 'react';
import { format } from 'date-fns';
import Papa from 'papaparse';
import { Upload, FileText, CheckCircle2, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { STAFF_CONFIG, SOFASAFI_STAFF_CONFIG } from '../utils/scheduleGenerator';
import { predictMonthRota, validateRota } from '../utils/smartPredictor';

export function ImportModal({ isOpen, onClose, onImport, year, month, allOverrides = {}, activeBranch = 'betfalme' }) {
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

  if (!isOpen) return null;

  const normalizeDate = (raw) => {
    if (!raw) return null;
    const clean = raw.trim()
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/(\d+)(st|nd|rd|th)/i, '$1')
      .replace(/\s+/g, ' ');

    const isoMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (isoMatch) {
      const fullYear = parseInt(isoMatch[1]);
      const monthIdx = parseInt(isoMatch[2]) - 1;
      const day = parseInt(isoMatch[3]);
      const d = new Date(fullYear, monthIdx, day);
      if (!isNaN(d.getTime())) return format(d, 'yyyy-MM-dd');
    }

    const dmyMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
    if (dmyMatch) {
      let fullYear = parseInt(dmyMatch[3]);
      if (fullYear < 100) fullYear += 2000;
      const d = new Date(fullYear, parseInt(dmyMatch[2]) - 1, parseInt(dmyMatch[1]));
      if (!isNaN(d.getTime())) return format(d, 'yyyy-MM-dd');
    }

    const dayMatch = clean.match(/(?:[a-zA-Z]{2,10}|,|\s)*\s*(\d{1,2})$/i);
    if (dayMatch) {
      const dayNum = parseInt(dayMatch[1]);
      if (dayNum >= 1 && dayNum <= 31) {
        try {
          const d = new Date(year, month, dayNum);
          if (!isNaN(d.getTime())) return format(d, 'yyyy-MM-dd');
        } catch {}
      }
    }

    return null;
  };

  const cleanShift = (raw) => {
    if (!raw) return '';
    const s = raw.trim().toUpperCase();
    if (s.includes('OFF') || s === 'O' || s === 'X') return 'OFF';
    if (s.includes('NIGHT') || s.includes('NT') || s === 'N') return 'NT';
    if (s.includes('PM') || s === 'P') return 'PM';
    if (s.includes('AM') || s === 'A' || s.includes('DAY') || s.includes('MORNING')) return 'AM';
    return '';
  };

  const processMatrixRows = (rows) => {
    setError(null);
    setPredictionResult(null);
    setValidationErrors([]);

    if (!rows || rows.length < 2) {
      setError('Matrix must have at least 1 header row and 1 data row');
      return;
    }

    const header = rows[0].map(h => (h || '').trim());
    const dateIdx = header.findIndex(h => /date|day|time/i.test(h));
    const targetDateIdx = dateIdx >= 0 ? dateIdx : 0;

    const staffList = activeBranch === 'sofasafi' ? SOFASAFI_STAFF_CONFIG : STAFF_CONFIG;
    const staffColMap = {};

    staffList.forEach(s => {
      const idx = header.findIndex(h => h.toLowerCase() === s.name.toLowerCase());
      if (idx >= 0) staffColMap[s.name] = idx;
    });

    const result = {};
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const dateStr = normalizeDate(row[targetDateIdx]);
      if (!dateStr) continue;

      result[dateStr] = {};
      Object.entries(staffColMap).forEach(([name, colIdx]) => {
        const shift = cleanShift(row[colIdx]);
        if (shift) result[dateStr][name] = shift;
      });
    }

    if (Object.keys(result).length === 0) {
      setError('No valid dates and shifts recognized in table');
      return;
    }

    setParsedData(result);
    setPreviewHeaders(header);
    setPreviewRows(rows.slice(1, 6));
  };

  const handleFileUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);

    Papa.parse(f, {
      skipEmptyLines: true,
      complete: (results) => {
        processMatrixRows(results.data);
      },
      error: () => setError('CSV parsing error')
    });
  };

  const handleApplyImport = () => {
    const dataToUse = predictionResult || parsedData;
    if (!dataToUse) return;
    onImport?.(dataToUse, shouldReplace);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#131520] border border-white/10 rounded-[28px] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl text-[#F4F5F1]">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div>
            <h3 className="text-lg font-['Space_Grotesk'] font-bold text-white">Import Shift Rota</h3>
            <p className="text-xs text-[#8B8E97]">Import CSV or paste matrix for {activeBranch}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-[#8B8E97] hover:text-white transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Upload Zone */}
        <div className="border-2 border-dashed border-white/10 hover:border-[#00D66B]/50 rounded-2xl p-8 text-center transition-colors cursor-pointer relative bg-[#0E0E12]/50">
          <input
            type="file"
            accept=".csv, .txt"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className="w-8 h-8 text-[#00D66B] mx-auto mb-3" />
          <p className="text-xs font-semibold text-white mb-1">Click to select or drag CSV file here</p>
          <p className="text-[11px] text-[#54565F]">Format: Date, Staff1, Staff2, Staff3...</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {parsedData && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#00D66B] flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>{Object.keys(parsedData).length} days recognized</span>
              </span>
              <label className="flex items-center gap-2 text-xs text-[#8B8E97] cursor-pointer">
                <input
                  type="checkbox"
                  checked={shouldReplace}
                  onChange={e => setShouldReplace(e.target.checked)}
                  className="rounded accent-[#00D66B]"
                />
                <span>Replace all existing shifts</span>
              </label>
            </div>

            {/* Preview Table */}
            <div className="overflow-x-auto max-h-48 border border-white/[0.06] rounded-xl">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#0E0E12] text-[#8B8E97]">
                  <tr>
                    {previewHeaders.slice(0, 8).map((h, i) => (
                      <th key={i} className="py-2 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {previewRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.slice(0, 8).map((col, cIdx) => (
                        <td key={cIdx} className="py-2 px-3 text-[#F4F5F1]">{col}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#8B8E97] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyImport}
            disabled={!parsedData}
            className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#00D66B] text-[#04170D] hover:brightness-105 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-lg"
          >
            Apply Import
          </button>
        </div>
      </div>
    </div>
  );
}
