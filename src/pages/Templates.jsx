import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Sparkles, Copy, Check, ChevronDown, ChevronRight, 
  X, Zap, Languages, Heart, MessageSquare, RotateCcw, 
  Filter, LayoutGrid, Terminal, Trash2, Edit3, Save, Trash
} from 'lucide-react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Tooltip
} from '@mui/material';

import { useSupabaseData } from '../context/SupabaseDataContext';
import { useToast } from '../context/ToastContext';
import { analyzeClientMessage } from '../utils/aiMatcher';
import KeywordHighlighter from '../components/KeywordHighlighter';

// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const S = {
  bg: '#0a0a10',
  surface: '#111118',
  card: '#16161f',
  cardHover: '#1c1c28',
  border: '#1e1e2c',
  borderHover: '#2e2e42',
  orange: '#f97316',
  orangeDim: '#ea580c',
  orangeGlow: 'rgba(249,115,22,0.15)',
  orangeText: '#fb923c',
  textPrimary: '#e8eaf0',
  textSecondary: '#8b93a7',
  textMuted: '#4b5363',
  green: '#22c55e',
  red: '#ef4444',
  purple: '#8b5cf6',
  yellow: '#eab308',
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function CopyBtn({ text, id, copiedId, onCopy, size = 'md' }) {
  const isCopied = copiedId === id;
  const pad = size === 'sm' ? '6px 10px' : '8px 14px';
  return (
    <button
      onClick={() => onCopy(text, id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: pad, borderRadius: 10,
        background: isCopied ? S.green : S.orange,
        color: '#fff', border: 'none', cursor: 'pointer',
        fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap',
        transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.05em',
        flexShrink: 0,
      }}
    >
      {isCopied ? <Check size={13} /> : <Copy size={13} />}
      {isCopied ? 'Copied' : 'Copy Response'}
    </button>
  );
}

