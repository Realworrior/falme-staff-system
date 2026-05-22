import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  X, 
  Send, 
  MessageSquare, 
  Search, 
  Zap, 
  BrainCircuit,
  Bot,
  User,
  Copy,
  ArrowRight
} from 'lucide-react';
import { Tooltip } from '@mui/material';
import { analyzeClientMessageAsync, fetchGeminiPoolStatus } from '../utils/aiMatcher';

/**
 * SmartAssistant - A floating AI search and knowledge agent
 * @param {Array} templates - Knowledge base of support templates
 * @param {Array} resources - Knowledge base of manual resources (optional)
 */
export const SmartAssistant = ({ templates = [], resources = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState([
    { role: 'assistant', content: "Hello! I'm your Falme Knowledge Assistant. Ask me anything about our support templates or sportsbook rules." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [poolStatus, setPoolStatus] = useState(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchGeminiPoolStatus().then(setPoolStatus);
      const interval = setInterval(() => {
        fetchGeminiPoolStatus().then(setPoolStatus);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, isTyping]);

  // Flattened knowledge for local "AI" search
  const knowledgeBase = useMemo(() => {
    const flat = [];
    templates?.forEach(cat => {
      cat.templates?.forEach(tpl => {
        flat.push({
          type: 'template',
          title: tpl.title,
          category: cat.category,
          content: `${tpl.title} ${cat.category} ${tpl.triggers?.join(' ') || ''} ${tpl.goal || ''} ${tpl.responses?.map(r => r.text).join(' ') || ''}`,
          source: tpl
        });
      });
    });
    return flat;
  }, [templates]);

  const categories = useMemo(() => {
    if (!templates || !Array.isArray(templates)) return [];
    const unique = new Set(templates.map(cat => cat.category).filter(Boolean));
    return Array.from(unique).sort();
  }, [templates]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query };
    setChat(prev => [...prev, userMessage]);
    setQuery('');
    setIsTyping(true);

    // Simulate AI Processing
    setTimeout(() => executeSearch(query), 1500);
  };

  const executeSearch = async (searchQuery) => {
      const result = await analyzeClientMessageAsync(searchQuery, templates);
      
      const responseContent = (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              {(result.emotion?.emoji || '😐')} {(result.emotion?.label || 'Neutral')} Detected
            </span>
            <div className="flex-1 h-px bg-white/5" />
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 ${
              result.isCloud 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${result.isCloud ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {result.isCloud ? 'Cloud AI' : 'Local NLP'}
            </span>
          </div>

          {/* AI Suggestion if no direct match */}
          {result.aiSuggestion && (
            <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4 group relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-black text-purple-500 uppercase tracking-[0.2em]">Contextual Guidance</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(result.aiSuggestion)}
                  className="p-1.5 bg-white/5 rounded-lg hover:bg-purple-500 text-white transition-all shadow-xl"
                >
                  <Copy size={12} />
                </button>
              </div>
              <p className="text-[11px] leading-relaxed text-gray-300 font-medium whitespace-pre-wrap">{result.aiSuggestion}</p>
            </div>
          )}

          {/* Top Matches */}
          {(result.matches || []).map((m, i) => {
            const tone = result.suggestedTone;
            const resp = m.item?.responses?.find(r => r.type === (tone === 'highEmpathy' ? 'High Empathy' : 'Standard')) || m.item?.responses?.[0] || { text: '' };
            
            return (
              <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:bg-white/[0.05] transition-all group relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-black text-red-500/80 uppercase tracking-[0.2em]">
                    {m.item?.title || 'Template'} ({m.confidence || 'Medium'})
                  </span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(resp.text)}
                    className="p-1.5 bg-white/5 rounded-lg hover:bg-red-500 text-white transition-all shadow-xl"
                  >
                    <Copy size={12} />
                  </button>
                </div>
                
                <div className="bg-black/20 rounded-xl p-3 border border-white/5 mb-2">
                  <p className="text-[11px] leading-relaxed text-gray-300 font-medium whitespace-pre-wrap">{resp.text}</p>
                </div>
                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-1 opacity-60">
                  Category: {m.item?.category || 'General'}
                </p>
              </div>
            );
          })}

          <div className="flex items-center gap-2 mt-4 px-2">
            <Sparkles size={10} className="text-red-500" />
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
              AI Insight Engine Online ({(result.detectedLanguage || 'EN').toUpperCase()})
            </p>
          </div>
        </div>
      );

      setChat(prev => [...prev, { role: 'assistant', content: responseContent }]);
      setIsTyping(false);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <Tooltip title="Falme Knowledge Assistant - Ask me anything about templates or rules" placement="left" arrow>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-4 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-accent text-white shadow-lg z-[999] flex items-center justify-center border border-white/20"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X size={28} />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative">
                <BrainCircuit size={28} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-[#12121e] animate-pulse" />
                <div className="absolute -top-6 -left-6 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-lg animate-bounce">NEW</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </Tooltip>

      {/* Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[380px] md:w-[420px] h-[calc(100vh-120px)] sm:h-[600px] max-h-[800px] bg-card border border-border rounded-2xl shadow-xl z-[999] flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <Sparkles size={20} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest font-heading">Falme AI Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active Knowledge Base</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded transition-all border ${showDiagnostics ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'}`}
              >
                {showDiagnostics ? 'Hide Diagnostics' : 'Pool Status'}
              </button>
            </div>

            {/* Diagnostics Panel */}
            <AnimatePresence>
              {showDiagnostics && poolStatus && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-white/5 bg-black/40"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Live Key Pool Status</span>
                      <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Active Route: {poolStatus.activeKeyLabel}</span>
                    </div>
                    {poolStatus.pool.map((k, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg p-2 border border-white/5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${k.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                          <div>
                            <p className="text-[10px] font-bold text-white">{k.label}</p>
                            <p className="text-[8px] text-gray-500 font-mono">{k.maskedKey}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {k.status === 'depleted' ? (
                            <span className="text-[9px] font-black text-red-400 uppercase">Cooldown: {Math.ceil(k.cooldownRemainingMs / 1000)}s</span>
                          ) : (
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
                          )}
                          <div className="flex gap-2 text-[8px] font-bold text-gray-500 mt-0.5">
                            <span className="text-emerald-500/70">{k.successCount} OK</span>
                            <span className="text-red-500/70">{k.failCount} ERR</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Categories */}
            <div className="px-6 py-3 border-b border-white/5 bg-black/20">
              {categories.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        const userMessage = { role: 'user', content: cat };
                        setChat(prev => [...prev, userMessage]);
                        setQuery('');
                        setIsTyping(true);
                        setTimeout(() => executeSearch(cat), 1500);
                      }}
                      className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all whitespace-nowrap"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest text-center">No categories synchronized</p>
              )}
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
              {chat.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${
                    msg.role === 'user' ? 'bg-white/5 border-white/10' : 'bg-red-500/10 border-red-500/20'
                  }`}>
                    {msg.role === 'user' ? <User size={14} className="text-gray-400" /> : <Bot size={14} className="text-red-500" />}
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-[11px] leading-relaxed font-medium ${
                    msg.role === 'user' 
                      ? 'bg-red-600/10 text-white border border-red-500/20 rounded-tr-none' 
                      : 'bg-white/5 text-gray-300 border border-white/5 rounded-tl-none font-bold overflow-hidden'
                  }`}>
                    {typeof msg.content === 'string' 
                      ? msg.content.split('\n').map((line, i) => <p key={i} className={i > 0 ? 'mt-2 border-l-2 border-red-500/30 pl-3 italic' : ''}>{line}</p>)
                      : msg.content
                    }
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <Bot size={14} className="text-red-500" />
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/5 bg-white/[0.02]">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Query knowledge base..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-white text-[11px] focus:outline-none focus:border-red-500/50 transition-all placeholder-gray-700"
                />
                <button
                  type="submit"
                  disabled={!query.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-red-600 text-white rounded-xl hover:bg-red-500 transition-all disabled:opacity-50 disabled:bg-gray-800"
                >
                  <Send size={16} />
                </button>
              </form>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Sport Rules', 'Withdrawal limit', 'Empathy guide'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:border-red-500/30 transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
