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
  primary: '#f97316', // Brand Orange
  orange: '#f97316',
  orangeDim: 'rgba(249, 115, 22, 0.1)',
  textPrimary: '#ffffff',
  textSecondary: '#a1a1aa',
  textMuted: '#52525b',
  green: '#10b981',
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Highlight variables in curly braces with orange color
 */
const VariableHighlighter = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(\{[^}]+\})/g);
  return (
    <>
      {parts.map((part, i) => 
        part.startsWith('{') && part.endsWith('}') ? (
          <span key={i} style={{ color: S.orange, fontWeight: 700 }}>{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

function CopyBtn({ text, id, copiedId, onCopy }) {
  const isCopied = copiedId === id;
  return (
    <button
      onClick={() => onCopy(text, id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 8,
        background: isCopied ? S.green : 'rgba(255,255,255,0.05)',
        color: '#fff', border: `1px solid ${isCopied ? S.green : 'rgba(255,255,255,0.1)'}`, 
        cursor: 'pointer', fontSize: 10, fontWeight: 800, 
        transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.05em'
      }}
    >
      {isCopied ? <Check size={12} /> : <Copy size={12} />}
      {isCopied ? 'Copied' : 'Copy Message'}
    </button>
  );
}

function TemplateItem({ item, catId, copiedId, onCopy, expanded, onToggle }) {
  const [activeType, setActiveType] = useState('Standard');
  const responses = item.responses || [];
  const activeResp = responses.find(r => r.type === activeType) || responses[0] || { text: '' };
  const copyId = `${catId}-${item.title}-${activeType}`;

  const hasStandard = responses.some(r => r.type === 'Standard');
  const hasEmpathy = responses.some(r => r.type === 'High Empathy');

  return (
    <div style={{
      borderBottom: `1px solid ${S.border}`,
      background: expanded ? 'rgba(249, 115, 22, 0.03)' : 'transparent',
      transition: 'all 0.2s',
      position: 'relative'
    }}>
      {expanded && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: S.orange }} />}
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          gap: 12, padding: '14px 16px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: S.textPrimary, textAlign: 'left',
        }}
      >
        <motion.span animate={{ rotate: expanded ? 90 : 0 }} style={{ color: expanded ? S.orange : S.textMuted }}>
          <ChevronRight size={14} />
        </motion.span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>{item.title}</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {hasStandard && (
            <div style={{ 
              fontSize: 9, fontWeight: 900, color: '#4080e8', 
              background: 'rgba(64, 128, 232, 0.1)', width: 16, height: 16, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4,
              border: '1px solid rgba(64, 128, 232, 0.2)'
            }}>S</div>
          )}
          {hasEmpathy && (
            <div style={{ 
              fontSize: 9, fontWeight: 900, color: '#e84080', 
              background: 'rgba(232, 64, 128, 0.1)', width: 16, height: 16, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4,
              border: '1px solid rgba(232, 64, 128, 0.2)'
            }}>H</div>
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 20px 42px' }}>
              {/* Variant Toggles */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {responses.map(r => (
                  <button
                    key={r.type}
                    onClick={(e) => { e.stopPropagation(); setActiveType(r.type); }}
                    style={{
                      padding: '6px 12px', borderRadius: 8, border: '1px solid',
                      borderColor: activeType === r.type ? S.orange : 'rgba(255,255,255,0.05)',
                      background: activeType === r.type ? S.orangeDim : 'rgba(255,255,255,0.02)',
                      color: activeType === r.type ? S.orange : S.textMuted,
                      fontSize: 10, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase',
                      letterSpacing: '0.02em', transition: 'all 0.2s'
                    }}
                  >
                    {r.type === 'High Empathy' ? 'Soft Tone' : 'Direct Tone'}
                  </button>
                ))}
              </div>

              {/* Template Body */}
              <div style={{ 
                background: '#000', padding: 16, borderRadius: 12, 
                fontSize: 13, color: '#e4e4e7', lineHeight: 1.7, marginBottom: 16,
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
              }}>
                <VariableHighlighter text={activeResp.text} />
              </div>

              {/* Tags & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(item.triggers || []).map((t, i) => (
                    <span key={i} style={{ 
                      fontSize: 10, color: S.textMuted, background: 'rgba(255,255,255,0.03)', 
                      padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.03)' 
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

function CategoryCard({ category, items, catId, copiedId, onCopy, expandedIds, toggleExpand }) {
  // Extract emoji and clean title
  const emojiMatch = category.match(/(\p{Emoji})/u);
  const emoji = emojiMatch ? emojiMatch[0] : '📂';
  const title = category.replace(/(\p{Emoji})/gu, '').trim().toUpperCase();

  const hasAnyStandard = items.some(item => item.responses.some(r => r.type === 'Standard'));
  const hasAnyEmpathy = items.some(item => item.responses.some(r => r.type === 'High Empathy'));

  return (
    <div style={{ 
      background: S.card, border: `1px solid ${S.border}`, borderRadius: 24, 
      display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    }}>
      {/* Card Header */}
      <div style={{ 
        padding: '20px 24px', borderBottom: `1px solid ${S.border}`, 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.02), transparent)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.03)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <span style={{ fontSize: 18 }}>{emoji}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 14, fontWeight: 900, letterSpacing: '0.05em', margin: 0, color: '#fff' }}>{title}</h3>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
               {hasAnyStandard && <span style={{ fontSize: 8, fontWeight: 900, color: '#4080e8', opacity: 0.8 }}>[S]</span>}
               {hasAnyEmpathy && <span style={{ fontSize: 8, fontWeight: 900, color: '#e84080', opacity: 0.8 }}>[H]</span>}
            </div>
          </div>
        </div>
        <div style={{ 
          padding: '4px 10px', borderRadius: 8, background: S.orangeDim, 
          color: S.orange, fontSize: 11, fontWeight: 900, border: `1px solid ${S.orange}20`
        }}>
          {items.length}
        </div>
      </div>

      {/* Items List (Scrollable) */}
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
