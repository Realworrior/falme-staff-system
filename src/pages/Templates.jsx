import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Sparkles, Copy, Check, ChevronDown, ChevronRight, 
  X, Zap, Languages, Heart, MessageSquare, RotateCcw, Shield,
  Filter, LayoutGrid, Terminal, Trash2, Edit3, Save, Trash
} from 'lucide-react';
import { 
  Dialog,
  DialogTitle,
  DialogContent, 
  DialogActions, 
  TextField,
  Tooltip,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';

import { useSupabaseData } from '../context/SupabaseDataContext';
import { useToast } from '../context/ToastContext';
import { analyzeClientMessage } from '../utils/aiMatcher';
import KeywordHighlighter from '../components/KeywordHighlighter';

// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const S = {
  bg: 'var(--background)',
  surface: 'var(--card)',
  card: 'var(--card)',
  cardHover: 'var(--secondary)',
  border: 'var(--border)',
  borderHover: 'var(--ring)',
  primary: 'var(--accent)',
  orange: 'var(--brand-orange)',
  orangeDim: '#ea580c',
  orangeGlow: 'transparent',
  orangeText: 'var(--brand-orange)',
  textPrimary: 'var(--foreground)',
  textSecondary: 'var(--muted-foreground)',
  textMuted: '#64748b',
  green: 'var(--brand-emerald)',
  red: 'var(--brand-red)',
  purple: 'var(--brand-purple)',
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

function ResponseCard({ item, copiedId, onCopy, expanded, onToggle }) {
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
      boxShadow: 'none',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          gap: 12, padding: '14px 18px',
          background: 'transparent', border: 'none', cursor: onToggle.toString() === '() => {}' ? 'default' : 'pointer',
          color: S.textPrimary, textAlign: 'left',
        }}
      >
        <motion.span 
          animate={{ rotate: expanded ? 90 : 0 }}
          style={{ 
            color: expanded ? S.orangeText : S.textMuted, 
            flexShrink: 0,
            opacity: onToggle.toString() === '() => {}' ? 0 : 1,
            pointerEvents: onToggle.toString() === '() => {}' ? 'none' : 'auto'
          }}
        >
          <ChevronRight size={14} />
        </motion.span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: S.textPrimary }}>
          {item.title}
        </span>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', marginLeft: 'auto' }}>
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
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
                background: (activeType?.toLowerCase().includes('swahili') || activeType?.toLowerCase().includes('slang')) ? 'rgba(168, 85, 247, 0.05)' : '#08080c', 
                border: (activeType?.toLowerCase().includes('swahili') || activeType?.toLowerCase().includes('slang')) ? '1px solid rgba(168, 85, 247, 0.3)' : `1px solid ${S.border}`,
                borderRadius: 12, padding: '16px', marginBottom: 12,
                position: 'relative'
              }}>
                {(activeType?.toLowerCase().includes('swahili') || activeType?.toLowerCase().includes('slang')) && (
                  <div style={{ position: 'absolute', top: -10, right: 12, background: '#a855f7', color: '#fff', fontSize: 8, fontWeight: 900, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                    Localized Variation
                  </div>
                )}
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
  
  // Expansion Logic: Max 3 cards, FIFO
  const [expandedIds, setExpandedIds] = useState([]);
  const [isNewCategory, setIsNewCategory] = useState(false);

  const availableCategories = useMemo(() => {
    if (!data) return [];
    return data.map(d => d.category).sort();
  }, [data]);

  const toggleExpand = useCallback((id) => {
    setExpandedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      const next = [...prev, id];
      if (next.length > 3) {
        return next.slice(1); // Remove the oldest (first) item
      }
      return next;
    });
  }, []);

  const handleCopy = useCallback((text, id) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
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

    setAiLoading(true);
    try {
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
        setIsNewCategory(false);
        actions.refreshAll();
      } else {
        showToast('Deployment failed.', 'error');
      }
    } catch (err) {
      showToast('Critical error during deployment.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleConsolidate = async () => {
    if (!data || data.length === 0) return;
    setAiLoading(true);
    try {
      const consolidatedMap = {};
      data.forEach(record => {
        let rawName = record.category || 'General';
        const upper = rawName.toUpperCase();
        if (upper.includes('SECURITY') || upper.includes('ACCOUNT MANAGEMENT')) rawName = '👤 ACCOUNT MANAGEMENT';
        else if (upper.includes('WITHDRAWAL')) rawName = '💸 WITHDRAWALS & TRANSACTIONS';
        else if (upper.includes('DEPOSIT')) rawName = '💰 DEPOSITS — M-PESA';
        else if (upper.includes('SPORTS') || upper.includes('DISPUTE') || upper.includes('LIVE BETTING')) rawName = '⚽ SPORTS BETTING';
        else if (upper.includes('GAMES') || upper.includes('CASINO')) rawName = '🎰 CASINO GAMES';
        else if (upper.includes('HARD CASES')) rawName = '⚖️ HARD CASES';
        else if (upper.includes('RESPONSIBLE') || upper.includes('THREATENING')) rawName = '🛡️ RESPONSIBLE GAMING';
        else if (upper.includes('SYSTEM') || upper.includes('UPGRADE') || upper.includes('MAINTENANCE')) rawName = '⚙️ SYSTEM MAINTENANCE';
        else if (upper.includes('CASHBACK')) rawName = '🔄 CASHBACK — 10%';

        const normalizedKey = rawName.replace(/\p{Emoji}/gu, '').trim().toUpperCase();
        if (!consolidatedMap[normalizedKey]) consolidatedMap[normalizedKey] = { category: rawName, templates: [] };
        
        record.templates.forEach(tpl => {
          const exists = consolidatedMap[normalizedKey].templates.some(t => t.title.toLowerCase() === tpl.title.toLowerCase());
          if (!exists) consolidatedMap[normalizedKey].templates.push(tpl);
        });
      });
      const cleanList = Object.values(consolidatedMap);
      await actions.setAllData('supportTemplates', cleanList);
      showToast(`Consolidated into ${cleanList.length} categories!`, 'success');
      actions.refreshAll();
    } catch (err) {
      showToast('Cleanup failed.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeploySystemPack = async () => {
    const pack = [
      {
        category: '💸 WITHDRAWALS & TRANSACTIONS',
        templates: [{
          title: 'Mpesa Delay (Withdrawals)',
          responses: [
            { type: 'Standard', text: "We are currently experiencing delays with Mpesa withdrawals. Our technical team is working with the provider to resolve this as quickly as possible. We apologize for the inconvenience." },
            { type: 'High Empathy', text: "I completely understand how frustrating it is to wait for your funds. We're seeing some delays with Mpesa withdrawals right now, and our team is already on it. We appreciate your patience while we get this sorted for you!" }
          ],
          triggers: ['mpesa', 'withdrawal', 'delay', 'pending', 'funds', 'withdraw']
        }]
      },
      {
        category: '💰 DEPOSITS — M-PESA',
        templates: [{
          title: 'Mpesa Delay (Deposits)',
          responses: [
            { type: 'Standard', text: "Please be informed that there are delays in processing Mpesa deposits. If your deposit hasn't reflected yet, please share your transaction code (MPESA Message) so we can manually verify and update your balance." },
            { type: 'High Empathy', text: "I'm sorry to hear your deposit hasn't reflected yet. Mpesa is currently having some slight delays. If you can share the Mpesa transaction message, I'll be happy to check that for you right now and help speed things up!" }
          ],
          triggers: ['mpesa', 'deposit', 'delay', 'not reflected', 'stuck', 'message']
        }]
      },
      {
        category: '🎰 CASINO GAMES',
        templates: [{
          title: 'Global Aviator Failure',
          responses: [
            { type: 'Standard', text: "Aviator is currently unavailable globally due to a technical issue with the game provider. We are monitoring the situation and will restore access as soon as the provider resolves the issue." },
            { type: 'High Empathy', text: "I'm so sorry, Aviator is currently down for everyone because of an issue on the game provider's side. We know how much you enjoy it, and we're working closely with them to get it back up for you as soon as possible!" }
          ],
          triggers: ['aviator', 'failed', 'down', 'broken', 'unavailable', 'global']
        }]
      },
      {
        category: '🔄 CASHBACK — 10%',
        templates: [{
          title: 'Daily Cashback Reset Window',
          responses: [
            { type: 'Standard', text: "Our daily cashback calculation includes a 10-minute system reset window between 8:30 PM and 8:40 PM. Please note that any deposits made within this specific window are not captured in the current 24-hour cycle to prevent synchronization errors during the daily reset." },
            { type: 'High Empathy', text: "I'd like to clarify our cashback timing for you! Our system performs a daily reset between 8:30 PM and 8:40 PM. Because of this, any deposits made in those 10 minutes aren't always counted in the immediate 24-hour cycle as the system refreshes. We appreciate your patience while we ensure everything is processed accurately!" }
          ],
          triggers: ['cashback', 'not counted', 'time', 'reset', 'calculation', 'window', '8:30', '8.30']
        }]
      }
    ];

    setAiLoading(true);
    try {
      const currentData = data || [];
      const consolidatedMap = {};
      currentData.forEach(r => {
        if (!consolidatedMap[r.category]) consolidatedMap[r.category] = { category: r.category, templates: [...r.templates] };
        else {
          r.templates.forEach(t => {
            if (!consolidatedMap[r.category].templates.some(et => et.title === t.title)) consolidatedMap[r.category].templates.push(t);
          });
        }
      });
      pack.forEach(item => {
        if (consolidatedMap[item.category]) {
          item.templates.forEach(newTpl => {
            const idx = consolidatedMap[item.category].templates.findIndex(t => t.title.toLowerCase() === newTpl.title.toLowerCase());
            if (idx !== -1) consolidatedMap[item.category].templates[idx] = newTpl;
            else consolidatedMap[item.category].templates.push(newTpl);
          });
        } else consolidatedMap[item.category] = item;
      });
      const cleanList = Object.values(consolidatedMap);
      await actions.setAllData('supportTemplates', cleanList);
      showToast(`Synchronized ${cleanList.length} categories!`, 'success');
      actions.refreshAll();
    } catch (err) {
      showToast('Sync failed.', 'error');
    } finally {
      setAiLoading(false);
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
    <div style={{ minHeight: '100vh', color: S.textPrimary, fontFamily: 'Inter, system-ui, sans-serif', padding: '24px' }}>
      <div style={{ maxWidth: 1600, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: S.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 10px 30px ${S.primary}30` }}>
                <Zap size={28} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>Templates</h1>
                <p style={{ fontSize: 12, fontWeight: 600, color: S.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '4px 0 0' }}>Support Intelligence Matrix</p>
              </div>
            </div>
            <a 
              href="https://github.com/Realworrior/falme-staff-system/archive/refs/heads/master.zip"
              target="_blank" rel="noopener noreferrer"
              style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(59,130,246,0.1) 100%)", color: S.green, border: `1px solid ${S.green}30`, borderRadius: 12, padding: '12px 24px', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
            >
              <img src="/favicon.svg" alt="X" style={{ width: 14, height: 14 }} /> Download Extension
            </a>
          </div>

          <div className="tour-template-ai" style={{ marginBottom: 60 }}>
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '0 8px' }}>
                <div style={{ padding: '4px 10px', borderRadius: 8, background: `${S.orange}20`, border: `1px solid ${S.orange}40`, color: S.orangeText, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={10} /> AI Deep Matcher
                </div>
                {aiLoading && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ fontSize: 10, color: S.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>Analyzing...</motion.span>}
              </div>

              <div style={{ background: S.surface, border: `1px solid ${aiInput.length > 20 ? S.primary : S.border}`, borderRadius: 20, padding: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '8px 12px' }}>
                  <Search size={18} color={aiInput.length > 20 ? S.orange : S.textMuted} style={{ marginTop: 12 }} />
                  <textarea
                    value={aiInput}
                    onChange={e => { setAiInput(e.target.value); setSearchQuery(e.target.value); }}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && aiInput.length > 10) { e.preventDefault(); handleAnalyze(); } }}
                    placeholder="Ask me to find a template or paste a client's message..."
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 16, fontWeight: 500, resize: 'none', minHeight: aiInput.length > 60 ? 120 : 44, paddingTop: 8, lineHeight: 1.5 }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {aiInput && <button onClick={() => { setAiInput(''); setSearchQuery(''); setAiResult(null); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: S.textMuted, cursor: 'pointer', padding: 8, borderRadius: 10 }}><X size={16} /></button>}
                    <button onClick={handleAnalyze} disabled={aiInput.length < 10 || aiLoading} style={{ background: aiInput.length >= 10 ? S.primary : 'rgba(255,255,255,0.03)', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 24px', fontSize: 12, fontWeight: 900, cursor: aiInput.length >= 10 ? 'pointer' : 'default', textTransform: 'uppercase' }}>
                      {aiLoading ? <RotateCcw size={14} className="animate-spin" /> : <Sparkles size={14} />} Analyze
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {aiResult && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <div style={{ padding: '16px', borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${aiResult.emotion.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{aiResult.emotion.emoji}</div>
                      <div><div style={{ fontSize: 10, fontWeight: 800, color: S.textMuted, textTransform: 'uppercase' }}>Emotion</div><div style={{ fontSize: 13, fontWeight: 800, color: aiResult.emotion.color }}>{aiResult.emotion.label}</div></div>
                    </div>
                    <div style={{ padding: '16px', borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${S.purple}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Languages size={18} color={S.purple} /></div>
                      <div><div style={{ fontSize: 10, fontWeight: 800, color: S.textMuted, textTransform: 'uppercase' }}>Language</div><div style={{ fontSize: 13, fontWeight: 800, color: S.purple }}>{aiResult.detectedLanguage.toUpperCase()}</div></div>
                    </div>
                  </div>
                  {aiResult.aiSuggestion && (
                    <div style={{ background: S.surface, border: `1px solid ${S.purple}30`, borderRadius: 24, padding: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <span style={{ fontSize: 13, fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>AI Recommendation</span>
                        <CopyBtn text={aiResult.aiSuggestion} id="ai-gen" copiedId={copiedId} onCopy={handleCopy} size="sm" />
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: 20, fontSize: 16, lineHeight: 1.7, color: '#e5e7eb' }}>{aiResult.aiSuggestion}</div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>{searchQuery ? 'Search Results' : 'Library'}</h2>
              <div style={{ flex: 1, height: 1, background: S.border }} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {filteredData.map((cat, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', borderRadius: 24, padding: 24, border: `1px solid ${S.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 900, textTransform: 'uppercase', color: S.textPrimary, margin: 0 }}>{cat.category}</h3>
                    <button onClick={() => actions.deleteRecord('supportTemplates', cat.id).then(() => actions.refreshAll())} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={12} /></button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {cat.templates.map((t, tIdx) => (
                      <ResponseCard key={tIdx} item={t} copiedId={copiedId} onCopy={handleCopy} expanded={expandedIds.includes(`${cat.category}-${t.title}`)} onToggle={() => toggleExpand(`${cat.category}-${t.title}`)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 24, padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: S.textMuted, textTransform: 'uppercase', marginBottom: 20 }}>System Administration</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={() => setModalOpen(true)} style={{ background: S.orange, color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 12, fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}><Plus size={18} strokeWidth={3} /> New Template</button>
              <div style={{ height: 1, background: S.border, margin: '8px 0' }} />
              <button onClick={handleConsolidate} disabled={aiLoading} style={{ background: 'rgba(255,255,255,0.03)', color: '#fff', border: `1px solid ${S.border}`, borderRadius: 12, padding: '12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Trash2 size={14} /> Cleanup Library</button>
              <button onClick={handleDeploySystemPack} disabled={aiLoading} style={{ background: 'rgba(249,115,22,0.05)', color: S.orangeText, border: `1px solid ${S.orange}20`, borderRadius: 12, padding: '12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Terminal size={14} /> Deploy Failure Pack</button>
            </div>
          </div>
          <div style={{ padding: 20, background: 'rgba(16,185,129,0.05)', borderRadius: 24, border: '1px solid rgba(16,185,129,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}><Zap size={16} color={S.green} /><span style={{ fontSize: 12, fontWeight: 900, color: S.green, textTransform: 'uppercase' }}>Extension Linked</span></div>
            <p style={{ fontSize: 11, color: S.textMuted, margin: 0, lineHeight: 1.6 }}>Your AI Injector extension is directly connected to this database. Updates here are immediate.</p>
          </div>
        </div>
      </div>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ style: { background: S.surface, borderRadius: 24, border: `1px solid ${S.border}`, color: '#fff' } }}>
        <DialogTitle style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: 16, padding: '24px 32px' }}>Deploy Template</DialogTitle>
        <DialogContent style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <FormControl fullWidth><InputLabel style={{ color: S.textMuted }}>Category</InputLabel><Select label="Category" value={isNewCategory ? "NEW" : newTemplate.category} onChange={e => { if (e.target.value === "NEW") { setIsNewCategory(true); setNewTemplate({ ...newTemplate, category: "" }); } else { setIsNewCategory(false); setNewTemplate({ ...newTemplate, category: e.target.value }); } }} style={{ color: '#fff', background: '#000', borderRadius: 12 }}>{availableCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}<MenuItem value="NEW" style={{ color: S.orangeText }}>+ NEW CATEGORY</MenuItem></Select></FormControl>
            {isNewCategory && <TextField label="New Category Name" fullWidth variant="outlined" value={newTemplate.category} onChange={e => setNewTemplate({ ...newTemplate, category: e.target.value })} InputProps={{ style: { color: '#fff', background: '#000', borderRadius: 12 } }} InputLabelProps={{ style: { color: S.textMuted } }} autoFocus />}
            <TextField label="Title" fullWidth variant="outlined" value={newTemplate.title} onChange={e => setNewTemplate({ ...newTemplate, title: e.target.value })} InputProps={{ style: { color: '#fff', background: '#000', borderRadius: 12 } }} InputLabelProps={{ style: { color: S.textMuted } }} />
            <TextField label="Response" fullWidth multiline rows={4} value={newTemplate.standardText} onChange={e => setNewTemplate({ ...newTemplate, standardText: e.target.value })} InputProps={{ style: { color: '#fff', background: '#000', borderRadius: 12 } }} InputLabelProps={{ style: { color: S.textMuted } }} />
          </div>
        </DialogContent>
        <DialogActions style={{ padding: '24px 32px' }}>
          <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', color: S.textMuted, fontWeight: 700, cursor: 'pointer' }}>CANCEL</button>
          <button onClick={handleCreate} style={{ background: S.orange, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 32px', fontWeight: 900, cursor: 'pointer' }}>DEPLOY</button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Templates;
