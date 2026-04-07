import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Copy, 
  Edit2, 
  Trash2, 
  MessageCircle,
  ChevronRight,
  ArrowLeft,
  LayoutGrid,
  Filter
} from 'lucide-react';
import { useFirebaseData } from '../hooks/useFirebase';
import { useToast } from '../context/ToastContext';

import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Tooltip
} from '@mui/material';

const Templates = () => {
  const { data, loading, setAllData } = useFirebaseData('supportTemplates', []);
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title: '', standardText: '', empathyText: '' });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  const categories = useMemo(() => {
    return data.map(c => c.category).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    let result = data;
    if (selectedCategory) {
      result = data.filter(c => c.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.map(cat => ({
        ...cat,
        templates: (cat.templates || []).filter(tpl => 
          tpl.title.toLowerCase().includes(q) || 
          tpl.responses?.some(r => r.text.toLowerCase().includes(q))
        )
      })).filter(cat => cat.templates.length > 0);
    }
    return result;
  }, [data, selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col lg:flex-row min-h-full">
      {/* 1. Contextual Category Sidebar (Desktop Only) */}
      <aside className="hidden lg:flex flex-col w-72 bg-sidebar/30 border-r border-white/5 p-6 space-y-8 sticky top-0 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Navigation Library</h2>
          <Filter size={12} className="text-gray-700" />
        </div>
        
        <nav className="space-y-2">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
              !selectedCategory 
                ? "bg-red-500/10 text-red-500 border border-red-500/20 shadow-lg shadow-red-500/5 rotate-[-1deg]" 
                : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <LayoutGrid size={16} className={!selectedCategory ? "text-red-500" : "group-hover:text-red-400"} />
            <span className="flex-1 text-sm font-bold text-left">All Entries</span>
            <ChevronRight size={14} className={`transition-opacity ${!selectedCategory ? "opacity-100" : "opacity-0"}`} />
          </button>

          <div className="h-px bg-white/5 my-4" />

          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-300 group relative ${
                selectedCategory === cat 
                  ? "bg-white/[0.03] text-white border border-white/10 shadow-2xl" 
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                selectedCategory === cat ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-white/10 group-hover:bg-white/30"
              }`} />
              <span className="flex-1 text-xs font-black uppercase tracking-tight text-left truncate">{cat}</span>
              {selectedCategory === cat && (
                <motion.div layoutId="activeCat" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-600 rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 rounded-2xl bg-black/20 border border-white/5 italic">
          <p className="text-[9px] text-gray-700 leading-relaxed font-bold">
            Select a specific library segment to access optimized synchronization payloads.
          </p>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col p-4 md:p-8 space-y-6">
        {/* Mobile Category Switcher (Horizontal Scroll) */}
        <div className="lg:hidden w-full overflow-x-auto pb-4 no-scrollbar relative z-10 touch-pan-x">
          <div className="flex items-center gap-3 w-max px-1">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${
                !selectedCategory ? "bg-red-500 border-red-500 text-white" : "bg-white/5 border-white/10 text-gray-500"
              }`}
            >
              All Areas
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${
                  selectedCategory === cat ? "bg-red-500 border-red-500 text-white" : "bg-white/5 border-white/10 text-gray-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-1 items-center justify-between gap-4 w-full">
            <div className="flex flex-1 items-center gap-4 min-w-0">
              {selectedCategory && (
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="p-3 text-gray-500 hover:text-white bg-white/5 rounded-2xl border border-white/5 transition-all group shrink-0"
                >
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-3xl font-black text-white font-heading tracking-tighter uppercase leading-none truncate">
                    {selectedCategory || "Global Library"}
                  </h1>
                  {/* Mobile Search Input Icon */}
                  <div className="sm:hidden relative flex items-center shrink-0">
                    <Search className="absolute left-2.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-9 h-9 focus:w-36 transition-all duration-300 bg-white/5 border border-white/10 rounded-full pl-8 pr-3 text-white text-[10px] focus:bg-[#0f0f17] outline-none placeholder-transparent focus:placeholder-gray-600 focus:ring-1 focus:ring-red-500/50"
                      placeholder="Search..."
                    />
                  </div>
                </div>
                <p className="hidden sm:block text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic decoration-red-500/20 underline">
                  {selectedCategory ? "Contextual Segment Active" : "Operational Core Index"}
                </p>
              </div>
            </div>
            
            {/* Mobile Initialize Record Collapsed Button */}
            <button 
              onClick={() => setModalOpen(true)}
              className="sm:hidden p-3 accent-gradient text-white rounded-2xl font-black shadow-xl shrink-0"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>
          
          {/* Desktop Initialize Record */}
          <button 
            onClick={() => setModalOpen(true)}
            className="hidden sm:flex px-8 py-4 accent-gradient text-white rounded-2xl font-black hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-500 items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] shadow-xl shrink-0"
          >
            <Plus size={18} strokeWidth={3} />
            Initialize Record
          </button>
        </div>

        {/* Advanced Search (Desktop Only) */}
        <div className="hidden sm:block relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 group-focus-within:text-red-500 transition-colors" />
          <input
            type="text"
            placeholder="Search within current synchronized area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-[#0f0f17] border border-white/5 rounded-3xl text-white placeholder-gray-700 focus:outline-none focus:border-white/10 focus:ring-4 focus:ring-red-500/5 transition-all shadow-2xl"
          />
        </div>

        {/* Templates Display Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
          <AnimatePresence>
            {filteredData.map((category) => (
              category.templates?.map((template, tplIndex) => (
                <motion.div
                  key={`${category.category}-${template.title}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group relative bg-[#0f0f17] rounded-[32px] p-1 border border-white/[0.03] hover:border-white/10 transition-all duration-500 shadow-xl overflow-hidden"
                >
                  <div className="relative z-10 p-6 space-y-6">
                    {/* Template Card Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/[0.03]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                          <MessageCircle className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors" />
                        </div>
                        <div>
                          <h4 className="text-white font-black uppercase tracking-tight text-sm font-heading">{template.title}</h4>
                          <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{category.category}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-2 text-gray-700 hover:text-white transition-all opacity-0 group-hover:opacity-100" onClick={() => handleCopy(template.title)}><Copy size={16} /></button>
                        <button className="p-2 text-gray-700 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                      </div>
                    </div>

                    {/* Responses with Highlighting */}
                    <div className="space-y-4">
                      {template.responses?.map((resp, rIndex) => (
                        <div 
                          key={rIndex} 
                          className="relative p-5 rounded-2xl bg-black/40 border border-white/[0.02] hover:bg-black/60 transition-all group/resp cursor-pointer overflow-hidden shadow-sm hover:shadow-red-500/5"
                          onClick={() => handleCopy(resp.text)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className={`px-2.5 py-1 text-[8px] uppercase tracking-[0.2em] font-black rounded border ${
                              resp.type === 'Standard' 
                                ? 'bg-blue-500/5 text-blue-400 border-blue-500/10' 
                                : 'bg-pink-500/5 text-pink-400 border-pink-500/10'
                            }`}>
                              {resp.type}
                            </span>
                            <div className="w-6 h-1 bg-white/5 rounded-full" />
                          </div>
                          <div className="text-gray-500 text-xs md:text-sm leading-relaxed font-medium">
                            {resp.text}
                          </div>
                          
                          {/* Copy Success Feedback Overlay */}
                          <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover/resp:opacity-5 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))
            ))}
          </AnimatePresence>

          {filteredData.length === 0 && !loading && (
            <div className="col-span-full py-40 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto border border-white/5 text-gray-700">
                <Search size={32} />
              </div>
              <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] font-heading italic underline decoration-red-500/20">
                No synchronized data matches the current query
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Initialize Record Dialog (Simplified for Revamp) */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ elevation: 0 }}>
        <DialogTitle className="font-heading font-black text-white border-b border-white/5 px-8 py-6 uppercase tracking-tighter">Initialize Segment Record</DialogTitle>
        <DialogContent className="space-y-6 pt-8 px-8 bg-[#0a0a0f]">
          <TextField 
            label="ID / Identifier" 
            fullWidth 
            value={newTemplate.title} 
            onChange={e => setNewTemplate({ ...newTemplate, title: e.target.value })} 
          />
          <TextField label="Default Payload (Standard)" fullWidth multiline rows={3} value={newTemplate.standardText} onChange={e => setNewTemplate({ ...newTemplate, standardText: e.target.value })} />
          <TextField label="Refined Payload (Empathy)" fullWidth multiline rows={3} value={newTemplate.empathyText} onChange={e => setNewTemplate({ ...newTemplate, empathyText: e.target.value })} />
        </DialogContent>
        <DialogActions className="px-8 py-6 border-t border-white/5 bg-black">
          <button onClick={() => setModalOpen(false)} className="px-6 py-3 text-[10px] font-black text-gray-600 hover:text-white transition-colors uppercase tracking-[0.2em]">Abort</button>
          <button onClick={() => showToast('Write logic not updated for new structure', 'info')} className="px-10 py-3 accent-gradient text-white rounded-xl font-black text-[10px] shadow-2xl shadow-red-500/20 uppercase tracking-[0.2em]">Deploy Record</button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Templates;
