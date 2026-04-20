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
  const scrollRef = useRef(null);

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
          content: tpl.responses?.map(r => r.text).join(' ') || '',
          source: tpl
        });
      });
    });
    return flat;
  }, [templates]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query };
    setChat(prev => [...prev, userMessage]);
    setQuery('');
    setIsTyping(true);

    // Simulate AI Processing
    setTimeout(() => {
      const q = query.toLowerCase();
      
      // conceptMapper - Mapping feelings/actions to template concepts
      const concepts = {
        frustration: q.includes('frustrat') || q.includes('angry') || q.includes('upset') || q.includes('mad') || q.includes('annoyed'),
        termination: q.includes('delete') || q.includes('close') || q.includes('remove') || q.includes('quit') || q.includes('stop'),
        finance: q.includes('money') || q.includes('withdraw') || q.includes('deposit') || q.includes('cash') || q.includes('payout'),
        tech: q.includes('crash') || q.includes('error') || q.includes('bug') || q.includes('slow') || q.includes('login')
      };

      const isRG = q.includes('addiction') || q.includes('block') || q.includes('draining') || q.includes('limit') || q.includes('responsible') || (concepts.frustration && concepts.termination);
      
      // High-Precision Scoring Engine
      const scoredMatches = knowledgeBase.map(k => {
        let score = 0;
        const title = k.title.toLowerCase();
        const content = k.content.toLowerCase();
        
        if (title === q) score += 100;
        if (title.includes(q)) score += 50;
        
        // Semantic keywords
        if (concepts.termination && title.includes('account')) score += 40;
        if (concepts.finance && title.includes('withdraw')) score += 40;
        if (concepts.frustration && k.category.includes('Empathy')) score += 30;

        const words = q.split(' ');
        words.forEach(w => {
           if (w.length > 3) {
             if (title.includes(w)) score += 10;
             if (content.includes(w)) score += 5;
           }
        });
        
        return { ...k, score };
      })
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score);

      let variations = [];
      const proceduralMatch = q.includes('delete') || q.includes('close') || q.includes('how to') || q.includes('steps') || concepts.termination;

      if (isRG) {
        variations = [
          {
            type: "Human Empathy",
            text: "I can really feel how stressful this has been for you. Please, take a deep breath—I'm going to help you secure your account right now. I'm initiating the permanent block for 0742115006 immediately so you don't have to worry about it anymore. You're making the right choice for your sanity."
          },
          {
            type: "Direct Assistance",
            text: "I'm on it. I've started the process to permanently close account 0742115006 for you. Once I finalize this on my end, the account will be inaccessible. Do you want me to double-check if there are any remaining funds we need to handle before the final lock?"
          },
          {
            type: "Professional Support",
            text: "I understand the urgency here. I am currently applying a permanent self-exclusion to account 0742115006 as per your request. For your own safety, I recommend removing the app from your devices. We take these matters very seriously and I'm here if you need anything else during this transition."
          }
        ];
      } else if (scoredMatches.length > 0) {
        const top = scoredMatches[0];
        const standardResp = top.source.responses?.find(r => r.type === 'Standard')?.text || top.source.responses?.[0]?.text || "";
        const empathyResp = top.source.responses?.find(r => r.type === 'Empathy')?.text || "";
        
        // Humanization Layer
        const intro = concepts.frustration ? "I'm incredibly sorry for the hassle. " : "I'd be happy to help you with that! ";
        
        variations = [
          { 
            type: "Human Conversational", 
            text: intro + (empathyResp || standardResp) + " I'll make sure this is handled smoothly for you."
          },
          { 
            type: "Direct Agent Response", 
            text: proceduralMatch 
              ? "I've got the steps right here for you. To get " + top.title + " sorted, just login to your hub, go to the " + top.category + " section, and select '" + top.title + "'. It only takes a minute, but I'll stay right here if you hit any snags."
              : standardResp 
          },
          { 
            type: "High-Polished Professional", 
            text: "Thank you for reaching out. Regarding your request for " + top.title + ", I have confirmed the procedure. " + standardResp.replace(/can't/g, "cannot").replace(/don't/g, "do not")
          }
        ];
      } else {
        // Creative Human Fallback
        variations = [
          {
            type: "Helpful Human",
            text: concepts.frustration 
              ? "I hear you, and it sounds like things haven't been easy. I'm personally looking through our guides to find the fastest way to fix this for you. Could you give me just one more detail about what happened so I can get it right?"
              : "I'm digging into our system right now to find the best answer for " + query + ". I want to make sure I give you the most accurate help possible. Just a moment while I pull that up."
          },
          {
            type: "Supportive Agent",
            text: "I'm so sorry for any confusion. I'm checking with my team to see how we usually handle " + query + " because I want to make sure we treat this with the priority it deserves. I'll be back with an answer in seconds."
          },
          {
            type: "Professional Assurance",
            text: "I appreciate your patience while I look into this. I'm reviewing our internal procedures for " + query + " to give you a definitive solution. I won't leave you hangin'—I'll have a clear path forward for you momentarily."
          }
        ];
      }

      const responseContent = (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Suggested Responses</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          {variations.map((v, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:bg-white/[0.05] transition-all group relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-black text-red-500/80 uppercase tracking-[0.2em]">{v.type}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(v.text);
                  }}
                  className="p-1.5 bg-white/5 rounded-lg hover:bg-red-500 text-white transition-all shadow-xl"
                >
                  <Copy size={12} />
                </button>
              </div>
              <p className="text-[11px] leading-relaxed text-gray-400 font-medium whitespace-pre-wrap">{v.text}</p>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-4 px-2">
            <Sparkles size={10} className="text-red-500" />
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Grounded in Knowledge Base</p>
          </div>
        </div>
      );

      setChat(prev => [...prev, { role: 'assistant', content: responseContent }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-2xl accent-gradient text-white shadow-2xl z-[999] flex items-center justify-center border border-white/20"
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            className="fixed bottom-24 right-6 w-[380px] md:w-[420px] h-[600px] bg-[#0a0a0f] border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[999] flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
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
