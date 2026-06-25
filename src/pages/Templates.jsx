import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, X, RotateCcw, Download, MoreHorizontal, ArrowUp, ArrowDown
} from 'lucide-react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';

import { useSupabaseData } from '../context/SupabaseDataContext';
import { useToast } from '../context/ToastContext';

// ─────────────────────────────────────────────────────────────────────────────
// Themes based on Image
// ─────────────────────────────────────────────────────────────────────────────
const THEMES = [
  { bg: '#BAFA1E', text: '#000000', statusLabel: 'Ready', statusBg: 'rgba(0,0,0,0.2)', statusText: '#000' },
  { bg: '#FF6912', text: '#000000', statusLabel: 'Live', statusBg: 'rgba(0,0,0,0.2)', statusText: '#000' },
  { bg: '#FFDF1B', text: '#000000', statusLabel: 'Degraded', statusBg: 'rgba(0,0,0,0.2)', statusText: '#000' },
  { bg: '#00C1EB', text: '#000000', statusLabel: 'Active', statusBg: 'rgba(0,0,0,0.2)', statusText: '#000' },
  { bg: '#FF035C', text: '#ffffff', statusLabel: 'Active', statusBg: 'rgba(255,255,255,0.2)', statusText: '#fff' },
  { bg: '#DFA544', text: '#000000', statusLabel: 'Processing', statusBg: 'rgba(0,0,0,0.2)', statusText: '#000' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Variable Highlighter
// ─────────────────────────────────────────────────────────────────────────────
const VariableHighlighter = ({ text, theme }) => {
  if (!text) return null;
  const KEYWORD_COLORS = [
    { hex: '#BAFA1E', words: ['resolved', 'safe', 'accounted for', 'successfully', 'good news', 'eligible', 'confirm', 'confirmed'] },
    { hex: '#FF6912', words: ['crash', 'aviator', 'jetx', 'virtual', 'casino', 'stake', 'winnings', 'bet', 'betslip', 'odds', 'sport', 'sports'] },
    { hex: '#FFDF1B', words: ['urgent', 'delay', 'delayed', 'error', 'wrong', 'voided', 'failed', 'issue', 'problem', 'degraded', 'unavailable', 'down', 'maintenance', 'frustrated', 'frustration', 'missing', 'lost'] },
    { hex: '#00C1EB', words: ['cashback', 'referral', 'bonus', 'offers', 'tax-free', 'free bet', 'rain'] },
    { hex: '#FF035C', words: ['hello', 'hi', 'welcome', 'greet', 'vip'] },
    { hex: '#DFA544', words: ['deposit', 'withdraw', 'withdrawal', 'm-pesa', 'balance', 'ksh', 'paybill', 'transaction', 'funds', 'amount', 'wallet'] }
  ];

  const allWords = KEYWORD_COLORS.flatMap(c => c.words).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(\\{[^}]+\\}|\\[[^\\]]+\\]|\\b(?:${allWords.join('|')})\\b)`, 'gi');
  
  const parts = text.split(pattern);
  return (
    <span>
      {parts.map((part, i) => {
        if (!part) return null;
        const isVar = (part.startsWith('{') && part.endsWith('}')) || (part.startsWith('[') && part.endsWith(']'));
        if (isVar) {
          return <span key={i} className="font-bold" style={{ color: theme ? theme.bg : '#ffffff' }}>{part}</span>;
        }

        const lowerPart = part.toLowerCase();
        let matchedColor = null;
        for (const cat of KEYWORD_COLORS) {
          if (cat.words.includes(lowerPart)) {
            matchedColor = cat.hex;
            break;
          }
        }
        if (matchedColor) {
          return <span key={`k-${i}`} className="font-bold" style={{ color: matchedColor }}>{part}</span>;
        }

        // Split for ALL CAPS
        const subParts = part.split(/(\b[A-Z][A-Z0-9_-]+\b)/);
        return (
          <span key={`w-${i}`}>
            {subParts.map((sub, j) => {
               if (sub.match(/^\b[A-Z][A-Z0-9_-]+\b$/)) {
                  return <span key={`sub-${j}`} className="font-bold" style={{ color: theme ? theme.bg : '#ffffff' }}>{sub}</span>;
               }
               return <span key={`sub-${j}`}>{sub}</span>;
            })}
          </span>
        );
      })}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Single Template Row (inside a category card)
// ─────────────────────────────────────────────────────────────────────────────
function TemplateRow({ item, catId, copiedId, onCopy, isExpanded, onToggle, onEdit, onDelete, theme }) {
  const [activeVariant, setActiveVariant] = useState(0);
  const responses = item.responses || [];
  const activeResp = responses[activeVariant] || { text: '', type: 'Standard' };
  const copyId = `${catId}-${item.title}-${activeVariant}`;
  const isCopied = copiedId === copyId;

  return (
    <div>
      {/* Row Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors text-left group"
      >
        {/* Status Dot */}
        <div 
          className="w-2 h-2 rounded-full shrink-0 transition-colors"
          style={{ backgroundColor: isExpanded ? theme.bg : '#4a4b50' }}
        />
        
        {/* Title */}
        <span className={`flex-1 text-sm font-medium transition-colors ${isExpanded ? 'text-white' : 'text-[#c0c0c5] group-hover:text-white'}`}>
          {item.title}
        </span>

        {/* Arrow */}
        <span 
          className="shrink-0 transition-colors group-hover:text-[#8e8e93]"
          style={{ color: isExpanded ? theme.bg : '#4a4b50' }}
        >
          {isExpanded ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        </span>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-5 space-y-4">
              {/* Variant Selectors */}
              {responses.length > 1 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-[#8e8e93] font-medium mr-1">Variant</span>
                  {responses.map((r, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setActiveVariant(i); }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all hover:text-white"
                      style={{
                        backgroundColor: activeVariant === i ? theme.bg : 'transparent',
                        borderColor: activeVariant === i ? theme.bg : '#3a3b3f',
                        color: activeVariant === i ? theme.text : '#8e8e93'
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Text Content */}
              <div className="bg-[#161616] rounded-2xl p-4 text-sm text-[#c0c0c5] leading-relaxed border border-[#3a3b3f]" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                <VariableHighlighter text={activeResp.text} theme={theme} />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button onClick={() => onEdit(item, catId)} className="text-sm text-[#8e8e93] hover:text-white transition-colors font-medium">
                  Edit
                </button>
                <button onClick={() => onDelete(item, catId)} className="text-sm text-red-500 hover:text-red-400 transition-colors font-medium">
                  Delete
                </button>
                <button
                  onClick={() => onCopy(activeResp.text, copyId)}
                  className="ml-auto px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all hover:opacity-80"
                  style={{
                    backgroundColor: isCopied ? theme.bg : 'transparent',
                    borderColor: theme.bg,
                    color: isCopied ? theme.text : theme.bg
                  }}
                >
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Category Card
// ─────────────────────────────────────────────────────────────────────────────
function CategoryCard({ category, items, catId, copiedId, onCopy, onEdit, onDelete, index }) {
  const [expandedTitle, setExpandedTitle] = useState(null);

  const emojiMatch = category.match(/(\p{Emoji})/u);
  const emoji = emojiMatch ? emojiMatch[0] : '📂';
  const categoryLabel = category.replace(/(\p{Emoji})/gu, '').trim();

  // Derive a "type" label from the category name for display
  const typeLabel = (() => {
    const lower = categoryLabel.toLowerCase();
    if (lower.includes('support') || lower.includes('patience') || lower.includes('client')) return 'SUPPORT';
    if (lower.includes('casino') || lower.includes('gaming') || lower.includes('game')) return 'GAMING';
    if (lower.includes('aviator') || lower.includes('slot')) return 'AVIATOR';
    if (lower.includes('deposit') || lower.includes('withdraw') || lower.includes('payment')) return 'FINANCE';
    if (lower.includes('referral') || lower.includes('bonus')) return 'PROMOTIONS';
    if (lower.includes('security') || lower.includes('account')) return 'SECURITY';
    return 'SYSTEM';
  })();

  const theme = THEMES[index % THEMES.length];

  const toggleItem = (title) => {
    setExpandedTitle(prev => prev === title ? null : title);
  };

  return (
    <div className="bg-[#1e1f22] rounded-[24px] overflow-hidden flex flex-col h-full">
      {/* Card Top Row */}
      <div className="flex items-start justify-between p-5 pb-3">
        {/* Left: Icon + Menu */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2a2b2f] flex items-center justify-center text-lg">
            {emoji}
          </div>
          <button className="text-[#4a4b50] hover:text-[#8e8e93] transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Right: Count Badge */}
        <div 
          className="rounded-2xl px-4 py-3 flex flex-col items-center min-w-[80px] -mt-1 -mr-1"
          style={{ backgroundColor: theme.bg, color: theme.text }}
        >
          <span className="text-3xl font-black leading-none tracking-tight">
            {String(items.length).padStart(2, '0')}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-70">RESPONSES</span>
          <div 
            className="mt-2 px-3 py-0.5 rounded-full text-[9px] font-bold"
            style={{ backgroundColor: theme.statusBg, color: theme.statusText }}
          >
            {theme.statusLabel}
          </div>
        </div>
      </div>

      {/* Category Label + Title */}
      <div className="px-5 pb-4">
        <p className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-widest mb-1">{typeLabel}</p>
        <h3 className="text-white text-base font-bold leading-snug">{categoryLabel}</h3>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#2a2b2f] mx-5" />

      {/* Template Rows */}
      <div className="flex-1 divide-y divide-[#2a2b2f]/60">
        {items.map((item, idx) => (
          <TemplateRow
            key={idx}
            item={item}
            catId={catId}
            copiedId={copiedId}
            onCopy={onCopy}
            isExpanded={expandedTitle === item.title}
            onToggle={() => toggleItem(item.title)}
            onEdit={onEdit}
            onDelete={onDelete}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TEMPLATES PAGE
// ─────────────────────────────────────────────────────────────────────────────
function Templates() {
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('templates-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const { templates: data, loading, isReady, actions } = useSupabaseData();
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newTemplate, setNewTemplate] = useState({ 
    category: '', title: '', standardText: '', empathyText: '', securityText: '', triggers: '' 
  });
  const [isNewCategory, setIsNewCategory] = useState(false);

  const handleCopy = useCallback((text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  }, [showToast]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    let result = data;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = data.map(cat => ({
        ...cat,
        templates: cat.templates.filter(t =>
          t.title.toLowerCase().includes(q) ||
          (t.triggers || []).some(tr => tr.toLowerCase().includes(q)) ||
          t.responses.some(r => r.text.toLowerCase().includes(q)) ||
          cat.category.toLowerCase().includes(q)
        )
      })).filter(cat => cat.templates.length > 0);
    }
    
    // Sort descending by number of templates to group by count row-wise
    return [...result].sort((a, b) => b.templates.length - a.templates.length);
  }, [data, searchQuery]);

  const availableCategories = useMemo(() => data?.map(d => d.category).sort() || [], [data]);

  const handleEdit = (item, catId) => {
    setIsEditing(true);
    setEditId(catId);
    setNewTemplate({
      category: data.find(c => c.id === catId)?.category || '',
      title: item.title,
      standardText: item.responses.find(r => r.type === 'Standard')?.text || '',
      empathyText: item.responses.find(r => r.type === 'High Empathy')?.text || '',
      securityText: item.responses.find(r => r.type === 'Security')?.text || '',
      triggers: (item.triggers || []).join(', ')
    });
    setModalOpen(true);
  };

  const handleDelete = async (item, catId) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    const category = data.find(c => c.id === catId);
    if (!category) return;
    const updatedTemplates = category.templates.filter(t => t.title !== item.title);
    try {
      const success = updatedTemplates.length === 0
        ? await actions.deleteRecord('supportTemplates', catId)
        : await actions.updateRecord('supportTemplates', catId, { templates: updatedTemplates });
      if (success) { showToast('Template deleted.', 'success'); actions.refreshAll(); }
    } catch { showToast('Delete failed.', 'error'); }
  };

  const handleCreate = async () => {
    if (!newTemplate.category || !newTemplate.title || !newTemplate.standardText) {
      showToast('Please fill required fields', 'error'); return;
    }
    const responses = [{ type: 'Standard', text: newTemplate.standardText }];
    if (newTemplate.empathyText) responses.push({ type: 'High Empathy', text: newTemplate.empathyText });
    if (newTemplate.securityText) responses.push({ type: 'Security', text: newTemplate.securityText });
    const triggers = newTemplate.triggers ? newTemplate.triggers.split(',').map(t => t.trim().toLowerCase()) : [newTemplate.title.toLowerCase()];
    try {
      let success;
      if (isEditing) {
        const cat = data.find(c => c.id === editId);
        const others = cat.templates.filter(t => t.title !== newTemplate.title);
        success = await actions.updateRecord('supportTemplates', editId, {
          category: newTemplate.category,
          templates: [...others, { title: newTemplate.title, responses, triggers }]
        });
      } else {
        success = await actions.createRecord('supportTemplates', {
          category: newTemplate.category,
          templates: [{ title: newTemplate.title, responses, triggers }]
        });
      }
      if (success) {
        showToast(isEditing ? 'Updated!' : 'Deployed!', 'success');
        setModalOpen(false); setIsEditing(false); setEditId(null);
        setNewTemplate({ category: '', title: '', standardText: '', empathyText: '', securityText: '', triggers: '' });
        actions.refreshAll();
      }
    } catch { showToast('Operation failed', 'error'); }
  };

  if (loading.templates && !isReady) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
        <RotateCcw size={32} className="text-[#baff55]" />
      </motion.div>
      <p className="text-sm text-[#8e8e93]">Loading templates...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col">
      
      {/* TOP HEADER */}
      <header className="sticky top-0 z-50 bg-[#161616] border-b border-[#2a2b2f] px-6 md:px-10 py-5">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-5">
          
          {/* Row 1: Filter Pills + Actions */}
          <div className="flex items-center justify-end flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setModalOpen(true)} className="pill-white flex items-center gap-2 text-sm font-semibold">
                <Plus size={15} /> Add New Template
              </button>
              <a href="/templates/blastchat-extension.xpi" download className="pill-dark flex items-center gap-2 text-sm font-semibold hover:text-white">
                Firefox (v1.7)
              </a>
              <a href="/blastchat-extension.zip" download className="pill-dark flex items-center gap-2 text-sm font-semibold hover:text-white">
                Chrome Extension
              </a>
            </div>
          </div>

          {/* Row 2: Search */}
          <div className="relative max-w-xl w-full">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8e8e93]" />
            <input
              id="templates-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search templates, paste client message..."
              className="w-full bg-[#2a2b2f] border border-[#3a3b3f] rounded-full pl-12 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-[#baff55] transition-colors placeholder:text-[#4a4b50]"
            />
            {searchQuery ? (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8e8e93] hover:text-white">
                <X size={16} />
              </button>
            ) : (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[#4a4b50] bg-[#161616] px-1.5 py-0.5 rounded border border-[#3a3b3f]">
                Ctrl+K
              </span>
            )}
          </div>

        </div>
      </header>

      {/* GRID */}
      <main className="max-w-[1600px] mx-auto w-full p-6 md:p-10">
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-24">
            <div className="w-16 h-16 bg-[#2a2b2f] rounded-full flex items-center justify-center mb-5">
              <Search size={28} className="text-[#4a4b50]" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No templates found</h2>
            <p className="text-[#8e8e93] text-sm">Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
            {filteredData.map((cat, idx) => (
              <CategoryCard
                key={cat.id || idx}
                category={cat.category}
                items={cat.templates}
                catId={cat.id}
                copiedId={copiedId}
                onCopy={handleCopy}
                onEdit={handleEdit}
                onDelete={handleDelete}
                index={idx}
              />
            ))}
          </div>
        )}
      </main>

      {/* MODAL */}
      <Dialog
        open={modalOpen}
        onClose={() => { setModalOpen(false); setIsEditing(false); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ style: { background: '#1e1f22', borderRadius: 28, border: '1px solid #2a2b2f', color: '#fff', padding: 8 } }}
      >
        <DialogTitle className="font-semibold text-lg text-white px-6 pt-4">
          {isEditing ? 'Edit Template' : 'New Template'}
        </DialogTitle>
        <DialogContent className="px-6 pb-2">
          <div className="flex flex-col gap-5 mt-3">
            <FormControl fullWidth>
              <InputLabel style={{ color: '#8e8e93' }}>Category</InputLabel>
              <Select
                label="Category"
                value={isNewCategory ? 'NEW' : newTemplate.category}
                onChange={e => {
                  if (e.target.value === 'NEW') { setIsNewCategory(true); setNewTemplate({ ...newTemplate, category: '' }); }
                  else { setIsNewCategory(false); setNewTemplate({ ...newTemplate, category: e.target.value }); }
                }}
                style={{ color: '#fff', background: '#161616', borderRadius: 16 }}
              >
                {availableCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                <MenuItem value="NEW" style={{ color: '#baff55' }}>+ New Category</MenuItem>
              </Select>
            </FormControl>
            {isNewCategory && <TextField label="New Category Name" fullWidth value={newTemplate.category} onChange={e => setNewTemplate({ ...newTemplate, category: e.target.value })} InputProps={{ style: { color: '#fff', background: '#161616', borderRadius: 16 } }} InputLabelProps={{ style: { color: '#8e8e93' } }} autoFocus />}
            <TextField label="Title *" fullWidth value={newTemplate.title} onChange={e => setNewTemplate({ ...newTemplate, title: e.target.value })} InputProps={{ style: { color: '#fff', background: '#161616', borderRadius: 16 } }} InputLabelProps={{ style: { color: '#8e8e93' } }} />
            <TextField label="Source / Triggers (comma separated)" fullWidth value={newTemplate.triggers} onChange={e => setNewTemplate({ ...newTemplate, triggers: e.target.value })} InputProps={{ style: { color: '#fff', background: '#161616', borderRadius: 16 } }} InputLabelProps={{ style: { color: '#8e8e93' } }} />
            <div className="border-t border-[#2a2b2f] pt-4">
              <p className="text-xs font-semibold text-[#8e8e93] mb-4">Response Variants</p>
              <div className="flex flex-col gap-4">
                <TextField label="Standard Response *" fullWidth multiline rows={3} value={newTemplate.standardText} onChange={e => setNewTemplate({ ...newTemplate, standardText: e.target.value })} InputProps={{ style: { color: '#fff', background: '#161616', borderRadius: 16 } }} InputLabelProps={{ style: { color: '#8e8e93' } }} />
                <TextField label="Alternative Response" fullWidth multiline rows={2} value={newTemplate.empathyText} onChange={e => setNewTemplate({ ...newTemplate, empathyText: e.target.value })} InputProps={{ style: { color: '#fff', background: '#161616', borderRadius: 16 } }} InputLabelProps={{ style: { color: '#8e8e93' } }} />
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="px-6 pb-5 gap-3">
          <button onClick={() => { setModalOpen(false); setIsEditing(false); }} className="pill-dark">Cancel</button>
          <button onClick={handleCreate} className="pill-lime">{isEditing ? 'Save Changes' : 'Deploy'}</button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Templates;
