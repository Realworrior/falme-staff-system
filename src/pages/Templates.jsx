import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Sparkles, Copy, Check, ChevronDown, ChevronRight, 
  X, Zap, Languages, Heart, MessageSquare, RotateCcw, Shield,
  Filter, LayoutGrid, Terminal, Trash2, Edit3, Save, Trash, Download
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
  bg: '#050505',
  surface: '#0a0a0c',
  card: '#0d0d0f',
  cardHover: '#121214',
  border: 'rgba(255,255,255,0.06)',
  borderHover: 'rgba(255,255,255,0.12)',
  primary: '#f97316',
  orange: '#f97316',
  orangeDim: 'rgba(249, 115, 22, 0.1)',
  textPrimary: '#ffffff',
  textSecondary: '#a1a1aa',
  textMuted: '#52525b',
  green: '#10b981',
  mono: '"JetBrains Mono", "Fira Code", monospace',
  sans: '"Inter", sans-serif'
};

const emotionalKeywords = [
  'Deposit', 'Withdrawal', 'bet ID', 'Referral Violation', 'Referral Bonus', 
  'Submitted', 'Phone number', 'Account Number', 'Cashback', 'Deleted Message', 
  'Mpesa', 'registered phone number', 'Rolled back', 'Lost'
];

const VariableHighlighter = ({ text }) => {
  if (!text) return null;
  
  // Combine variables {var}, [var] and keywords into one regex
  // Escape keywords for regex safety
  const kwPattern = emotionalKeywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(\\{[^}]+\\}|\\[[^\\]]+\\]|\\b(?:${kwPattern})\\b)`, 'gi');
  
  const parts = text.split(regex);
  
  return (
    <div style={{ fontFamily: S.mono, letterSpacing: '-0.02em' }}>
      {parts.map((part, i) => {
        if (!part) return null;
        
        // Handle Variables {var} or [var]
        if ((part.startsWith('{') && part.endsWith('}')) || (part.startsWith('[') && part.endsWith(']'))) {
          return (
            <span key={i} style={{ 
              color: S.orange, fontWeight: 700, 
              background: 'rgba(249,115,22,0.15)', 
              padding: '1px 4px', borderRadius: 4,
              border: '1px solid rgba(249,115,22,0.2)'
            }}>
              {part}
            </span>
          );
        }
        
        // Handle Emotional Keywords
        const lowerPart = part.toLowerCase();
        const isEmotional = emotionalKeywords.some(kw => kw.toLowerCase() === lowerPart);
        
        if (isEmotional) {
          return (
            <span key={i} style={{ 
              color: '#fff', fontWeight: 900, 
              background: 'rgba(244, 63, 94, 0.2)', // Rose dim background
              padding: '1px 6px', borderRadius: 4,
              border: '1px solid rgba(244, 63, 94, 0.4)',
              boxShadow: '0 0 8px rgba(244, 63, 94, 0.2)',
              textTransform: 'uppercase',
              fontSize: '0.9em'
            }}>
              {part}
            </span>
          );
        }
        
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
};



function CopyBtn({ text, id, copiedId, onCopy }) {
  const isCopied = copiedId === id;
  return (
    <button
      onClick={() => onCopy(text, id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 16px', borderRadius: 4,
        background: isCopied ? S.green : 'transparent',
        color: isCopied ? '#000' : S.orange, 
        border: `1px solid ${isCopied ? S.green : S.orange}`, 
        cursor: 'pointer', fontSize: 11, fontWeight: 900, 
        transition: 'all 0.2s', textTransform: 'uppercase', 
        fontFamily: S.mono,
        position: 'relative'
      }}
    >
      <span style={{ opacity: 0.5 }}>[</span>
      {isCopied ? 'OK' : 'COPY'}
      <span style={{ opacity: 0.5 }}>]</span>
    </button>
  );
}

function TemplateItem({ item, catId, copiedId, onCopy, expanded, onToggle, index }) {
  const [activeType, setActiveType] = useState('Standard');
  const responses = item.responses || [];
  const activeResp = responses.find(r => r.type === activeType) || responses[0] || { text: '' };
  const copyId = `${catId}-${item.title}-${activeType}`;

  return (
    <div style={{
      borderBottom: `1px solid ${S.border}`,
      background: expanded ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative'
    }}>
      {/* Design C: Thick Left Rule */}
      {expanded && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: S.orange }} />}
      
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          gap: 12, padding: '16px 20px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: S.textPrimary, textAlign: 'left',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Design A: $ Prompt */}
        <span style={{ color: S.orange, fontFamily: S.mono, fontSize: 14, fontWeight: 900, opacity: 0.6 }}>$</span>
        
        <span style={{ 
          flex: 1, fontSize: 13, fontWeight: 700, 
          fontFamily: expanded ? S.mono : S.sans,
          color: expanded ? S.orange : S.textPrimary,
          transition: 'color 0.2s'
        }}>
          {item.title}
        </span>

        {/* Design C: Angled Arrow ↗ / ↙ */}
        <div style={{ color: expanded ? S.orange : S.textMuted, transition: 'all 0.3s' }}>
          {expanded ? <span style={{ fontSize: 18 }}>↙</span> : <span style={{ fontSize: 18 }}>↗</span>}
        </div>

        {/* Design C: Active Underline */}
        {expanded && (
          <motion.div 
            layoutId={`underline-${catId}-${item.title}`}
            style={{ position: 'absolute', bottom: 0, left: 20, right: 20, height: 1, background: S.orange, opacity: 0.3 }} 
          />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 20px 24px 48px' }}>
              
              {/* Custom: Pagination variants [1] [2] */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: S.textMuted, fontFamily: S.mono, textTransform: 'uppercase' }}>Variant:</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {responses.map((r, i) => (
                    <button
                      key={r.type}
                      onClick={(e) => { e.stopPropagation(); setActiveType(r.type); }}
                      style={{
                        width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 4, border: '1px solid',
                        borderColor: activeType === r.type ? S.orange : S.border,
                        background: activeType === r.type ? S.orangeDim : 'transparent',
                        color: activeType === r.type ? S.orange : S.textMuted,
                        fontSize: 11, fontWeight: 900, cursor: 'pointer', fontFamily: S.mono,
                        transition: 'all 0.2s'
                      }}
                    >
                      [{i + 1}]
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: 10, color: S.orange, fontWeight: 800, fontFamily: S.mono }}>
                  // {activeType === 'High Empathy' ? 'SOFT_TONE' : 'DIRECT_TONE'}
                </span>
              </div>

              {/* Design A: Copy field box with bracket design */}
              <div style={{ 
                background: '#000', padding: 20, borderRadius: 8, 
                fontSize: 14, color: '#e4e4e7', lineHeight: 1.8, marginBottom: 20,
                border: '1px dashed rgba(255,255,255,0.1)',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: -1, left: -1, width: 10, height: 10, borderTop: `2px solid ${S.orange}`, borderLeft: `2px solid ${S.orange}` }} />
                <div style={{ position: 'absolute', top: -1, right: -1, width: 10, height: 10, borderTop: `2px solid ${S.orange}`, borderRight: `2px solid ${S.orange}` }} />
                <div style={{ position: 'absolute', bottom: -1, left: -1, width: 10, height: 10, borderBottom: `2px solid ${S.orange}`, borderLeft: `2px solid ${S.orange}` }} />
                <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderBottom: `2px solid ${S.orange}`, borderRight: `2px solid ${S.orange}` }} />
                
                <VariableHighlighter text={activeResp.text} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(item.triggers || []).map((t, i) => (
                    <span key={i} style={{ 
                      fontSize: 10, color: S.textMuted, fontFamily: S.mono,
                      background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: 4
                    }}>#{t}</span>
                  ))}
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

function CategoryCard({ category, items, catId, copiedId, onCopy, expandedIds, toggleExpand, index }) {
  const emojiMatch = category.match(/(\p{Emoji})/u);
  const emoji = emojiMatch ? emojiMatch[0] : '📂';
  const title = category.replace(/(\p{Emoji})/gu, '').trim().toUpperCase();
  
  // Design B: 01, 02 numbering
  const displayNumber = (index + 1).toString().padStart(2, '0');

  return (
    <div style={{ 
      background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, 
      display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      position: 'relative'
    }}>
      {/* Design C: Orange Header Band */}
      <div style={{ height: 4, background: S.orange }} />
      
      {/* Card Header */}
      <div style={{ 
        padding: '24px', borderBottom: `1px solid ${S.border}`, 
        background: 'linear-gradient(to bottom, rgba(249,115,22,0.05), transparent)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <span style={{ fontFamily: S.mono, fontSize: 12, fontWeight: 900, color: S.orange }}>
            SEC_ID: {displayNumber}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 32 }}>{emoji}</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ 
              fontSize: 16, fontWeight: 900, letterSpacing: '0.1em', margin: 0, color: '#fff',
              fontFamily: S.mono
            }}>
              {title}
            </h3>
            <div style={{ fontSize: 10, color: S.textMuted, fontFamily: S.mono, marginTop: 4 }}>
              STATUS: // SYSTEM_READY
            </div>
          </div>
        </div>

        <div style={{ 
          position: 'absolute', bottom: -10, right: 24,
          padding: '4px 12px', borderRadius: 4, background: S.orange, 
          color: '#000', fontSize: 11, fontWeight: 900, fontFamily: S.mono,
          boxShadow: `0 4px 12px ${S.orange}40`
        }}>
          COUNT: {items.length}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} className="custom-scrollbar">
        {items.map((item, idx) => (
          <TemplateItem 
            key={idx} 
            item={item} 
            catId={catId} 
            copiedId={copiedId} 
            onCopy={onCopy}
            expanded={expandedIds.includes(`${catId}-${item.title}`)}
            onToggle={() => toggleExpand(`${catId}-${item.title}`)}
            index={idx}
          />
        ))}
      </div>
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
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ category: '', title: '', standardText: '', empathyText: '' });
  const [isNewCategory, setIsNewCategory] = useState(false);
  
  // Expansion Logic
  const [expandedIds, setExpandedIds] = useState([]);

  const toggleExpand = useCallback((id) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const handleCopy = useCallback((text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  }, [showToast]);

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

  const availableCategories = useMemo(() => {
    if (!data) return [];
    return data.map(d => d.category).sort();
  }, [data]);

  const handleCreate = async () => {
    if (!newTemplate.category || !newTemplate.title || !newTemplate.standardText) {
      showToast('Please fill required fields', 'error');
      return;
    }

    const responses = [{ type: 'Standard', text: newTemplate.standardText }];
    if (newTemplate.empathyText) responses.push({ type: 'High Empathy', text: newTemplate.empathyText });

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
        actions.refreshAll();
      }
    } catch (err) {
      showToast('Error deploying template', 'error');
    }
  };

  if (loading.templates && !isReady) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-orange-500">
        <RotateCcw size={40} />
      </motion.div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Syncing Intelligence Matrix</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.textPrimary, fontFamily: 'Inter, sans-serif' }}>
      
      {/* STICKY HEADER */}
      <header style={{ 
        position: 'sticky', top: 0, zIndex: 100, 
        background: 'rgba(5, 5, 5, 0.8)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${S.border}`, padding: '16px 40px'
      }}>
        <div style={{ maxWidth: 1600, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Templates / Support Intelligence Matrix</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: 6, 
                    fontSize: 9, fontWeight: 900, color: S.orange, 
                    textTransform: 'uppercase', letterSpacing: '0.05em' 
                  }}>
                    <Sparkles size={10} /> AI-Assisted
                  </div>
                  <div style={{ width: 3, height: 3, borderRadius: '50%', background: S.textMuted }} />
                  <div style={{ fontSize: 9, fontWeight: 700, color: S.textMuted, textTransform: 'uppercase' }}>
                    {data?.length || 0} Clusters Active
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button 
                onClick={() => setModalOpen(true)}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', color: '#fff', border: `1px solid ${S.border}`, 
                  borderRadius: 10, padding: '8px 16px', fontSize: 11, fontWeight: 800, 
                  display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' 
                }}
              >
                <Plus size={14} /> New Template
              </button>
              <a 
                href="https://github.com/Realworrior/falme-staff-system/archive/refs/heads/master.zip"
                target="_blank" rel="noopener noreferrer"
                style={{ 
                  background: S.orange, color: '#fff', borderRadius: 10, 
                  padding: '8px 16px', fontSize: 11, fontWeight: 800, 
                  display: 'flex', alignItems: 'center', gap: 8, 
                  textDecoration: 'none', boxShadow: `0 4px 15px ${S.orange}30` 
                }}
              >
                <Download size={14} /> Download Extension
              </a>
            </div>
          </div>

          {/* FULL-WIDTH SEARCH BAR */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color={S.textMuted} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask me to find a template or paste a client's message..."
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)', border: `1px solid ${S.border}`,
                borderRadius: 14, padding: '14px 14px 14px 48px', color: '#fff', fontSize: 14,
                outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = S.orange}
              onBlur={(e) => e.target.style.borderColor = S.border}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: S.textMuted, cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT GRID */}
      <main style={{ maxWidth: 1600, margin: '0 auto', padding: '40px' }}>
        <div 
          className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6 auto-rows-fr"
          style={{ display: 'grid', gridAutoRows: 'minmax(400px, 1fr)' }}
        >
          {filteredData.map((cat, idx) => (
            <CategoryCard 
              key={idx}
              category={cat.category}
              items={cat.templates}
              catId={cat.id}
              copiedId={copiedId}
              onCopy={handleCopy}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              index={idx}
            />
          ))}
        </div>

        {filteredData.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{ display: 'inline-flex', padding: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', marginBottom: 20 }}>
              <Search size={40} color={S.textMuted} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: S.textPrimary, margin: '0 0 8px' }}>No Intel Found</h2>
            <p style={{ color: S.textMuted, margin: 0 }}>Try adjusting your search or filtering by another keyword.</p>
          </div>
        )}
      </main>

      {/* MODAL (Same as before but styled to match) */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ style: { background: S.surface, borderRadius: 24, border: `1px solid ${S.border}`, color: '#fff' } }}>
        <DialogTitle style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: 16, padding: '24px 32px' }}>Deploy Template</DialogTitle>
        <DialogContent style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <FormControl fullWidth><InputLabel style={{ color: S.textMuted }}>Category</InputLabel><Select label="Category" value={isNewCategory ? "NEW" : newTemplate.category} onChange={e => { if (e.target.value === "NEW") { setIsNewCategory(true); setNewTemplate({ ...newTemplate, category: "" }); } else { setIsNewCategory(false); setNewTemplate({ ...newTemplate, category: e.target.value }); } }} style={{ color: '#fff', background: '#000', borderRadius: 12 }}>{availableCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}<MenuItem value="NEW" style={{ color: S.orange }}>+ NEW CATEGORY</MenuItem></Select></FormControl>
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

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); borderRadius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${S.orange}; }
      `}} />
    </div>
  );
};

export default Templates;