function ResponseCard({ item, copiedId, onCopy, highlight = '' }) {
  const [expanded, setExpanded] = useState(false);
  const [activeType, setActiveType] = useState('Standard');

  const responses = item.responses || [];
  const activeResp = responses.find(r => r.type === activeType) || responses[0] || { text: '' };
  
  const copyId = `${item.title}-${activeType}`;

  return (
    <div style={{
      border: `1px solid ${expanded ? S.borderHover : S.border}`,
      borderRadius: 12, overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      background: expanded ? S.cardHover : S.card,
      boxShadow: expanded ? '0 10px 30px -10px rgba(0,0,0,0.5)' : 'none',
    }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          gap: 12, padding: '14px 18px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: S.textPrimary, textAlign: 'left',
        }}
      >
        <motion.span 
          animate={{ rotate: expanded ? 90 : 0 }}
          style={{ color: expanded ? S.orangeText : S.textMuted, flexShrink: 0 }}
        >
          <ChevronRight size={14} />
        </motion.span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: S.textPrimary }}>
          {item.title}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {responses.map(r => (
            <div key={r.type} 
              className={r.type === 'Standard' ? 'tour-type-standard' : r.type === 'High Empathy' ? 'tour-type-empathy' : 'tour-type-alt'}
              style={{ 
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
                color: r.type === 'Standard' ? '#4080e8' : r.type === 'High Empathy' ? '#e84080' : S.orangeText,
                background: 'rgba(255,255,255,0.03)', padding: '3px 8px', borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              {r.type === 'Standard' ? <Shield size={8} /> : r.type === 'High Empathy' ? <Heart size={8} /> : <Zap size={8} />}
              {r.type[0]}
            </div>
          ))}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 18px 18px', borderTop: `1px solid ${S.border}` }}>
              {/* Tabs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '16px 0 16px' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {responses.map(r => (
                    <button
                      key={r.type}
                      onClick={() => setActiveType(r.type)}
                      style={{
                        padding: '8px 16px', borderRadius: 10, border: `1px solid ${activeType === r.type ? S.orange : S.border}`,
                        background: activeType === r.type ? S.orangeGlow : 'rgba(255,255,255,0.02)',
                        color: activeType === r.type ? S.orangeText : S.textMuted,
                        fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                        transition: 'all 0.2s',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {r.type === 'High Empathy' ? <Heart size={14} /> : r.type === 'Standard' ? <Shield size={14} /> : <Zap size={14} />}
                      {r.type === 'High Empathy' ? 'Soft Tone' : r.type === 'Standard' ? 'Direct Tone' : 'Variant'}
                    </button>
                  ))}
                </div>
                
                {/* Tone Description */}
                <div style={{ 
                  fontSize: 10, color: S.textMuted, fontWeight: 500, fontStyle: 'italic',
                  paddingLeft: 4, display: 'flex', alignItems: 'center', gap: 6 
                }}>
                  <div className="w-1 h-1 rounded-full bg-orange-500/50" />
                  {activeType === 'Standard' && "Standard professional response. Best for neutral inquiries and general procedures."}
                  {activeType === 'High Empathy' && "Softened language with emotional validation. Use for distressed or frustrated clients."}
                  {activeType !== 'Standard' && activeType !== 'High Empathy' && `Specialized variation: ${activeType}. Best for specific edge cases.`}
                </div>
              </div>

              {/* Text Area */}
              <div style={{
                background: '#08080c', border: `1px solid ${S.border}`,
                borderRadius: 12, padding: '16px', marginBottom: 12,
                position: 'relative'
              }}>
                <div style={{ fontSize: 13, color: S.textSecondary, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  <KeywordHighlighter text={activeResp.text} />
                </div>
              </div>

              {/* Footer info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ spaceY: 8 }}>
                   {item.triggers && item.triggers.length > 0 && (
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 400 }}>
                        {item.triggers.map((t, i) => (
                          <span key={i} style={{ fontSize: 10, color: S.textMuted, fontStyle: 'italic' }}>#{t}</span>
                        ))}
                     </div>
                   )}
                </div>
                <CopyBtn text={activeResp.text} id={copyId} copiedId={copiedId} onCopy={onCopy} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TEMPLATES COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Templates = () => {
  const { templates: data, loading, error, isReady, actions } = useSupabaseData();
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  
  // AI Assist State
  const [aiInput, setAiInput] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ category: '', title: '', standardText: '', empathyText: '' });

  const handleCopy = useCallback((text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  }, [showToast]);

  const handleAnalyze = useCallback(() => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setTimeout(() => {
      const result = analyzeClientMessage(aiInput, data);
      setAiResult(result);
      setAiLoading(false);
    }, 400);
  }, [aiInput, data]);

  const handleCreate = async () => {
    if (!newTemplate.category || !newTemplate.title || !newTemplate.standardText) {
      showToast('Please fill required fields', 'error');
      return;
    }

    const responses = [
      { type: 'Standard', text: newTemplate.standardText }
    ];
    if (newTemplate.empathyText) {
      responses.push({ type: 'High Empathy', text: newTemplate.empathyText });
    }

    const success = await actions.createRecord('supportTemplates', {
      category: newTemplate.category,
      templates: [{
        title: newTemplate.title,
        responses: responses,
        triggers: [newTemplate.title.toLowerCase()]
      }]
    });

    if (success) {
      showToast('Template deployed!', 'success');
      setModalOpen(false);
      setNewTemplate({ category: '', title: '', standardText: '', empathyText: '' });
    }
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();
    return data.map(cat => ({
      ...cat,
      templates: cat.templates.filter(t => 
        t.title.toLowerCase().includes(q) ||
        (t.triggers || []).some(tr => tr.toLowerCase().includes(q)) ||
        t.responses.some(r => r.text.toLowerCase().includes(q))
      )
    })).filter(cat => cat.templates.length > 0);
  }, [data, searchQuery]);

  if (loading.templates && !isReady) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-orange-500">
        <RotateCcw size={40} />
      </motion.div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Syncing Intelligence Matrix</p>
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      color: S.textPrimary, 
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '24px'
    }}>
      
      {/* HEADER SECTION */}
      <div style={{ maxWidth: 1400, margin: '0 auto', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16,
              background: `linear-gradient(135deg, ${S.orange}, #dc2626)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px -6px rgba(249,115,22,0.4)'
            }}>
              <Zap size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>Templates</h1>
              <p style={{ fontSize: 11, fontWeight: 600, color: S.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '4px 0 0' }}>
                High-Performance Support System
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
             <button 
              onClick={() => setModalOpen(true)}
              style={{
                background: S.orange, color: '#fff', border: 'none',
                borderRadius: 12, padding: '10px 20px', fontSize: 12, fontWeight: 800,
                display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(249,115,22,0.2)', textTransform: 'uppercase'
              }}
            >
              <Plus size={16} strokeWidth={3} /> New Template
            </button>
          </div>
        </div>

        {/* AI MATCHER PANEL */}
        <div className="tour-template-ai" style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
          <div style={{
            background: S.card, border: `1px solid ${S.orange}40`,
            borderRadius: 20, overflow: 'hidden', transition: 'border-color 0.2s',
            boxShadow: `0 0 30px ${S.orange}10`,
          }}>
            <textarea
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              placeholder="Paste the client's message here to analyze emotion and find matching templates..."
              style={{
                width: '100%', minHeight: 160, padding: '24px',
                background: 'transparent', border: 'none', outline: 'none', resize: 'none',
                color: S.textPrimary, fontSize: 15, lineHeight: 1.6,
                fontFamily: 'inherit', caretColor: S.orange,
              }}
            />
            <div style={{ padding: '0 24px 16px', marginTop: -8 }}>
              <p style={{ fontSize: 10, color: S.red, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, opacity: 0.8 }}>
                ⚠️ AI is still under training. Some response matches may not be 100% accurate. Please verify before sending.
              </p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 24px', borderTop: `1px solid ${S.border}`, background: 'rgba(0,0,0,0.2)'
            }}>
              <span style={{ fontSize: 11, color: S.textMuted, fontWeight: 500 }}>
                Supports English, Swahili & Sheng · Detects Sentiment
              </span>
              <button
                onClick={handleAnalyze}
                disabled={!aiInput.trim() || aiLoading}
                style={{
                  background: S.orange, color: '#fff', border: 'none', borderRadius: 10,
                  padding: '10px 24px', fontSize: 12, fontWeight: 800,
                  cursor: aiInput.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                  textTransform: 'uppercase'
                }}
              >
                {aiLoading ? <RotateCcw size={14} className="animate-spin" /> : <Zap size={14} />}
                {aiLoading ? 'Analyzing...' : 'Analyze Client Msg'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {aiResult && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Emotion Indicator */}
                <div style={{ 
                  display: 'flex', gap: 12, padding: '12px 16px', borderRadius: 12, 
                  background: `${aiResult.emotion.color}10`, border: `1px solid ${aiResult.emotion.color}20`
                }}>
                  <span style={{ fontSize: 20 }}>{aiResult.emotion.emoji}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: aiResult.emotion.color, textTransform: 'uppercase' }}>
                      {aiResult.emotion.label} Detected
                    </div>
                    <div style={{ fontSize: 11, color: S.textMuted }}>
                      Language: {aiResult.detectedLanguage.toUpperCase()} · Suggesting {aiResult.suggestedTone} tone
                    </div>
                  </div>
                </div>

                {/* AI Suggestion */}
                {aiResult.aiSuggestion && (
                  <div style={{ background: `${S.purple}10`, border: `1px solid ${S.purple}30`, borderRadius: 16, padding: 20, marginTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <Sparkles size={16} color={S.purple} />
                      <span style={{ fontSize: 12, fontWeight: 800, color: S.purple, textTransform: 'uppercase' }}>AI Generated Contextual Response</span>
                    </div>
                    <div style={{ background: '#000', padding: 16, borderRadius: 12, marginBottom: 12, fontSize: 14, lineHeight: 1.6, color: '#ccc' }}>
                      {aiResult.aiSuggestion}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <CopyBtn text={aiResult.aiSuggestion} id="ai-gen" copiedId={copiedId} onCopy={handleCopy} />
                    </div>
                  </div>
                )}

                {/* Matches */}
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: S.textMuted, textTransform: 'uppercase', marginBottom: 12 }}>
                    {aiResult.matches.length} Template Matches
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {aiResult.matches.map((m, i) => (
                      <ResponseCard key={i} item={m.item} copiedId={copiedId} onCopy={handleCopy} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BROWSER SECTION */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
             <h2 style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0, color: S.textPrimary }}>Browse Categories</h2>
             <div style={{ flex: 1, height: 1, background: S.border }} />
          </div>

          {/* SEARCH BAR */}
          <div className="tour-template-search" style={{ position: 'relative', marginBottom: 32 }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: S.orange }} />
            <input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword, title, or trigger..."
              style={{
                width: '100%', background: S.surface, border: `1px solid ${S.orange}30`,
                borderRadius: 16, padding: '18px 18px 18px 52px', color: S.textPrimary,
                fontSize: 14, outline: 'none', transition: 'all 0.2s',
                boxShadow: `0 4px 20px rgba(0,0,0,0.4)`
              }}
            />
          </div>

          {/* BROWSE LIST */}
          <div className="tour-template-browse grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-12">
            {filteredData.map((cat, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 20 }}>{cat.category.split(' ')[0]}</span>
                  <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: S.textSecondary, margin: 0 }}>
                    {cat.category}
                  </h3>
                  <div style={{ flex: 1, height: 1, background: S.border }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {cat.templates.map((tpl, tIdx) => (
                    <ResponseCard key={tIdx} item={tpl} copiedId={copiedId} onCopy={handleCopy} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ 
        style: { background: S.surface, borderRadius: 24, border: `1px solid ${S.border}`, color: '#fff' } 
      }}>
        <DialogTitle style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: 16, letterSpacing: '0.05em', padding: '24px 32px', borderBottom: `1px solid ${S.border}` }}>
          Deploy New Template
        </DialogTitle>
        <DialogContent style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <TextField 
              label="Category" 
              fullWidth 
              variant="outlined"
              placeholder="e.g., ⚽ SPORTS BET"
              value={newTemplate.category} 
              onChange={e => setNewTemplate({ ...newTemplate, category: e.target.value })}
              InputProps={{ style: { color: '#fff', background: '#000', borderRadius: 12 } }}
              InputLabelProps={{ style: { color: S.textMuted } }}
            />
            <TextField 
              label="Template Title" 
              fullWidth 
              variant="outlined"
              value={newTemplate.title} 
              onChange={e => setNewTemplate({ ...newTemplate, title: e.target.value })}
              InputProps={{ style: { color: '#fff', background: '#000', borderRadius: 12 } }}
              InputLabelProps={{ style: { color: S.textMuted } }}
            />
            <TextField 
              label="Standard Response" 
              fullWidth 
              multiline rows={3}
              value={newTemplate.standardText} 
              onChange={e => setNewTemplate({ ...newTemplate, standardText: e.target.value })}
              InputProps={{ style: { color: '#fff', background: '#000', borderRadius: 12 } }}
              InputLabelProps={{ style: { color: S.textMuted } }}
            />
            <TextField 
              label="High Empathy Variation" 
              fullWidth 
              multiline rows={3}
              value={newTemplate.empathyText} 
              onChange={e => setNewTemplate({ ...newTemplate, empathyText: e.target.value })}
              InputProps={{ style: { color: '#fff', background: '#000', borderRadius: 12 } }}
              InputLabelProps={{ style: { color: S.textMuted } }}
            />
          </div>
        </DialogContent>
        <DialogActions style={{ padding: '24px 32px', borderTop: `1px solid ${S.border}` }}>
          <button 
            onClick={() => setModalOpen(false)} 
            style={{ background: 'transparent', border: 'none', color: S.textMuted, fontWeight: 700, cursor: 'pointer', padding: '10px 20px', textTransform: 'uppercase' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate} 
            style={{ 
              background: S.orange, color: '#fff', border: 'none', borderRadius: 12, 
              padding: '12px 32px', fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase',
              boxShadow: '0 8px 20px -6px rgba(249,115,22,0.4)'
            }}
          >
            Deploy
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Templates;
