import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Copy, 
  Trash2, 
  MessageCircle,
  ArrowLeft,
  LayoutGrid,
  Filter,
  X,
  CreditCard,
  Wrench,
  HelpCircle,
  FileText,
  MessageSquare,
  Shield,
  Zap,
  Folder,
  Phone,
  ShoppingCart,
  Menu,
  Terminal,
  Calendar,
  Package,
  RotateCcw,
  Tag,
  ThumbsUp,
  User,
  HandCoins,
  ServerCrash,
  PhoneCall,
  BrainCircuit,
  BadgePercent,
  Gamepad2,
  Hourglass,
  Wallet,
  Trophy,
  Stamp,
  UserCog,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

import { useSupabaseData } from '../context/SupabaseDataContext';

import { useToast } from '../context/ToastContext';
import KeywordHighlighter from '../components/KeywordHighlighter';
import { SmartAssistant } from '../components/SmartAssistant';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Tooltip
} from '@mui/material';

// Helper for dynamic colors based on category
const getCategoryColor = (category) => {
  if (!category) return "text-red-500";
  const name = category.toLowerCase();
  
  if (name.includes('sport') || name.includes('bet')) return "text-orange-500";
  if (name.includes('promot')) return "text-red-500";
  if (name.includes('account manage')) return "text-amber-500";
  if (name.includes('responsib') || name.includes('18+') || name.includes('gamble aware') || name.includes('gaming')) return "text-rose-500";
  if (name.includes('ai') || name.includes('bot') || name.includes('auto')) return "text-cyan-400";
  if (name.includes('cashback') || name.includes('cash back') || name.includes('bonus')) return "text-rose-400";
  if (name.includes('casino') || name.includes('game') || name.includes('crash') || name.includes('play')) return "text-fuchsia-500";
  if (name.includes('patience') || name.includes('wait') || name.includes('delay') || name.includes('time')) return "text-orange-400";
  if (name.includes('withdraw') || name.includes('payout') || name.includes('cashout')) return "text-indigo-400";
  if (name.includes('deposit') || name.includes('fund')) return "text-emerald-400";
  if (name.includes('bill') || name.includes('pay') || name.includes('financ') || name.includes('invoice')) return "text-green-500";
  if (name.includes('tech') || name.includes('bug') || name.includes('fix') || name.includes('dev') || name.includes('error')) return "text-orange-500";
  if (name.includes('account') || name.includes('user') || name.includes('profile') || name.includes('login')) return "text-blue-400";
  if (name.includes('order') || name.includes('ship') || name.includes('track') || name.includes('deliver') || name.includes('pack')) return "text-purple-400";
  if (name.includes('cart') || name.includes('shop')) return "text-pink-400";
  if (name.includes('book') || name.includes('appoint') || name.includes('schedul')) return "text-indigo-400";
  if (name.includes('refund') || name.includes('return') || name.includes('cancel')) return "text-rose-500";
  if (name.includes('promo') || name.includes('offer') || name.includes('discount') || name.includes('sale')) return "text-yellow-400";
  if (name.includes('sec') || name.includes('auth') || name.includes('pass') || name.includes('verif')) return "text-teal-400";
  if (name.includes('chat') || name.includes('msg') || name.includes('message') || name.includes('email')) return "text-sky-400";
  if (name.includes('call') || name.includes('phone') || name.includes('contact')) return "text-cyan-400";
  if (name.includes('help') || name.includes('support') || name.includes('faq') || name.includes('question')) return "text-amber-400";
  if (name.includes('fast') || name.includes('quick') || name.includes('urgent')) return "text-yellow-500";
  if (name.includes('feed') || name.includes('review') || name.includes('rate') || name.includes('complaint')) return "text-fuchsia-400";
  if (name.includes('doc') || name.includes('temp') || name.includes('info') || name.includes('policy')) return "text-slate-300";
  
  return "text-gray-400";
};

