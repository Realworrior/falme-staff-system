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
      setIsNewCategory(false);
    }
  };

  const handleConsolidate = async () => {
    if (!data || data.length === 0) return;
    
    setAiLoading(true);
    try {
      const consolidatedMap = {};
      
      data.forEach(record => {
        // Normalization & Manual Alias Mapping
        let rawName = record.category || 'General';
        const upper = rawName.toUpperCase();
        
        // Handle specific renames/merges
        if (upper.includes('SECURITY') || upper.includes('ACCOUNT MANAGEMENT')) rawName = '👤 ACCOUNT MANAGEMENT';
        else if (upper.includes('WITHDRAWAL')) rawName = '💸 WITHDRAWALS & TRANSACTIONS';
        else if (upper.includes('DEPOSIT')) rawName = '💰 DEPOSITS — M-PESA';
        else if (upper.includes('SPORTS BETTING') || upper.includes('DISPUTE')) rawName = '⚽ SPORTS BETTING';
        else if (upper.includes('GAMES') || upper.includes('CASINO')) rawName = '🎰 CASINO GAMES';
        else if (upper.includes('HARD CASES')) rawName = '⚖️ HARD CASES';
        else if (upper.includes('RESPONSIBLE') || upper.includes('THREATENING')) rawName = '🛡️ RESPONSIBLE GAMING';
        else if (upper.includes('SYSTEM') || upper.includes('UPGRADE') || upper.includes('MAINTENANCE')) rawName = '⚙️ SYSTEM MAINTENANCE';

        const normalizedKey = rawName.replace(/\p{Emoji}/gu, '').trim().toUpperCase();
        
        if (!consolidatedMap[normalizedKey]) {
          consolidatedMap[normalizedKey] = { 
            category: rawName,
            templates: [] 
          };
        }
        
        // If the new record has an emoji and the existing one doesn't, upgrade the display name
        const hasEmoji = /\p{Emoji}/u.test(rawName);
        if (hasEmoji && !/\p{Emoji}/u.test(consolidatedMap[normalizedKey].category)) {
          consolidatedMap[normalizedKey].category = rawName;
        }
        
        // Merge templates from this record into the map
        record.templates.forEach(tpl => {
          const exists = consolidatedMap[normalizedKey].templates.some(t => t.title.toLowerCase() === tpl.title.toLowerCase());
          if (!exists) {
            consolidatedMap[normalizedKey].templates.push(tpl);
          }
        });
      });
      
      const cleanList = Object.values(consolidatedMap);
      await actions.setAllData('supportTemplates', cleanList);
      
      showToast(`Cleaned and consolidated into ${cleanList.length} unique categories!`, 'success');
      actions.refreshAll();
    } catch (err) {
      console.error(err);
      showToast('Cleanup failed. Please try again.', 'error');
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
        category: '⚽ SPORTS BETTING',
        templates: [{
          title: 'Sports Betting Inquiries',
          responses: [
            { type: 'Standard', text: "We’re currently optimizing our sports betting markets to provide the best possible odds. If you're experiencing issues with a specific match, please share the Match ID." }
          ],
          triggers: ['sports', 'betting', 'odds', 'dispute', 'match']
        }]
      },
      {
        category: '⚙️ SYSTEM MAINTENANCE',
        templates: [{
          title: 'System Upgrade (Live Betting)',
          responses: [
            { type: 'Standard', text: "We’re currently upgrading our live betting feature to serve you better. We apologize for the inconvenience and will let you know as soon as it’s up and running again." },
            { type: 'High Empathy', text: "We're currently giving our live betting feature a quick upgrade to make it even better for you! It'll be back online very soon. We apologize for the wait and thanks for hanging in there with us!" }
          ],
          triggers: ['upgrade', 'live betting', 'maintenance', 'upgrading', 'down', 'live']
        }]
      },
      {
        category: '👤 ACCOUNT MANAGEMENT',
        templates: [{
          title: 'Account Deletion (72hr Process)',
          responses: [
            { 
              type: 'Standard', 
              text: "Your account deletion request has been successfully received and is currently in our technical queue. We are processing requests in the order they arrive, and yours is now being handled. Please allow up to 72 hours for our team to manually finalize the block on all reactivation features, including OTPs. To ensure there are no delays in your request, please avoid all account activity (deposits or OTP requests) during this processing window." 
            },
            { 
              type: 'High Empathy', 
              text: "We've received your request to close your account and want to assure you that our technical team is currently processing it in our queue. For your security, this involves a manual 72-hour process to ensure all reactivation services like OTPs are safely blocked. We completely understand the wait, and to keep your processing on track, we kindly ask that you refrain from any account activity, such as depositing or requesting OTPs, until the 72 hours have passed. Thank you for your patience." 
            },
            { 
              type: 'Security Alert', 
              text: "CONFIRMED: Your deletion ticket is now under processing by our technical team. Because we manually block OTP reactivation for your safety, this takes up to 72 hours. IMPORTANT: To prevent your request from being automatically reset by our system, you MUST avoid any and all activity on the account during this time. Please do not request OTPs or attempt deposits until you receive our final confirmation." 
            }
          ],
          triggers: ['delete', 'close', 'deletion', 'deactivating', 'stop betting', 'block my account']
        }]
      },
      {
        category: '🛡️ RESPONSIBLE GAMING',
        templates: [{
          title: 'Compliance & Safety Protocol',
          responses: [
            { type: 'Standard', text: "We take your safety and security seriously. If you're feeling distressed or wish to discuss self-exclusion, we're here to support you with the necessary tools and resources." }
          ],
          triggers: ['distress', 'help', 'suicide', 'threatening', 'threat', 'audit', 'compliance']
        }]
      },
      {
        category: '⚖️ HARD CASES',
        templates: [{
          title: 'Refund Review Policy',
          responses: [
            { type: 'Standard', text: "Refund requests are subject to strict compliance review. Please provide all relevant documentation and your registered phone number for our audit team to evaluate your case." }
          ],
          triggers: ['refund', 'refusal', 'demand', 'hard case', 'legal']
        }]
      }
    ];

    setAiLoading(true);
    let count = 0;
    
    // Perform consolidation first to ensure we have a clean base
    const currentData = data || [];
    const consolidatedMap = {};
    currentData.forEach(r => {
      if (!consolidatedMap[r.category]) consolidatedMap[r.category] = { category: r.category, templates: [...r.templates] };
      else {
        r.templates.forEach(t => {
          if (!consolidatedMap[r.category].templates.some(et => et.title === t.title)) {
            consolidatedMap[r.category].templates.push(t);
          }
        });
      }
    });

    for (const item of pack) {
      if (consolidatedMap[item.category]) {
        // Merge pack items into existing
        item.templates.forEach(newTpl => {
          const idx = consolidatedMap[item.category].templates.findIndex(t => t.title.toLowerCase() === newTpl.title.toLowerCase());
          if (idx !== -1) consolidatedMap[item.category].templates[idx] = newTpl;
          else consolidatedMap[item.category].templates.push(newTpl);
        });
      } else {
        consolidatedMap[item.category] = item;
      }
      count++;
    }
    
    const cleanList = Object.values(consolidatedMap);
    await actions.setAllData('supportTemplates', cleanList);
    
    setAiLoading(false);
    showToast(`Synchronized & Cleaned ${cleanList.length} categories!`, 'success');
    actions.refreshAll();
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
              background: S.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.1)'
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
              onClick={handleConsolidate}
              disabled={aiLoading}
              style={{
                background: 'transparent', color: S.textMuted, border: `1px solid ${S.border}`,
                borderRadius: 12, padding: '10px 20px', fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                textTransform: 'uppercase', transition: 'all 0.2s'
              }}
            >
              <Trash2 size={14} /> Cleanup Library
            </button>
             <button 
              onClick={handleDeploySystemPack}
              disabled={aiLoading}
              style={{
                background: 'transparent', color: S.orangeText, border: `1px solid ${S.orange}40`,
                borderRadius: 12, padding: '10px 20px', fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                textTransform: 'uppercase', transition: 'all 0.2s'
              }}
            >
              <Terminal size={14} /> Deploy Failure Pack
            </button>
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

        {/* PREMIUM UNIFIED COMMAND CENTER */}
        <div className="tour-template-ai" style={{ marginBottom: 60 }}>
          <div style={{ position: 'relative', zIndex: 10 }}>
            {/* Intelligence Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ 
                  padding: '4px 10px', borderRadius: 8, background: `${S.orange}20`, 
                  border: `1px solid ${S.orange}40`, color: S.orangeText, 
                  fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em',
                  display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <Sparkles size={10} /> Support Intelligence v2.0
                </div>
                {aiLoading && (
                  <motion.span 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ fontSize: 10, color: S.textMuted, fontWeight: 600, textTransform: 'uppercase' }}
                  >
                    Analyzing Request...
                  </motion.span>
                )}
              </div>
              
              {/* Subtle Disclaimer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: S.green, boxShadow: `0 0 10px ${S.green}` }} />
                <span style={{ fontSize: 10, color: S.textMuted, fontWeight: 500 }}>AI is in active training mode</span>
              </div>
            </div>

            {/* Main Command Bar */}
            <div style={{
              background: 'var(--card)',
              border: `1px solid ${aiInput.length > 20 ? S.primary : S.border}`,
              borderRadius: 20,
              padding: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '8px 12px' }}>
                <div style={{ 
                  marginTop: 8, width: 36, height: 36, borderRadius: 12, 
                  background: aiInput.length > 20 ? S.orangeGlow : 'rgba(255,255,255,0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s'
                }}>
                  <Search size={18} color={aiInput.length > 20 ? S.orange : S.textMuted} />
                </div>
                
                <textarea
                  value={aiInput}
                  onChange={e => {
                    setAiInput(e.target.value);
                    setSearchQuery(e.target.value);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey && aiInput.length > 10) {
                      e.preventDefault();
                      handleAnalyze();
                    }
                  }}
                  placeholder="Ask me to find a template or paste a client's message for deep analysis..."
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 500,
                    fontFamily: 'inherit',
                    resize: 'none',
                    minHeight: aiInput.length > 60 ? 120 : 44,
                    paddingTop: 8,
                    lineHeight: 1.5,
                    caretColor: S.orange
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignSelf: 'stretch', justifyContent: 'space-between' }}>
                  {aiInput && (
                    <button 
                      onClick={() => { setAiInput(''); setSearchQuery(''); setAiResult(null); }}
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', border: 'none', color: S.textMuted, 
                        cursor: 'pointer', padding: 8, borderRadius: 10, alignSelf: 'flex-end',
                        transition: 'all 0.2s'
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}
                  
                  <button
                    onClick={handleAnalyze}
                    disabled={aiInput.length < 10 || aiLoading}
                    style={{
                      background: aiInput.length >= 10 ? S.primary : 'rgba(255,255,255,0.03)',
                      color: aiInput.length >= 10 ? '#fff' : S.textMuted,
                      border: 'none',
                      borderRadius: 12,
                      padding: '10px 24px',
                      fontSize: 12,
                      fontWeight: 900,
                      cursor: aiInput.length >= 10 ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'all 0.3s',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      boxShadow: 'none'
                    }}
                  >
                    {aiLoading ? <RotateCcw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {aiLoading ? 'Analyzing' : 'Deep Analysis'}
                  </button>
                </div>
              </div>

              {/* Mode Indicator Footer */}
              <div style={{ 
                padding: '12px 20px', borderTop: `1px solid ${S.border}`, 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
              }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: aiInput.length > 0 ? S.orange : S.textMuted }} />
                    <span style={{ fontSize: 10, color: S.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Live Filter</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: aiInput.length >= 10 ? 1 : 0.4 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: aiInput.length >= 10 ? S.purple : S.textMuted }} />
                    <span style={{ fontSize: 10, color: S.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>AI Analysis Ready</span>
                  </div>
                </div>
                <div style={{ fontSize: 9, color: S.textMuted, fontWeight: 500, letterSpacing: '0.02em', fontStyle: 'italic' }}>
                  * Verify AI matches before deploying to live chat
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {aiResult && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
              >
                {/* Result Insights Bar */}
                <div style={{ 
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12
                }}>
                  <div style={{ 
                    padding: '16px', borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: `1px solid ${S.border}`,
                    display: 'flex', alignItems: 'center', gap: 16
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${aiResult.emotion.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {aiResult.emotion.emoji}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: S.textMuted, textTransform: 'uppercase', marginBottom: 2 }}>Detected Emotion</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: aiResult.emotion.color }}>{aiResult.emotion.label}</div>
                    </div>
                  </div>

                  <div style={{ 
                    padding: '16px', borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: `1px solid ${S.border}`,
                    display: 'flex', alignItems: 'center', gap: 16
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${S.purple}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Languages size={18} color={S.purple} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: S.textMuted, textTransform: 'uppercase', marginBottom: 2 }}>Language Context</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: S.purple }}>{aiResult.detectedLanguage.toUpperCase()} MODE</div>
                    </div>
                  </div>

                  <div style={{ 
                    padding: '16px', borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: `1px solid ${S.border}`,
                    display: 'flex', alignItems: 'center', gap: 16
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${S.orange}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={18} color={S.orange} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: S.textMuted, textTransform: 'uppercase', marginBottom: 2 }}>Recommended Tone</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: S.orangeText }}>{aiResult.suggestedTone === 'highEmpathy' ? 'High Empathy' : 'Direct / Pro'}</div>
                    </div>
                  </div>
                </div>

                {/* AI Draft Card */}
                {aiResult.aiSuggestion && (
                  <div style={{ 
                    background: `linear-gradient(165deg, ${S.card}, rgba(139, 92, 246, 0.05))`, 
                    border: `1px solid ${S.purple}30`, 
                    borderRadius: 24, padding: '2px',
                    boxShadow: `0 30px 60px -20px rgba(0,0,0,0.5)`
                  }}>
                    <div style={{ background: S.card, borderRadius: 22, padding: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: S.purple, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Sparkles size={16} color="#fff" />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Recommended Response Draft
                          </span>
                        </div>
                        <CopyBtn text={aiResult.aiSuggestion} id="ai-gen" copiedId={copiedId} onCopy={handleCopy} size="sm" />
                      </div>
                      <div style={{ 
                        background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: 20, 
                        fontSize: 16, lineHeight: 1.7, color: '#e5e7eb',
                        border: '1px solid rgba(255,255,255,0.03)',
                        fontStyle: aiResult.detectedLanguage !== 'en' ? 'italic' : 'normal'
                      }}>
                        {aiResult.aiSuggestion}
                      </div>
                    </div>
                  </div>
                )}
                
                {aiResult.matches.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '0 8px' }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: S.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Structural Matches ({aiResult.matches.length})
                      </div>
                      <div style={{ flex: 1, height: 1, background: S.border, opacity: 0.5 }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
                      {aiResult.matches.map((m, i) => (
                        <ResponseCard 
                          key={i} 
                          item={m.item} 
                          copiedId={copiedId} 
                          onCopy={handleCopy} 
                          expanded={true}
                          onToggle={() => {}}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BROWSER SECTION */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '0 8px' }}>
             <h2 style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0, color: S.textPrimary }}>
               {searchQuery ? 'Search Results' : 'Template Library'}
             </h2>
             <div style={{ flex: 1, height: 1, background: S.border }} />
          </div>

          {/* BROWSE LIST */}
          <div className="tour-template-browse grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-12">
            {filteredData.map((cat, idx) => (
              <div key={idx} style={{ 
                background: 'rgba(255,255,255,0.01)', borderRadius: 24, padding: 24, 
                border: `1px solid ${S.border}`,
                transition: 'transform 0.3s'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  {/* Safely handle emoji extraction */}
                  {cat.category.match(/\p{Emoji}/u) ? (
                    <div style={{ 
                      width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.03)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                      flexShrink: 0, border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      {cat.category.match(/\p{Emoji}/u)[0]}
                    </div>
                  ) : (
                    <div style={{ 
                      width: 44, height: 44, borderRadius: 14, background: `${S.orange}10`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, border: `1px solid ${S.orange}20`
                    }}>
                      <Zap size={20} color={S.orange} />
                    </div>
                  )}
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3 style={{ 
                        fontSize: 15, fontWeight: 900, textTransform: 'uppercase', 
                        letterSpacing: '0.05em', color: S.textPrimary, margin: 0,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {cat.category.replace(/\p{Emoji}/u, '').trim()}
                      </h3>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete entire "${cat.category}" category and all its templates?`)) {
                            actions.deleteRecord('supportTemplates', cat.id).then(() => actions.refreshAll());
                          }
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444',
                          padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: S.textMuted, textTransform: 'uppercase', marginTop: 4 }}>
                      {cat.templates.length} Optimized Responses
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {cat.templates.map((t, tIdx) => (
                    <ResponseCard 
                      key={tIdx} 
                      item={t} 
                      copiedId={copiedId} 
                      onCopy={handleCopy} 
                      expanded={expandedIds.includes(`${cat.category}-${t.title}`)}
                      onToggle={() => toggleExpand(`${cat.category}-${t.title}`)}
                    />
                  ))}
                </div>
              </div>
            ))}
            {filteredData.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '100px 0', textAlign: 'center', color: S.textMuted }}>
                <div style={{ 
                  width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.02)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
                }}>
                  <Search size={32} opacity={0.2} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: S.textSecondary }}>No intelligence matches found.</p>
                <p style={{ fontSize: 13, maxWidth: 400, margin: '8px auto 0', lineHeight: 1.6 }}>
                  We couldn't find any templates for your query. Try simplifying your search or use the AI Deep Analysis for natural language client messages.
                </p>
              </div>
            )}
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
            <FormControl fullWidth variant="outlined">
              <InputLabel style={{ color: S.textMuted }}>Category</InputLabel>
              <Select
                label="Category"
                value={isNewCategory ? "NEW" : newTemplate.category}
                onChange={e => {
                  if (e.target.value === "NEW") {
                    setIsNewCategory(true);
                    setNewTemplate({ ...newTemplate, category: "" });
                  } else {
                    setIsNewCategory(false);
                    setNewTemplate({ ...newTemplate, category: e.target.value });
                  }
                }}
                style={{ color: '#fff', background: '#000', borderRadius: 12 }}
                MenuProps={{
                  PaperProps: {
                    style: { background: S.surface, border: `1px solid ${S.border}`, color: '#fff' }
                  }
                }}
              >
                {availableCategories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
                <MenuItem value="NEW" style={{ color: S.orangeText, fontWeight: 800 }}>+ ADD NEW CATEGORY</MenuItem>
              </Select>
            </FormControl>

            {isNewCategory && (
              <TextField 
                label="New Category Name" 
                fullWidth 
                variant="outlined"
                placeholder="e.g., ⚽ SPORTS BET"
                value={newTemplate.category} 
                onChange={e => setNewTemplate({ ...newTemplate, category: e.target.value })}
                InputProps={{ style: { color: '#fff', background: '#000', borderRadius: 12 } }}
                InputLabelProps={{ style: { color: S.textMuted } }}
                autoFocus
              />
            )}
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
