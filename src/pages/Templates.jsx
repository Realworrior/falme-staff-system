import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, ArrowUpRight, Copy, Check,
  X, Edit3, Trash2, RotateCcw, Download, Sparkles
} from 'lucide-react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';

import { useSupabaseData } from '../context/SupabaseDataContext';
import { useToast } from '../context/ToastContext';

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: Variable Highlighter
// ─────────────────────────────────────────────────────────────────────────────
const VariableHighlighter = ({ text }) => {
  if (!text) return null;
  const categories = {
    danger: ['Referral Violation', 'Deleted Message', 'Lost', 'Rolled back'],
    success: ['Submitted', 'Cashback', 'Referral Bonus'],
    info: ['Deposit', 'Withdrawal', 'bet ID', 'Mpesa'],
    data: ['Phone number', 'Account Number', 'registered phone number']
  };

  const allKeywords = Object.values(categories).flat();
  const pattern = new RegExp(`(\\{[^}]+\\}|\\[[^\\]]+\\]|${allKeywords.join('|')})`, 'gi');
  const parts = text.split(pattern);

  const getColor = (keyword) => {
    const k = keyword.toLowerCase();
    if (categories.danger.some(v => v.toLowerCase() === k)) return '#ff4d4d';
    if (categories.success.some(v => v.toLowerCase() === k)) return '#baff55';
    if (categories.info.some(v => v.toLowerCase() === k)) return '#3b82f6';
    if (categories.data.some(v => v.toLowerCase() === k)) return '#ffd24d';
    return '#fff';
  };

  return (
    <div style={{ letterSpacing: '-0.01em', lineHeight: '1.6' }}>
      {parts.map((part, i) => {
        const isPlaceholder = (part.startsWith('{') && part.endsWith('}')) || (part.startsWith('[') && part.endsWith(']'));
        const isEmotional = allKeywords.some(k => k.toLowerCase() === part.toLowerCase());

        if (isPlaceholder) {
          return (
            <span key={i} className="bg-[#baff55]/10 text-[#baff55] font-semibold px-1 rounded mx-0.5 border border-[#baff55]/20">
              {part}
            </span>
          );
        }

        if (isEmotional) {
          const color = getColor(part);
          return (
            <span key={i} style={{ color, background: `${color}15`, borderColor: `${color}30` }} className="font-semibold px-1 rounded mx-0.5 border">
              {part}
            </span>
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: Matte Template Card (Cutout Signature Design)
// ─────────────────────────────────────────────────────────────────────────────
function MatteTemplateCard({ item, category, catId, copiedId, onCopy, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [activeType, setActiveType] = useState('Standard');
  const responses = item.responses || [];
  const activeResp = responses.find(r => r.type === activeType) || responses[0] || { text: '' };
  const copyId = `${catId}-${item.title}-${activeType}`;
  const isCopied = copiedId === copyId;

  return (
    <div className="relative w-full">
      {/* 
        The Card 
        We use the 'cutout-card' class from index.css for the visual effect.
      */}
      <div className="cutout-card p-8 flex flex-col min-h-[220px] transition-all hover:bg-[#2d2f34]">
        
        {/* Top Right Action Button nestled in the cutout */}
        <div className="absolute top-2 right-2">
          <button 
            onClick={() => setExpanded(!expanded)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border border-[#3a3b3f] ${expanded ? 'bg-[#baff55] text-black border-transparent' : 'bg-[#161616] text-white hover:bg-[#3a3b3f]'}`}
            style={{ boxShadow: '0 0 0 6px #161616' }} // Adds the illusion of a gap
          >
            <ArrowUpRight size={20} className={`transform transition-transform ${expanded ? 'rotate-45' : ''}`} />
          </button>
        </div>

        {/* Card Header */}
        <div className="pr-16">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-full bg-[#161616] flex items-center justify-center border border-[#3a3b3f]">
              <span className="text-white text-xs">{category.match(/(\p{Emoji})/u)?.[0] || '📂'}</span>
            </span>
            <span className="text-[#8e8e93] text-sm font-medium">{category.replace(/(\p{Emoji})/gu, '').trim()}</span>
          </div>
          <h3 className="text-white text-xl font-semibold leading-tight">{item.title}</h3>
        </div>

        {/* Snippet Preview (if not expanded) */}
        {!expanded && (
          <div className="mt-6 mb-6 line-clamp-2 text-[#8e8e93] text-sm">
            {activeResp.text}
          </div>
        )}

        {/* Expanded View Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-6"
            >
              <div className="flex gap-2 mb-4">
                {responses.map((r) => (
                  <button
                    key={r.type}
                    onClick={() => setActiveType(r.type)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      activeType === r.type 
                        ? 'bg-[#baff55] text-black' 
                        : 'bg-[#161616] text-[#8e8e93] hover:text-white border border-[#3a3b3f]'
                    }`}
                  >
                    {r.type}
                  </button>
                ))}
              </div>

              <div className="bg-[#161616] p-4 rounded-2xl text-sm text-[#e4e4e7] border border-[#3a3b3f] mb-6">
                <VariableHighlighter text={activeResp.text} />
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-4">
                  <button onClick={() => onEdit(item, catId)} className="text-[#8e8e93] hover:text-white flex items-center gap-2 text-xs font-semibold transition-colors">
                    <Edit3 size={14} /> EDIT
                  </button>
                  <button onClick={() => onDelete(item, catId)} className="text-[#ff4d4d]/80 hover:text-[#ff4d4d] flex items-center gap-2 text-xs font-semibold transition-colors">
                    <Trash2 size={14} /> DELETE
                  </button>
                </div>
                <button
                  onClick={() => onCopy(activeResp.text, copyId)}
                  className={`px-5 py-2 rounded-full flex items-center gap-2 text-xs font-semibold transition-all ${
                    isCopied ? 'bg-[#baff55] text-black' : 'bg-white text-black hover:bg-gray-200'
                  }`}
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  {isCopied ? 'COPIED' : 'COPY TEXT'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Footer (Tags & Status) */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex flex-col gap-2">
             <span className="text-xs text-[#8e8e93] font-medium">Source</span>
             <div className="flex gap-2 flex-wrap">
               {item.triggers && item.triggers.length > 0 ? (
                 item.triggers.slice(0, 2).map((t, i) => (
                   <span key={i} className="pill-dark text-[11px] px-3 py-1 font-semibold capitalize">{t}</span>
                 ))
               ) : (
                 <span className="pill-dark text-[11px] px-3 py-1 font-semibold text-[#8e8e93]">General</span>
               )}
             </div>
          </div>

          <div className="flex flex-col items-end gap-2">
             <span className="text-xs text-[#8e8e93] font-medium">Score</span>
             <div className="flex gap-1.5 bg-[#161616] p-1.5 rounded-full border border-[#3a3b3f]">
               <div className="status-dot-red" />
               <div className="status-dot-orange" />
               <div className="status-dot-yellow" />
               <div className={responses.length > 1 ? "status-dot-green" : "status-dot-gray"} />
               <div className={responses.length > 2 ? "status-dot-green" : "status-dot-gray"} />
             </div>
          </div>
        </div>
        
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
        const input = document.getElementById('templates-search-input');
        input?.focus();
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
  
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Flatten the grouped data into a list of individual templates for the new grid layout
  const flatTemplates = useMemo(() => {
    if (!data) return [];
    const all = [];
    data.forEach(cat => {
      cat.templates.forEach(t => {
        all.push({ ...t, categoryName: cat.category, catId: cat.id });
      });
    });

    if (!searchQuery) return all;

    return all.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.triggers || []).some(tr => tr.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.responses.some(r => r.text.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const availableCategories = useMemo(() => {
    if (!data) return [];
    return data.map(d => d.category).sort();
  }, [data]);

  const handleEdit = (item, catId) => {
    setIsEditing(true);
    setEditId(catId);
    const standard = item.responses.find(r => r.type === 'Standard')?.text || '';
    const empathy = item.responses.find(r => r.type === 'High Empathy')?.text || '';
    const security = item.responses.find(r => r.type === 'Security')?.text || '';
    
    setNewTemplate({
      category: data.find(c => c.id === catId)?.category || '',
      title: item.title,
      standardText: standard,
      empathyText: empathy,
      securityText: security,
      triggers: (item.triggers || []).join(', ')
    });
    setModalOpen(true);
  };

  const handleDelete = async (item, catId) => {
    if (!window.confirm(`Are you sure you want to delete "${item.title}"?`)) return;
    const category = data.find(c => c.id === catId);
    if (!category) return;
    const updatedTemplates = category.templates.filter(t => t.title !== item.title);
    
    try {
      let success;
      if (updatedTemplates.length === 0) {
        success = await actions.deleteRecord('supportTemplates', catId);
      } else {
        success = await actions.updateRecord('supportTemplates', catId, { templates: updatedTemplates });
      }
      if (success) {
        showToast('Template purged.', 'success');
        actions.refreshAll();
      }
    } catch (err) {
      showToast('Purge failed.', 'error');
    }
  };

  const handleCreate = async () => {
    if (!newTemplate.category || !newTemplate.title || !newTemplate.standardText) {
      showToast('Please fill required fields', 'error');
      return;
    }
    const responses = [{ type: 'Standard', text: newTemplate.standardText }];
    if (newTemplate.empathyText) responses.push({ type: 'High Empathy', text: newTemplate.empathyText });
    if (newTemplate.securityText) responses.push({ type: 'Security', text: newTemplate.securityText });

    const triggers = newTemplate.triggers 
      ? newTemplate.triggers.split(',').map(t => t.trim().toLowerCase())
      : [newTemplate.title.toLowerCase()];

    try {
      let success;
      if (isEditing) {
        const category = data.find(c => c.id === editId);
        const otherTemplates = category.templates.filter(t => t.title !== newTemplate.title);
        success = await actions.updateRecord('supportTemplates', editId, {
          category: newTemplate.category,
          templates: [...otherTemplates, { title: newTemplate.title, responses, triggers }]
        });
      } else {
        success = await actions.createRecord('supportTemplates', {
          category: newTemplate.category,
          templates: [{ title: newTemplate.title, responses, triggers }]
        });
      }

      if (success) {
        showToast(isEditing ? 'Template updated!' : 'Template deployed!', 'success');
        setModalOpen(false);
        setIsEditing(false);
        setEditId(null);
        setNewTemplate({ category: '', title: '', standardText: '', empathyText: '', securityText: '', triggers: '' });
        actions.refreshAll();
      }
    } catch (err) {
      showToast('Operation failed', 'error');
    }
  };

  if (loading.templates && !isReady) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-[#baff55]">
        <RotateCcw size={40} />
      </motion.div>
      <p className="text-xs font-semibold text-[#8e8e93]">Loading Matrix...</p>
    </div>
  );

  return (
    <div className="min-h-screen text-white w-full flex flex-col bg-[#161616]">
      
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-50 bg-[#161616] border-b border-[#3a3b3f] py-6 px-10">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="pill-white">All</button>
              <button className="pill-dark flex items-center gap-2">
                <span className="text-[#ff4d4d]">🔥</span> Hot
              </button>
              <button className="pill-dark">Due Today</button>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setModalOpen(true)} className="pill-white flex items-center gap-2">
                <Plus size={16} /> New Task
              </button>
              <button className="icon-btn-dark"><Download size={18} /></button>
              <button className="icon-btn-dark"><Sparkles size={18} /></button>
            </div>
          </div>

          {/* SEARCH BAR (Matte Style) */}
          <div className="relative max-w-2xl w-full">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search size={20} className="text-[#8e8e93]" />
            </div>
            <input 
              id="templates-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full bg-[#2a2b2f] border border-[#3a3b3f] text-white rounded-full py-4 pl-14 pr-16 focus:outline-none focus:border-[#baff55] transition-colors"
            />
            <div className="absolute inset-y-0 right-0 pr-6 flex items-center">
               {!searchQuery ? (
                 <span className="text-xs font-semibold text-[#8e8e93] bg-[#161616] px-2 py-1 rounded-md border border-[#3a3b3f]">Ctrl+K</span>
               ) : (
                 <button onClick={() => setSearchQuery('')} className="text-[#8e8e93] hover:text-white"><X size={16}/></button>
               )}
            </div>
          </div>

        </div>
      </header>

      {/* TEMPLATES GRID */}
      <main className="max-w-[1600px] mx-auto w-full p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {flatTemplates.map((t, idx) => (
            <MatteTemplateCard 
              key={`${t.catId}-${idx}`}
              item={t}
              category={t.categoryName}
              catId={t.catId}
              copiedId={copiedId}
              onCopy={handleCopy}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {flatTemplates.length === 0 && (
          <div className="mt-20 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-[#2a2b2f] rounded-full flex items-center justify-center mb-6">
              <Search size={32} className="text-[#8e8e93]" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">No templates found</h2>
            <p className="text-[#8e8e93]">Try adjusting your search criteria.</p>
          </div>
        )}
      </main>

      {/* CREATE/EDIT MODAL */}
      <Dialog 
        open={modalOpen} 
        onClose={() => { setModalOpen(false); setIsEditing(false); }} 
        maxWidth="sm" 
        fullWidth 
        PaperProps={{ style: { background: '#2a2b2f', borderRadius: 32, border: '1px solid #3a3b3f', color: '#fff', padding: 16 } }}
      >
        <DialogTitle className="font-semibold text-xl text-white">
          {isEditing ? 'Edit Template' : 'New Template'}
        </DialogTitle>
        <DialogContent className="pt-4">
          <div className="flex flex-col gap-5 mt-2">
            <FormControl fullWidth>
              <InputLabel style={{ color: '#8e8e93' }}>Category</InputLabel>
              <Select 
                label="Category" 
                value={isNewCategory ? "NEW" : newTemplate.category} 
                onChange={e => { 
                  if (e.target.value === "NEW") { setIsNewCategory(true); setNewTemplate({ ...newTemplate, category: "" }); } 
                  else { setIsNewCategory(false); setNewTemplate({ ...newTemplate, category: e.target.value }); } 
                }} 
                style={{ color: '#fff', background: '#161616', borderRadius: 16 }}
              >
                {availableCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                <MenuItem value="NEW" style={{ color: '#baff55' }}>+ NEW CATEGORY</MenuItem>
              </Select>
            </FormControl>
            {isNewCategory && <TextField label="New Category Name" fullWidth variant="outlined" value={newTemplate.category} onChange={e => setNewTemplate({ ...newTemplate, category: e.target.value })} InputProps={{ style: { color: '#fff', background: '#161616', borderRadius: 16 } }} InputLabelProps={{ style: { color: '#8e8e93' } }} autoFocus />}
            <TextField label="Title" fullWidth variant="outlined" value={newTemplate.title} onChange={e => setNewTemplate({ ...newTemplate, title: e.target.value })} InputProps={{ style: { color: '#fff', background: '#161616', borderRadius: 16 } }} InputLabelProps={{ style: { color: '#8e8e93' } }} />
            <TextField label="Source / Triggers (comma separated)" fullWidth variant="outlined" value={newTemplate.triggers} onChange={e => setNewTemplate({ ...newTemplate, triggers: e.target.value })} InputProps={{ style: { color: '#fff', background: '#161616', borderRadius: 16 } }} InputLabelProps={{ style: { color: '#8e8e93' } }} />
            
            <div className="border-t border-[#3a3b3f] pt-4">
               <h4 className="text-xs font-semibold text-[#8e8e93] mb-4">Response Variants</h4>
               <div className="flex flex-col gap-4">
                 <TextField label="Standard Response" fullWidth multiline rows={3} value={newTemplate.standardText} onChange={e => setNewTemplate({ ...newTemplate, standardText: e.target.value })} InputProps={{ style: { color: '#fff', background: '#161616', borderRadius: 16 } }} InputLabelProps={{ style: { color: '#8e8e93' } }} />
                 <TextField label="Alternative Response 1" fullWidth multiline rows={2} value={newTemplate.empathyText} onChange={e => setNewTemplate({ ...newTemplate, empathyText: e.target.value })} InputProps={{ style: { color: '#fff', background: '#161616', borderRadius: 16 } }} InputLabelProps={{ style: { color: '#8e8e93' } }} />
               </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="pr-4 pb-4">
          <button onClick={() => { setModalOpen(false); setIsEditing(false); }} className="pill-dark mr-2">Cancel</button>
          <button onClick={handleCreate} className="pill-lime">{isEditing ? 'Save Changes' : 'Deploy'}</button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Templates;