// Helper for dynamic icons with vibrant emotional colors
const getCategoryIcon = (category, size = 18, baseClass = "") => {
  if (!category) return <div className={`text-red-500 flex items-center justify-center ${baseClass}`}><LayoutGrid size={size} /></div>;
  const name = category.toLowerCase();
  
  // Specific User Requests
  if (name.includes('sport') || name.includes('bet')) {
    return <div className={`text-orange-600 drop-shadow-[0_0_8px_rgba(234,88,12,0.5)] flex items-center justify-center ${baseClass}`}><Trophy size={size} /></div>;
  }
  if (name.includes('promot')) {
    return <div className={`text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] flex items-center justify-center ${baseClass}`}><Stamp size={size} /></div>;
  }
  if (name.includes('account manage')) {
    return <div className={`text-amber-500 drop-shadow-[1_1_8px_rgba(245,158,11,0.5)] flex items-center justify-center ${baseClass}`}><UserCog size={size} /></div>;
  }
  if (name.includes('responsib') || name.includes('18+') || name.includes('gamble aware') || name.includes('gaming')) {
    return <div className={`text-rose-600 drop-shadow-[0_0_8px_rgba(225,29,72,0.5)] flex items-center justify-center ${baseClass}`}><ShieldAlert size={size} /></div>;
  }

  // AI / Automation
  if (name.includes('ai') || name.includes('bot') || name.includes('auto')) {
    return <div className={`text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.4)] flex items-center justify-center ${baseClass}`}><BrainCircuit size={size} /></div>;
  }
  // Cashback / Bonus 
  if (name.includes('cashback') || name.includes('cash back') || name.includes('bonus')) {
    return <div className={`text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.4)] flex items-center justify-center ${baseClass}`}><BadgePercent size={size} /></div>;
  }
  // Casino / Games / Crash
  if (name.includes('casino') || name.includes('game') || name.includes('crash') || name.includes('play')) {
    return <div className={`text-fuchsia-500 drop-shadow-[0_0_8px_rgba(217,70,239,0.4)] flex items-center justify-center ${baseClass}`}><Gamepad2 size={size} /></div>;
  }
  // Patience / Time / Delays
  if (name.includes('patience') || name.includes('wait') || name.includes('delay') || name.includes('time')) {
    return <div className={`text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.4)] flex items-center justify-center ${baseClass}`}><Hourglass size={size} /></div>;
  }
  // Withdrawal / Payout
  if (name.includes('withdraw') || name.includes('payout') || name.includes('cashout')) {
    return <div className={`text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.4)] flex items-center justify-center ${baseClass}`}><Wallet size={size} /></div>;
  }
  // Deposit match as requested
  if (name.includes('deposit') || name.includes('fund')) {
    return <div className={`text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)] flex items-center justify-center ${baseClass}`}><HandCoins size={size} /></div>;
  }
  // Billing / Payment
  if (name.includes('bill') || name.includes('pay') || name.includes('financ') || name.includes('invoice')) {
    return <div className={`text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)] flex items-center justify-center ${baseClass}`}><CreditCard size={size} /></div>;
  }
  // Tech / Engineering (Server crash or terminal)
  if (name.includes('tech') || name.includes('bug') || name.includes('fix') || name.includes('dev') || name.includes('error')) {
    return <div className={`text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)] flex items-center justify-center ${baseClass}`}><ServerCrash size={size} /></div>;
  }
  // Account / User
  if (name.includes('account') || name.includes('user') || name.includes('profile') || name.includes('login')) {
    return <div className={`text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.4)] flex items-center justify-center ${baseClass}`}><User size={size} /></div>;
  }
  // Orders / Shipping
  if (name.includes('order') || name.includes('ship') || name.includes('track') || name.includes('deliver') || name.includes('pack')) {
    return <div className={`text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.4)] flex items-center justify-center ${baseClass}`}><Package size={size} /></div>;
  }
  if (name.includes('cart') || name.includes('shop')) {
    return <div className={`text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.4)] flex items-center justify-center ${baseClass}`}><ShoppingCart size={size} /></div>;
  }
  // Booking / Appointment
  if (name.includes('book') || name.includes('appoint') || name.includes('schedul')) {
    return <div className={`text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.4)] flex items-center justify-center ${baseClass}`}><Calendar size={size} /></div>;
  }
  // Refunds / Returns
  if (name.includes('refund') || name.includes('return') || name.includes('cancel')) {
    return <div className={`text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)] flex items-center justify-center ${baseClass}`}><RotateCcw size={size} /></div>;
  }
  // Sales / Promo
  if (name.includes('promo') || name.includes('offer') || name.includes('discount') || name.includes('sale')) {
    return <div className={`text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)] flex items-center justify-center ${baseClass}`}><Tag size={size} /></div>;
  }
  // Security / Privacy
  if (name.includes('sec') || name.includes('auth') || name.includes('pass') || name.includes('verif')) {
    return <div className={`text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.4)] flex items-center justify-center ${baseClass}`}><Shield size={size} /></div>;
  }
  // Communications
  if (name.includes('chat') || name.includes('msg') || name.includes('message') || name.includes('email')) {
    return <div className={`text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)] flex items-center justify-center ${baseClass}`}><MessageSquare size={size} /></div>;
  }
  if (name.includes('call') || name.includes('phone') || name.includes('contact')) {
    return <div className={`text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] flex items-center justify-center ${baseClass}`}><PhoneCall size={size} /></div>;
  }
  // Support / Help
  if (name.includes('help') || name.includes('support') || name.includes('faq') || name.includes('question')) {
    return <div className={`text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] flex items-center justify-center ${baseClass}`}><HelpCircle size={size} /></div>;
  }
  if (name.includes('fast') || name.includes('quick') || name.includes('urgent')) {
    return <div className={`text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)] flex items-center justify-center ${baseClass}`}><Zap size={size} /></div>;
  }
  // Feedback
  if (name.includes('feed') || name.includes('review') || name.includes('rate') || name.includes('complaint')) {
    return <div className={`text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.4)] flex items-center justify-center ${baseClass}`}><ThumbsUp size={size} /></div>;
  }
  // Docs / Templates
  if (name.includes('doc') || name.includes('temp') || name.includes('info') || name.includes('policy')) {
    return <div className={`text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.4)] flex items-center justify-center ${baseClass}`}><FileText size={size} /></div>;
  }
  
  // Default to a folder
  return <div className={`text-gray-400 flex items-center justify-center ${baseClass}`}><Folder size={size} /></div>;
};

const Templates = () => {
  const { templates: data, loading: globalLoading, actions } = useSupabaseData();
  const loading = globalLoading.templates;
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('AI_AGENT');
  const [modalOpen, setModalOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ category: '', title: '', standardText: '', empathyText: '' });
  
  // Collapse mode toggle: Default navigation displays all categories (expanded) only on large screens
  const [catSidebarOpen, setCatSidebarOpen] = useState(window.innerWidth > 1024);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  const handleAIRefine = (text) => {
    const tones = [
      "Here is a more professional variant: \n" + text.replace(/Hi/g, "Dear User") + "\n\n(Modified by Falme AI)",
      "Here is an ultra-empathy variant: \n" + "I truly understand how frustrating this can be. " + text + "\n\n(Modified by Falme AI)",
      "Here is a concise variant: \n" + text.slice(0, 100) + "...\n\n(Modified by Falme AI)"
    ];
    const refined = tones[Math.floor(Math.random() * tones.length)];
    handleCopy(refined);
    showToast('AI Refinement Copied!', 'success');
  };

  const handleMobileCategorySelect = (cat) => {
    setSelectedCategory(cat);
    // Auto-collapse on mobile after selecting
    if(window.innerWidth < 1024) {
      setCatSidebarOpen(false);
    }
  };

  const categories = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    const unique = new Set(data.map(c => c.category).filter(Boolean));
    return Array.from(unique).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    let result = data;
    
    // Global AI Agent skips specific category filtering to scan the whole DB
    if (selectedCategory && selectedCategory !== 'AI_AGENT') {
      result = data.filter(c => c.category === selectedCategory);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const searchWords = q.split(/\s+/).filter(w => w.length > 2);

      result = result.map(cat => {
        const catNameMatches = cat.category.toLowerCase().includes(q);
        const filteredTemplates = (cat.templates || []).filter(tpl => {
          const title = (tpl.title || "").toLowerCase();
          const responsesText = (tpl.responses || []).map(r => (r.text || "").toLowerCase()).join(" ");
          
          // Match if query is in title, category (if broad), or any response
          const titleMatch = title.includes(q);
          const responseMatch = responsesText.includes(q);
          const wordMatch = searchWords.length > 0 && searchWords.some(w => title.includes(w) || responsesText.includes(w));
          
          return titleMatch || responseMatch || wordMatch || catNameMatches;
        });

        return { ...cat, templates: filteredTemplates };
      }).filter(cat => cat.templates && cat.templates.length > 0);
    }
    return result;
  }, [data, selectedCategory, searchQuery]);

  const handleCreate = async () => {
    if (!newTemplate.category || !newTemplate.title || !newTemplate.standardText) {
      return showToast('Category, ID, and Standard Text are required', 'error');
    }

    const tplObject = {
      title: newTemplate.title,
      responses: [
        { type: 'Standard', text: newTemplate.standardText },
        { type: 'Empathy', text: newTemplate.empathyText || newTemplate.standardText }
      ]
    };

    let updatedData = [...data];
    const catIndex = updatedData.findIndex(c => c.category === newTemplate.category);

    if (catIndex > -1) {
      // Add to existing category
      const currentTemplates = updatedData[catIndex].templates || [];
      updatedData[catIndex] = {
        ...updatedData[catIndex],
        templates: [...currentTemplates, tplObject]
      };
    } else {
      // Create new category
      updatedData.push({
        category: newTemplate.category,
        templates: [tplObject]
      });
    }

    try {
      await actions.setAllData('supportTemplates', updatedData);
      setModalOpen(false);
      setNewTemplate({ category: '', title: '', standardText: '', empathyText: '' });
      showToast('Record deployed successfully', 'success');
    } catch (err) {
      showToast('Failed to sync record', 'error');
    }
  };

  const handleDelete = async (categoryName, templateTitle) => {
    if (!window.confirm('Permanently remove this record?')) return;

    let updatedData = [...data];
    const catIndex = updatedData.findIndex(c => c.category === categoryName);

    if (catIndex > -1) {
      updatedData[catIndex].templates = updatedData[catIndex].templates.filter(t => t.title !== templateTitle);
      
      // Remove empty categories?
      if (updatedData[catIndex].templates.length === 0) {
        updatedData = updatedData.filter(c => c.category !== categoryName);
      }

      try {
        await actions.setAllData('supportTemplates', updatedData);
        showToast('Record purged', 'success');
      } catch (err) {
        showToast('Failed to delete', 'error');
      }
    }
  };

  return (
    <div className="flex flex-row min-h-full">
      {/* Dim Overlay for Mobile Expanded Sidebar */}
      <AnimatePresence>
        {catSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setCatSidebarOpen(false)}
            /* Removed background blur and darkening to keep content fully visible */
            className="lg:hidden fixed inset-0 bg-transparent z-[80]"
          />
        )}
      </AnimatePresence>

      {/* Unified Responsive & Collapsible Category Sidebar */}
      <aside 
        className={`flex flex-col bg-[#0a0a12] lg:bg-sidebar/30 border-r border-white/5 sticky top-0 h-[calc(100vh-80px)] md:h-screen overflow-hidden shrink-0 transition-all duration-300 z-[90] ${
          catSidebarOpen 
            ? 'w-[280px] fixed lg:sticky left-0 shadow-none' 
            : 'w-[75px] sticky shadow-none'
        }`}
      >
        <div className={`flex items-center pt-6 pb-4 border-b border-white/5 transition-all ${
          catSidebarOpen ? 'px-5 justify-between' : 'px-0 justify-center'
        }`}>
          {/* Header Label (hidden when collapsed) */}
          <div className={`items-center gap-2.5 ${catSidebarOpen ? 'flex' : 'hidden'}`}>
            <div className="w-8 h-8 rounded-xl accent-gradient flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
              <Menu size={14} className="text-white" />
            </div>
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Categories</h2>
          </div>
          
          {/* Universal Toggle Button */}
          <button 
            onClick={() => setCatSidebarOpen(!catSidebarOpen)}
            className="p-2.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all active:scale-95 flex-shrink-0"
          >
            {catSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-2 custom-scrollbar px-2 lg:px-3">
          <Tooltip title={!catSidebarOpen ? "Falme AI Agent" : ""} placement="right" arrow>
            <button 
              onClick={() => setSelectedCategory('AI_AGENT')}
              className={`w-full flex py-3 rounded-2xl transition-all duration-300 group relative ${
                selectedCategory === 'AI_AGENT' 
                  ? "bg-red-500/10 text-red-500 border border-red-500/20 shadow-lg shadow-red-500/5 rotate-[-1deg]" 
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              } ${
                catSidebarOpen 
                  ? 'flex-row items-center px-4 gap-3' 
                  : 'flex-col items-center justify-center gap-1.5'
              }`}
            >
              <div className="shrink-0 flex items-center justify-center relative">
                <Sparkles size={18} className={selectedCategory === 'AI_AGENT' ? "text-red-500" : "group-hover:text-red-400"} />
                {/* NEW Badge overlay on icon */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-[#0a0a12] animate-pulse" />
              </div>
              
              <span className={`transition-all ${
                catSidebarOpen 
                  ? 'flex-1 text-sm font-black text-left truncate block opacity-100' 
                  : 'hidden opacity-0'
              }`}>
                Falme AI
              </span>

              {selectedCategory === 'AI_AGENT' && (
                <motion.div layoutId="activeCat" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-600 rounded-r-full" />
              )}
            </button>
          </Tooltip>

          <div className="h-px bg-white/5 my-4" />

          {categories.map((cat) => (
            <Tooltip key={cat} title={!catSidebarOpen ? cat : ""} placement="right" arrow>
              <button 
                onClick={() => handleMobileCategorySelect(cat)}
                className={`w-full flex py-3 rounded-2xl transition-all duration-300 group relative ${
                  selectedCategory === cat 
                    ? "bg-white/[0.04] text-white border border-white/10 shadow-xl" 
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                } ${
                  catSidebarOpen 
                    ? 'flex-row items-center px-4 gap-3' 
                    : 'flex-col items-center justify-center gap-1.5'
                }`}
              >
                <div className="shrink-0 flex items-center justify-center relative">
                   {getCategoryIcon(cat, 18, selectedCategory === cat ? "text-red-500" : "group-hover:text-gray-300 transition-colors")}
                </div>
                
                <span className={`transition-all ${
                  catSidebarOpen 
                    ? 'flex-1 text-sm font-bold text-left truncate block opacity-100' 
                    : 'hidden opacity-0'
                } ${selectedCategory === cat ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                  {cat}
                </span>

                {selectedCategory === cat && (
                  <motion.div layoutId="activeCat" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-600 rounded-r-full" />
                )}
              </button>
            </Tooltip>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 mt-auto">
          <div className={`p-3.5 rounded-2xl bg-black/30 border border-white/5 transition-all ${
            catSidebarOpen ? 'block opacity-100' : 'hidden opacity-0'
          }`}>
            <p className="text-[9px] text-gray-600 leading-relaxed font-bold italic">
              {categories.length} segments available
            </p>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col p-4 md:p-8 space-y-6">
        {/* Dynamic Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-1 items-center justify-between gap-4 w-full">
             {/* Header Left Section */}
            <div className="flex flex-1 items-center gap-4 min-w-0">
              {selectedCategory && (
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="hidden lg:flex p-3 text-gray-500 hover:text-white bg-white/5 rounded-2xl border border-white/5 transition-all group shrink-0"
                >
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-3xl font-black text-white font-heading tracking-tighter uppercase leading-none truncate">
                    {selectedCategory === 'AI_AGENT' ? "Falme AI" : (selectedCategory || "Global Library")}
                  </h1>
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

        {/* Removed redundant top search bar per user request */}

        {/* Templates Display Grid or AI Agent View */}
        {selectedCategory === 'AI_AGENT' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 bg-[#0f0f17] rounded-[32px] border border-white/5 overflow-hidden flex flex-col shadow-2xl relative"
          >
            {/* Embedded AI Assistant Experience */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.02] to-transparent pointer-events-none" />
            <div className="p-8 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-xl shadow-red-500/5">
                  <BrainCircuit size={24} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter">Falme AI</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 animate-pulse">Now processing context from {data.length} segments</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden min-h-[500px]">
               <div className="p-12 space-y-12 flex flex-col items-center justify-center h-full text-center max-w-3xl mx-auto">
                 <div className="space-y-4">
                   <h3 className="text-3xl font-black text-white tracking-tight leading-tight">How can I assist your workflow today?</h3>
                   <p className="text-gray-500 text-sm leading-relaxed">
                     I am directly connected to your operational database. Type any keywords, common client questions, or emotional cues below to retrieve the human-centric response variants.
                   </p>
                 </div>
                 
                 {/* Interactive Type Box */}
                 <div className="w-full relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                       <Search size={22} className="text-gray-700 group-focus-within:text-red-500 transition-colors" />
                       <div className="w-px h-5 bg-white/5" />
                    </div>
                    <input 
                      type="text"
                      className="w-full bg-black/40 border border-white/5 rounded-[24px] py-4 sm:py-6 pl-12 sm:pl-20 pr-16 sm:pr-40 text-sm sm:text-lg text-white font-medium focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 transition-all placeholder-gray-700 shadow-2xl"
                      placeholder="Search for resolution steps, payment rules, or account issues..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button 
                      onClick={() => {
                        if(!searchQuery) showToast('Please enter a query', 'info');
                        // Results will render below due to state change
                      }}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 sm:py-2.5 sm:px-6 rounded-xl sm:rounded-2xl accent-gradient text-white font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform active:scale-95"
                    >
                      <span className="hidden sm:inline">Retrieve</span> <Sparkles size={14} />
                    </button>
                 </div>

                 {/* Template Category Navigation for Falme AI */}
                 <div className="w-full pt-4">
                   {categories.length > 0 ? (
                     <div className="flex flex-wrap items-center justify-center gap-2">
                       {categories.map(cat => (
                         <button
                           key={cat}
                           onClick={() => setSearchQuery(cat)}
                           className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/30 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all shadow-lg"
                         >
                           {cat}
                         </button>
                       ))}
                     </div>
                   ) : (
                     <div className="py-4 text-center">
                       <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em] italic">Knowledge Index Synchronizing...</p>
                     </div>
                   )}
                 </div>

                 {searchQuery ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full space-y-6 text-left"
                    >
                      <div className="flex items-center justify-between px-2">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Contextual Agent Results</h4>
                        <button onClick={() => setSearchQuery('')} className="text-[9px] font-bold text-red-500 uppercase hover:underline">Clear Search</button>
                      </div>
                      
                      <div className="space-y-6">
                        {filteredData.map(cat => (
                          cat.templates.map(tpl => (
                            <div key={tpl.title} className="space-y-4">
                              {/* Parent Title Banner */}
                              <div className="flex items-center gap-3 px-2">
                                <span className="text-[13px] md:text-sm font-black text-white uppercase tracking-tight">{tpl.title}</span>
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                  <div className="w-1 h-1 bg-gray-600 rounded-full" /> {cat.category}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tpl.responses?.map((resp, rIndex) => (
                                  <div 
                                    key={rIndex}
                                    onClick={() => handleCopy(resp.text)}
                                    className="p-5 md:p-6 rounded-[24px] bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] hover:border-red-500/40 hover:shadow-2xl hover:shadow-red-500/10 transition-all group cursor-pointer relative overflow-hidden"
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.02] to-transparent pointer-events-none" />
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                      <span className={`px-2.5 py-1 text-[8px] uppercase tracking-[0.2em] font-black rounded border ${
                                        resp.type === 'Standard' 
                                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                                          : 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                                      }`}>
                                        {resp.type}
                                      </span>
                                      <div className="p-2 rounded-xl bg-white/5 text-gray-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                        <Copy size={14} />
                                      </div>
                                    </div>
                                    <div className="text-[13px] text-gray-200 font-medium whitespace-pre-wrap leading-relaxed relative z-10">
                                      <KeywordHighlighter text={resp.text} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        ))}
                        {filteredData.length === 0 && (
                          <div className="col-span-full py-12 text-center bg-black/20 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">No matching procedural templates found</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                 ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                        {[
                          { label: 'Payment Errors', icon: CreditCard, query: 'deposit error' },
                          { label: 'Addiction Help', icon: ShieldAlert, query: 'draining me' },
                          { label: 'Account Delete', icon: UserCog, query: 'delete account' },
                          { label: 'System Crashes', icon: ServerCrash, query: 'bet failed' }
                        ].map(feat => (
                          <div 
                            key={feat.label} 
                            onClick={() => setSearchQuery(feat.query)}
                            className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center gap-4 hover:bg-white/[0.05] hover:border-red-500/30 transition-all cursor-pointer group"
                          >
                            <feat.icon size={22} className="text-gray-700 group-hover:text-red-500 transition-colors" />
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors">{feat.label}</span>
                          </div>
                        ))}
                    </div>
                 )}
               </div>
            </div>
          </motion.div>
        ) : (
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
                      {/* Template Card Content (Simplified for brevity in diff) */}
                      <div className="flex items-center justify-between pb-4 border-b border-white/[0.03]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                            {getCategoryIcon(category.category, 18, "text-gray-500 group-hover:text-red-500 transition-colors")}
                          </div>
                          <div>
                            <h4 className={`font-black uppercase tracking-tight text-sm font-heading ${getCategoryColor(category.category)}`}>
                              {template.title}
                            </h4>
                            <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{category.category}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {template.responses?.map((resp, rIndex) => (
                          <div 
                            key={rIndex} 
                            className="relative p-5 rounded-2xl bg-black/40 border border-white/[0.02] hover:bg-black/60 transition-all group/resp cursor-pointer overflow-hidden shadow-sm hover:shadow-red-500/5"
                            onClick={() => handleCopy(resp.text)}
                          >
                            <div className="flex items-center justify-between mb-3 min-h-[24px]">
                              <span className={`px-2.5 py-1 text-[8px] uppercase tracking-[0.2em] font-black rounded border ${
                                resp.type === 'Standard' 
                                  ? 'bg-blue-500/5 text-blue-400 border-blue-500/10' 
                                  : 'bg-pink-500/5 text-pink-400 border-pink-500/10'
                              }`}>
                                {resp.type}
                              </span>
                              <div className="flex items-center gap-1">
                                <Tooltip title="AI Refine (Empathy/Tone)" arrow>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleAIRefine(resp.text); }}
                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 opacity-0 group-hover/resp:opacity-100"
                                  >
                                    <Sparkles size={12} />
                                  </button>
                                </Tooltip>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-1.5 rounded-lg bg-white/5 text-gray-500 group-hover/resp:text-white transition-colors border border-white/5 shadow-inner">
                                  <Copy size={12} />
                                </motion.div>
                              </div>
                            </div>
                            <div className="text-gray-500 group-hover/resp:text-gray-300 transition-colors text-xs md:text-sm leading-relaxed font-medium">
                              <KeywordHighlighter text={resp.text} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Initialize Record Dialog */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ elevation: 0 }}>
        <DialogTitle className="font-heading font-black text-white border-b border-white/5 px-8 py-6 uppercase tracking-tighter">Initialize Segment Record</DialogTitle>
        <DialogContent className="space-y-6 pt-8 px-8 bg-[#0a0a0f]">
          <TextField 
            label="Category" 
            fullWidth 
            placeholder="e.g., Deposit, Technical, or New Category"
            value={newTemplate.category} 
            onChange={e => setNewTemplate({ ...newTemplate, category: e.target.value })} 
            autoFocus
          />
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
          <button onClick={handleCreate} className="px-10 py-3 accent-gradient text-white rounded-xl font-black text-[10px] shadow-2xl shadow-red-500/20 uppercase tracking-[0.2em]">Deploy Record</button>
        </DialogActions>
      </Dialog>
      
      {/* Floating Smart Assistant */}
      <SmartAssistant templates={data} />
    </div>
  );
};

export default Templates;
