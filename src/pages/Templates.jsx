import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Star, ChevronRight, ChevronDown, MessageSquare, ArrowDownToLine, ArrowUpFromLine,
  Gamepad2, Gift, RotateCcw, Copy, Check, RotateCw,
  FileText, ClipboardPaste, AlertCircle, Zap, ShieldCheck, X,
  HelpCircle, Swords, User, Key, Settings, Sparkles, Briefcase, Filter, Menu
} from 'lucide-react';

import { TEMPLATES_DATA } from '../lib/templates/templatesData';
import { SOFABETS_DATA } from '../lib/templates/sofaBetsData';
import { SAFIBETS_DATA } from '../lib/templates/safiBetsData';
import { TONES } from '../lib/templates/tones';
import { executeRephrase, executeSingleRephrase, getStoredApiKey, setStoredApiKey } from '../lib/templates/rephraseService';
import { getFavoriteTemplateIds, toggleFavoriteTemplate } from '../lib/templates/storage';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCategoryIcon(catId, isActive) {
  const cls = `w-4 h-4 shrink-0 ${isActive ? 'text-[#baff55]' : 'text-[#8e8e93]'}`;
  const icons = {
    1: MessageSquare, 2: ArrowDownToLine, 3: ArrowUpFromLine,
    4: Gamepad2, 5: Swords, 6: Gift, 7: RotateCcw,
    8: Briefcase, 9: HelpCircle, 10: User,
    11: ShieldCheck, 12: HelpCircle, 13: AlertCircle,
  };
  const Icon = icons[catId] || MessageSquare;
  return <Icon className={cls} />;
}

function formatCategoryTitle(title) {
  return title.replace(/^(\d+(\.\d+)?)\s*[-–—]\s*/, '').trim();
}

// ─── CategoryList Sidebar & Mobile Responsive Accordion ───────────────────────
function CategoryList({ categories, selectedSub, onSelectSub, searchQuery, favoriteIds, onToggleFavorite, showOnlyFavorites, isMobileOpen, setIsMobileOpen }) {
  const [expandedCatIds, setExpandedCatIds] = useState(() => [categories[0]?.id || 1]);

  useEffect(() => {
    if (selectedSub) {
      const parentCat = categories.find(cat => cat.subsections.some(sub => sub.id === selectedSub.id));
      if (parentCat) {
        setExpandedCatIds(prev => prev.includes(parentCat.id) ? prev : [...prev, parentCat.id]);
      }
    }
  }, [selectedSub, categories]);

  useEffect(() => {
    if (searchQuery.trim() || showOnlyFavorites) {
      setExpandedCatIds(categories.map(c => c.id));
    }
  }, [searchQuery, showOnlyFavorites, categories]);

  const handleCategoryClick = (catId) => {
    setExpandedCatIds(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleToggleAll = () => {
    if (expandedCatIds.length === categories.length) {
      setExpandedCatIds([]);
    } else {
      setExpandedCatIds(categories.map(c => c.id));
    }
  };

  const filteredCategories = categories.map(cat => {
    let subs = cat.subsections;
    if (showOnlyFavorites) subs = subs.filter(s => favoriteIds.includes(s.id));
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const catMatches = cat.title.toLowerCase().includes(q);
      const matchedSubs = subs.filter(sub =>
        sub.id.toLowerCase().includes(q) ||
        sub.title.toLowerCase().includes(q) ||
        sub.triggers.toLowerCase().includes(q) ||
        sub.variants.some(v => v.text.toLowerCase().includes(q))
      );
      if (catMatches) return { ...cat, subsections: subs };
      if (matchedSubs.length > 0) return { ...cat, subsections: matchedSubs };
      return null;
    }
    return subs.length > 0 ? { ...cat, subsections: subs } : null;
  }).filter(Boolean);

  const allExpanded = filteredCategories.length > 0 && filteredCategories.every(cat => expandedCatIds.includes(cat.id));

  return (
    <div className="flex flex-col h-full select-none space-y-3">
      {/* Mobile Toggle Drawer Button (< lg screens) */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-[#1B1C22] border border-white/[0.07] rounded-2xl text-xs font-semibold text-[#F4F5F1] cursor-pointer active:scale-[0.99] transition-all shadow-md"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#00D66B]" />
          <span>Category Menu ({filteredCategories.length})</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-[#8B8E97] transition-transform duration-200 ${isMobileOpen ? 'rotate-180 text-white' : ''}`} />
      </button>

      {/* Main Categories Content */}
      <div className={`space-y-3 ${isMobileOpen ? 'block' : 'hidden lg:block'}`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8B8E97] uppercase tracking-wider">
            <span>Categories</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#232429] text-[#00D66B] border border-white/5 font-semibold">
              {filteredCategories.length}
            </span>
          </div>
          <button
            onClick={handleToggleAll}
            className="text-xs text-[#8B8E97] hover:text-[#F4F5F1] transition-colors cursor-pointer"
          >
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        {/* Categories Accordion */}
        <div className="overflow-y-auto space-y-1.5 flex-1 pr-1 scrollbar-thin max-h-[60vh] lg:max-h-[calc(100vh-170px)]">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#8B8E97] px-3">
              {showOnlyFavorites ? 'No starred templates.' : `No results for "${searchQuery}"`}
            </div>
          ) : filteredCategories.map(cat => {
            const isExpanded = expandedCatIds.includes(cat.id);
            const containsSelected = selectedSub && cat.subsections.some(s => s.id === selectedSub.id);
            const cleanTitle = formatCategoryTitle(cat.title);

            return (
              <div key={cat.id} className="space-y-1">
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left transition-all cursor-pointer touch-manipulation ${
                    containsSelected || isExpanded
                      ? 'bg-[#232429] text-[#F4F5F1] border border-white/10'
                      : 'text-[#8B8E97] hover:text-[#F4F5F1] hover:bg-[#232429]/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {getCategoryIcon(cat.id, isExpanded || !!containsSelected)}
                    <span className={`truncate text-xs font-semibold ${isExpanded || containsSelected ? 'text-[#F4F5F1]' : 'text-[#8B8E97]'}`}>
                      {cleanTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full transition-colors ${isExpanded || containsSelected ? 'bg-[#0E0E12] text-[#00D66B] font-bold' : 'text-[#8B8E97]'}`}>
                      {cat.subsections.length}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 text-[#8B8E97] transition-transform duration-200 ${isExpanded ? 'rotate-90 text-white' : ''}`} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key={`sub-${cat.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="ml-5 pl-2.5 my-1 space-y-1 border-l border-white/10">
                        {cat.subsections.map(sub => {
                          const isActive = selectedSub?.id === sub.id;
                          const isFav = favoriteIds.includes(sub.id);
                          return (
                            <div
                              key={sub.id}
                              onClick={() => {
                                onSelectSub(cat, sub);
                                setIsMobileOpen(false);
                              }}
                              className={`group relative flex items-center justify-between w-full pl-3 pr-2.5 py-2.5 rounded-xl cursor-pointer text-xs transition-all touch-manipulation ${
                                isActive
                                  ? 'bg-[#232429] text-[#00D66B] font-bold border border-[#00D66B]/30 shadow-sm'
                                  : 'text-[#8B8E97] hover:text-[#F4F5F1] hover:bg-[#1B1C22]'
                              }`}
                            >
                              {isActive && <div className="absolute left-0 inset-y-2 w-1 bg-[#00D66B] rounded-r" />}
                              <div className="flex items-center gap-2 min-w-0 pr-1 pl-0.5">
                                <span className={`text-[11px] font-mono shrink-0 ${isActive ? 'text-[#00D66B]' : 'text-[#54565F]'}`}>{sub.id}</span>
                                <span className={`truncate text-xs ${isActive ? 'text-[#00D66B]' : 'text-[#8B8E97] group-hover:text-white'}`}>{sub.title}</span>
                              </div>
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); onToggleFavorite(sub.id); }}
                                className={`p-1.5 rounded transition-colors ${isFav ? 'text-amber-400 opacity-100' : 'text-[#54565F] opacity-0 group-hover:opacity-100 hover:text-white'}`}
                                title={isFav ? 'Remove from starred' : 'Star this template'}
                              >
                                <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── WorkspacePanel ───────────────────────────────────────────────────────────
function WorkspacePanel({ currentCat, currentSub, selectedVariantLabel, onSelectVariant, useCustom, onToggleCustom, customText, onCustomTextChange, currentBaseText, tones, selectedToneId, onSelectTone, isGenerating, onGenerate, errorMessage, isFavorite, onToggleFavorite, onOpenKeyModal, hasApiKey }) {
  const [copiedBase, setCopiedBase] = useState(false);

  const handleCopyBase = () => {
    if (!currentBaseText) return;
    navigator.clipboard.writeText(currentBaseText);
    setCopiedBase(true);
    setTimeout(() => setCopiedBase(false), 1800);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) { onToggleCustom(true); onCustomTextChange(text); }
    } catch { onToggleCustom(true); }
  };

  if (!currentSub || !currentCat) {
    return (
      <div className="bg-[#131520] rounded-[24px] border border-white/5 p-6 sm:p-8 flex flex-col items-center justify-center text-center h-full min-h-[350px]">
        <div className="w-12 h-12 rounded-2xl bg-[#191c2b] flex items-center justify-center mb-4">
          <FileText className="w-5 h-5 text-[#8e8e93]" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1">No template selected</h3>
        <p className="text-xs text-[#8e8e93] max-w-xs leading-relaxed">Select a template from the list to view and rewrite it.</p>
      </div>
    );
  }

  const wordCount = currentBaseText.trim() ? currentBaseText.trim().split(/\s+/).length : 0;
  const charCount = currentBaseText.length;
  const cleanCatTitle = currentCat.title.replace(/^(\d+(\.\d+)?)\s*[-–—]\s*/, '').trim();
  const triggerList = currentSub.triggers ? currentSub.triggers.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="flex flex-col space-y-4 select-none">
      {/* Title & Triggers */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#8e8e93] flex-wrap">
          <span className="font-semibold">{cleanCatTitle}</span>
          <span>/</span>
          <span className="font-mono text-[#baff55] font-bold">{currentSub.id}</span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{currentSub.title}</h2>
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className="p-2.5 rounded-2xl bg-[#131520] hover:bg-[#191c2b] border border-white/5 transition-all cursor-pointer shrink-0 touch-manipulation"
              title={isFavorite ? 'Remove from starred' : 'Star this template'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-[#8e8e93]'}`} />
            </button>
          )}
        </div>

        {triggerList.length > 0 && (
          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            <span className="text-xs font-semibold text-[#8e8e93]">Triggers:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {triggerList.map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full text-xs font-mono text-white bg-[#191c2b] border border-white/5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* API Key Missing Banner */}
      {!hasApiKey && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400 shrink-0" />
            <span>API Key is missing. Set your key to enable rewrites.</span>
          </div>
          <button onClick={onOpenKeyModal} className="px-3.5 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold transition-all shrink-0 self-start sm:self-auto">
            Set API Key
          </button>
        </div>
      )}

      {/* Base Response Card */}
      <div className="bg-[#1B1C22] rounded-[24px] border border-white/[0.07] p-4 sm:p-5 space-y-3.5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#8B8E97]" />
            <span className="text-xs font-bold text-[#F4F5F1]">Template Message</span>
          </div>

          <button
            onClick={useCustom ? () => onToggleCustom(false) : handlePasteFromClipboard}
            className="text-xs text-[#8B8E97] hover:text-[#F4F5F1] flex items-center gap-1.5 font-medium transition-colors cursor-pointer bg-[#0E0E12] px-3 py-1.5 rounded-full border border-white/[0.07] touch-manipulation"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>{useCustom ? 'Reset' : 'Edit text'}</span>
          </button>
        </div>

        {!useCustom && currentSub.variants.length > 0 && (
          <div className="flex flex-wrap gap-1.5 bg-[#0E0E12] p-1.5 rounded-2xl border border-white/[0.05]">
            {currentSub.variants.map(v => {
              const isSelected = v.label === selectedVariantLabel;
              return (
                <button
                  key={v.label}
                  onClick={() => onSelectVariant(v)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer touch-manipulation ${
                    isSelected
                      ? 'bg-[#00D66B] text-[#04170D] shadow-sm font-bold'
                      : 'text-[#8B8E97] hover:text-[#F4F5F1] hover:bg-white/5'
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        )}

        {useCustom ? (
          <textarea
            value={customText}
            onChange={e => onCustomTextChange(e.target.value)}
            placeholder="Type or paste custom message..."
            rows={4}
            className="w-full bg-[#0E0E12] border border-white/10 rounded-2xl p-3.5 sm:p-4 text-sm text-[#F4F5F1] leading-relaxed focus:outline-none focus:border-[#00D66B] resize-none min-h-[100px] placeholder-[#54565F]"
          />
        ) : (
          <div className="text-sm leading-relaxed text-[#F4F5F1] py-1 select-text">
            {currentBaseText || <span className="text-[#54565F] italic">No template text</span>}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-[#8B8E97] flex-wrap gap-2">
          <span className="font-mono text-[#54565F]">{wordCount} words · {charCount} chars</span>
          <button
            onClick={handleCopyBase}
            className="bg-[#232429] hover:bg-[#2c2e35] border border-white/10 text-[#F4F5F1] px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer touch-manipulation ml-auto"
          >
            {copiedBase ? (
              <><Check className="w-3.5 h-3.5 text-[#00D66B] stroke-[3]" /><span className="text-[#00D66B]">Copied</span></>
            ) : (
              <><Copy className="w-3.5 h-3.5 text-[#8B8E97]" /><span>Copy</span></>
            )}
          </button>
        </div>
      </div>

      {/* Tone Selection Card */}
      <div className="bg-[#1B1C22] rounded-[24px] border border-white/[0.07] p-4 sm:p-5 space-y-3 shadow-lg">
        <span className="text-xs font-bold text-[#F4F5F1] block">Tone</span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          {tones.map(t => {
            const isSelected = t.id === selectedToneId;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTone(t.id)}
                className={`p-2.5 sm:p-3 rounded-2xl text-left transition-all cursor-pointer border touch-manipulation ${
                  isSelected
                    ? 'bg-[#00D66B]/15 border-[#00D66B]'
                    : 'bg-[#0E0E12] border-white/5 hover:border-white/20 hover:bg-[#232429]'
                }`}
              >
                <div className={`text-xs font-bold ${isSelected ? 'text-[#00D66B]' : 'text-[#F4F5F1]'}`}>
                  {t.label}
                </div>
                <div className="text-[11px] text-[#8B8E97] mt-0.5 line-clamp-1">
                  {t.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-900/40 text-red-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Main Rewrite Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || !currentBaseText.trim()}
        className="w-full bg-[#00D66B] hover:brightness-105 active:scale-[0.99] text-[#04170D] font-bold text-sm py-3.5 px-5 rounded-full shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all touch-manipulation min-h-[48px]"
      >
        {isGenerating ? (
          <><div className="w-4 h-4 rounded-full border-2 border-[#04170D]/30 border-t-[#04170D] animate-spin" /><span>Generating variations...</span></>
        ) : (
          <>
            <span>Rewrite Message</span>
            <span className="hidden sm:inline text-[10px] font-mono font-bold ml-1 bg-black/15 px-2 py-0.5 rounded-full">
              ⌘ Enter
            </span>
          </>
        )}
      </button>
    </div>
  );
}

// ─── AlternativesPanel ────────────────────────────────────────────────────────
const CARDS_CONFIG = [
  { type: 'standard', title: 'Standard' },
  { type: 'lively', title: 'Friendly' },
  { type: 'short', title: 'Short' },
];

function AlternativesPanel({ outputs, loadingStates, copiedType, onCopy, onUseAsBase, onRegenerateSingle }) {
  return (
    <div className="flex flex-col space-y-4 h-full select-none">
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-semibold text-[#8B8E97] uppercase tracking-wider">Variations</span>
      </div>

      <div className="space-y-4">
        {CARDS_CONFIG.map(({ type, title }) => {
          const rawOutput = outputs[type];
          const isLoading = loadingStates[type];
          const isShortType = type === 'short';

          // For short type, normalize to array of discrete standalone items
          const shortItems = isShortType
            ? (Array.isArray(rawOutput)
                ? rawOutput.filter(Boolean)
                : (typeof rawOutput === 'string' && rawOutput.trim().length > 0 ? [rawOutput.trim()] : []))
            : [];

          const singleText = !isShortType && typeof rawOutput === 'string' ? rawOutput : '';
          const hasText = isShortType ? shortItems.length > 0 : singleText.trim().length > 0;

          const combinedText = isShortType ? shortItems.join(' ') : singleText;
          const wordCount = hasText ? combinedText.trim().split(/\s+/).length : 0;
          const charCount = hasText ? combinedText.length : 0;
          const isCopiedAll = copiedType === type;

          return (
            <div key={type} className="bg-[#1B1C22] rounded-[24px] border border-white/[0.07] p-4 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#F4F5F1]">{title}</span>
                  {isShortType && hasText && (
                    <span className="text-[10px] font-mono font-bold text-[#00D66B] bg-[#00D66B]/10 border border-[#00D66B]/20 px-2 py-0.5 rounded-full">
                      {shortItems.length} {shortItems.length === 1 ? 'idea' : 'ideas'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {hasText && (
                    <button
                      onClick={() => onRegenerateSingle(type)}
                      disabled={isLoading}
                      title={`Regenerate ${title}`}
                      className="p-2 text-[#8B8E97] hover:text-[#F4F5F1] hover:bg-[#232429] rounded-full transition-colors cursor-pointer touch-manipulation"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#00D66B]' : ''}`} />
                    </button>
                  )}
                  <button
                    onClick={() => hasText && onCopy(type, combinedText)}
                    disabled={!hasText || isLoading}
                    title={isShortType ? 'Copy all standalone ideas' : 'Copy'}
                    className="p-2 rounded-full text-[#8B8E97] hover:text-[#F4F5F1] hover:bg-[#232429] transition-colors cursor-pointer disabled:opacity-30 touch-manipulation"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main Content Body */}
              <div className="min-h-[48px]">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-xs text-[#8B8E97] py-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-[#00D66B]/30 border-t-[#00D66B] animate-spin inline-block" />
                    <span>Generating {title.toLowerCase()} variation...</span>
                  </div>
                ) : hasText ? (
                  isShortType ? (
                    <div className="space-y-2 select-text">
                      {shortItems.map((snippet, idx) => {
                        const itemKey = `short-${idx}`;
                        const isItemCopied = copiedType === itemKey;
                        return (
                          <div
                            key={idx}
                            className="flex items-start justify-between gap-3 bg-[#0E0E12] border border-white/[0.05] hover:border-white/15 transition-colors rounded-xl p-3 sm:p-3.5 group/item"
                          >
                            <div className="min-w-0 flex-1 pr-1">
                              <p className="text-xs sm:text-[13px] leading-relaxed text-[#F4F5F1]">
                                {snippet}
                              </p>
                            </div>
                            <button
                              onClick={() => onCopy(itemKey, snippet)}
                              disabled={isLoading}
                              title="Copy this sentence"
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 touch-manipulation active:scale-95 ${
                                isItemCopied
                                  ? 'bg-[#00D66B] text-[#04170D] font-bold shadow-sm'
                                  : 'bg-[#232429] hover:bg-[#2c2e35] hover:text-white border border-white/10 text-[#8B8E97]'
                              }`}
                            >
                              {isItemCopied ? (
                                <><Check className="w-3 h-3 text-[#04170D] stroke-[3]" /><span>Copied</span></>
                              ) : (
                                <><Copy className="w-3 h-3" /><span>Copy</span></>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed text-[#F4F5F1] select-text">
                      {singleText}
                    </div>
                  )
                ) : (
                  <span className="text-[#54565F] text-xs italic">Click Rewrite Message to generate variations.</span>
                )}
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs flex-wrap gap-2">
                <span className="font-mono text-[#54565F]">{hasText ? `${wordCount} words · ${charCount} chars` : '—'}</span>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => hasText && onCopy(type, combinedText)}
                    disabled={!hasText || isLoading}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer touch-manipulation ${
                      isCopiedAll
                        ? 'bg-[#00D66B] text-[#04170D] font-bold'
                        : 'bg-[#232429] hover:bg-[#2c2e35] border border-white/5 text-[#F4F5F1]'
                    }`}
                  >
                    {isCopiedAll ? (
                      <><Check className="w-3 h-3 text-[#04170D] inline mr-1 stroke-[3]" /><span>{isShortType ? 'Copied All' : 'Copied'}</span></>
                    ) : (
                      <span>{isShortType ? 'Copy All' : 'Copy'}</span>
                    )}
                  </button>
                  <button
                    onClick={() => hasText && onUseAsBase(combinedText)}
                    disabled={!hasText || isLoading}
                    className="text-xs text-[#8B8E97] hover:text-[#F4F5F1] px-2 py-1 font-medium transition-colors cursor-pointer disabled:opacity-30 touch-manipulation"
                  >
                    Use as base
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Toast Notification ───────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const colorMap = {
    success: 'bg-[#00D66B]/15 border-[#00D66B]/40 text-[#00D66B]',
    error: 'bg-red-500/15 border-red-500/40 text-red-300',
    info: 'bg-blue-500/15 border-blue-500/40 text-blue-300',
  };
  return (
    <AnimatePresence>
      <motion.div
        key={toast.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full border text-xs font-bold backdrop-blur-md shadow-2xl ${colorMap[toast.type || 'success']}`}
      >
        {toast.message}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── ApiKeyModal ──────────────────────────────────────────────────────────────
function ApiKeyModal({ isOpen, onClose, currentKey, onSaveKey }) {
  const [keyInput, setKeyInput] = useState(currentKey || '');

  useEffect(() => {
    setKeyInput(currentKey || '');
  }, [currentKey, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#131520] border border-white/10 rounded-[28px] p-5 sm:p-6 w-full max-w-md space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[#baff55]" />
            <h3 className="text-base font-bold text-white">API Key Settings</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-[#8e8e93] hover:text-white hover:bg-[#191c2b] touch-manipulation">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#8e8e93] leading-relaxed">
          Configure your Gemini API key below or via environment settings.
        </p>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white block">Gemini API Key</label>
          <input
            type="password"
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            placeholder="AQ.Ab8RN..."
            className="w-full bg-[#191c2b] border border-white/5 rounded-2xl px-4 py-3 text-xs text-white placeholder-[#8e8e93] focus:outline-none focus:border-[#baff55] font-mono"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#8e8e93] hover:text-white hover:bg-[#191c2b] transition-colors touch-manipulation">
            Cancel
          </button>
          <button
            onClick={() => {
              onSaveKey(keyInput);
              onClose();
            }}
            className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#baff55] hover:bg-[#a8f044] text-black transition-colors touch-manipulation"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN TEMPLATES PAGE ──────────────────────────────────────────────────────
const BRANCH_CONFIG = {
  betfalme: {
    id: 'betfalme',
    label: 'BetFalme',
    tagline: 'Response Library · BetFalme Direct',
    data: TEMPLATES_DATA,
    accent: '#00D66B',
    accentClass: 'text-[#00D66B]',
    accentBgClass: 'bg-[#00D66B]',
    accentBorderClass: 'border-[#00D66B]',
    pillActive: 'bg-[#00D66B] text-[#04170D] font-bold shadow-sm',
    greeting: {
      standard: 'Greetings from the Betfalme support desk, how can I assist you today? Please provide details regarding your inquiry so I can look into this for you immediately.',
      lively: 'Hi there! Welcome to Betfalme support. I am ready to assist you right away, so please share the details of your request below so we can get started.',
      short: ['Welcome to Betfalme support.', 'Please let us know how we can assist you today so we can begin working on your request.']
    }
  },
  sofabets: {
    id: 'sofabets',
    label: 'SofaBets',
    tagline: 'Response Library · SofaSafi / SofaBets',
    data: SOFABETS_DATA,
    accent: '#A855F7',
    accentClass: 'text-[#A855F7]',
    accentBgClass: 'bg-[#A855F7]',
    accentBorderClass: 'border-[#A855F7]',
    pillActive: 'bg-[#A855F7] text-white font-bold shadow-sm',
    greeting: {
      standard: "Hello! You're through to SofaBets support. Go ahead and let us know what you need help with and we'll get on it right away.",
      lively: "Hey there! SofaBets support is live. Tell us what's going on and we'll sort it out straight away.",
      short: ["Welcome to SofaBets support.", "Tell us what you need help with and we'll sort it out immediately."]
    }
  },
  safibets: {
    id: 'safibets',
    label: 'SafiBets',
    tagline: 'Response Library · SofaSafi / SafiBets',
    data: SAFIBETS_DATA,
    accent: '#38BDF8',
    accentClass: 'text-[#38BDF8]',
    accentBgClass: 'bg-[#38BDF8]',
    accentBorderClass: 'border-[#38BDF8]',
    pillActive: 'bg-[#38BDF8] text-[#04170D] font-bold shadow-sm',
    greeting: {
      standard: "Good day! You've reached SafiBets customer support. Please go ahead and share your query and we'll assist you promptly.",
      lively: "Hello! SafiBets support is available and ready. Kindly let us know what you need assistance with today.",
      short: ["Welcome to SafiBets customer support.", "Please share your query so we can assist you promptly."]
    }
  }
};

// ─── MAIN TEMPLATES PAGE ──────────────────────────────────────────────────────
export default function Templates() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawBranch = (searchParams.get('branch') || 'betfalme').toLowerCase();
  const activeBranchKey = BRANCH_CONFIG[rawBranch] ? rawBranch : 'betfalme';
  const branchConfig = BRANCH_CONFIG[activeBranchKey];

  const [activeBranch, setActiveBranch] = useState(activeBranchKey);

  // Sync state if URL query param changes
  useEffect(() => {
    setActiveBranch(activeBranchKey);
  }, [activeBranchKey]);

  const categories = branchConfig.data;
  const [selectedCat, setSelectedCat] = useState(categories[0]);
  const [selectedSub, setSelectedSub] = useState(categories[0]?.subsections[0]);
  const [selectedVariantLabel, setSelectedVariantLabel] = useState(categories[0]?.subsections[0]?.variants[0]?.label || null);

  const [useCustom, setUseCustom] = useState(false);
  const [customText, setCustomText] = useState('');
  const [selectedToneId, setSelectedToneId] = useState('standard');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Manual Resizable Category Sidebar Width (Desktop)
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('betfalme_templates_sidebar_width');
    return saved ? parseInt(saved, 10) : 320;
  });
  const isResizingRef = useRef(false);

  const handleMouseDownResize = useCallback((e) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (event) => {
      if (!isResizingRef.current) return;
      const newWidth = Math.min(500, Math.max(220, event.clientX - 16));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      localStorage.setItem('betfalme_templates_sidebar_width', sidebarWidth.toString());
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [sidebarWidth]);

  const [outputs, setOutputs] = useState(branchConfig.greeting);

  const [loadingStates, setLoadingStates] = useState({ standard: false, lively: false, short: false });
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copiedType, setCopiedType] = useState(null);
  const [toast, setToast] = useState(null);

  const activeRequestIdRef = useRef(0);
  const historyRef = useRef({});
  const searchInputRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => setToast(prev => prev?.id === id ? null : prev), 3000);
  }, []);

  // When switching branch
  const handleSwitchBranch = useCallback((branchKey) => {
    if (branchKey === activeBranch) return;
    setActiveBranch(branchKey);
    setSearchParams({ branch: branchKey });
    const targetConfig = BRANCH_CONFIG[branchKey] || BRANCH_CONFIG.betfalme;
    const targetCats = targetConfig.data;
    const firstCat = targetCats[0];
    const firstSub = firstCat?.subsections[0];
    const firstVariant = firstSub?.variants[0];

    setSelectedCat(firstCat);
    setSelectedSub(firstSub);
    setSelectedVariantLabel(firstVariant?.label || null);
    setUseCustom(false);
    setCustomText('');
    setOutputs(targetConfig.greeting);
    showToast(`Switched to ${targetConfig.label} templates`, 'info');

    if (firstVariant?.text) {
      generateResponses({
        baseText: firstVariant.text,
        catTitle: firstCat?.title,
        subId: firstSub?.id,
        subTitle: firstSub?.title,
        toneId: selectedToneId,
        bypassCache: true
      });
    }
  }, [activeBranch, setSearchParams, selectedToneId, showToast]);

  useEffect(() => {
    setFavoriteIds(getFavoriteTemplateIds());
    setApiKey(getStoredApiKey());

    // When component mounts or branch updates, reset to first sub of current dataset
    const currentCats = branchConfig.data;
    const initialCat = currentCats[0];
    const initialSub = initialCat?.subsections[0];
    const initialVariant = initialSub?.variants[0];

    setSelectedCat(initialCat);
    setSelectedSub(initialSub);
    setSelectedVariantLabel(initialVariant?.label || null);
    setUseCustom(false);
    setCustomText('');
    setOutputs(branchConfig.greeting);

    const initialText = initialVariant?.text;
    if (initialText) {
      generateResponses({
        baseText: initialText,
        catTitle: initialCat?.title,
        subId: initialSub?.id,
        subTitle: initialSub?.title,
        toneId: 'standard',
        bypassCache: true
      });
    }
  }, [activeBranchKey]);

  const handleSaveApiKey = useCallback((key) => {
    setStoredApiKey(key);
    setApiKey(key);
    showToast(key ? 'API Key saved' : 'API Key removed', 'info');
  }, [showToast]);

  const generateResponses = useCallback(async ({ baseText, catTitle, subId, subTitle, toneId, bypassCache }) => {
    if (!baseText.trim()) return;
    const currentRequestId = ++activeRequestIdRef.current;
    setIsGeneratingAll(true);
    setLoadingStates({ standard: true, lively: true, short: true });
    setErrorMessage(null);

    const subKey = subId || 'custom';
    const subHistory = historyRef.current[subKey] || { standard: [], lively: [], short: [] };

    try {
      const result = await executeRephrase({
        baseText,
        toneId,
        categoryTitle: catTitle,
        subsectionTitle: subTitle,
        avoidHistory: [
          ...(subHistory.standard.slice(-2)),
          ...(subHistory.lively.slice(-2)),
          ...(Array.isArray(subHistory.short) ? subHistory.short.flat().slice(-2) : [])
        ],
        bypassCache
      });
      if (activeRequestIdRef.current !== currentRequestId) return;
      const newOutputs = {
        standard: result.standard || '',
        lively: result.lively || '',
        short: Array.isArray(result.short) ? result.short : (result.short ? [result.short] : [])
      };
      setOutputs(newOutputs);
      historyRef.current[subKey] = {
        standard: [...(subHistory.standard || []), newOutputs.standard].filter(Boolean),
        lively: [...(subHistory.lively || []), newOutputs.lively].filter(Boolean),
        short: [...(subHistory.short || []), newOutputs.short].filter(Boolean),
      };
    } catch (err) {
      if (activeRequestIdRef.current === currentRequestId) {
        setErrorMessage(err.message || 'Generation failed.');
        showToast(err.message || 'Failed to generate variation', 'error');
      }
    } finally {
      if (activeRequestIdRef.current === currentRequestId) {
        setIsGeneratingAll(false);
        setLoadingStates({ standard: false, lively: false, short: false });
      }
    }
  }, [showToast]);

  const currentBaseText = useCustom
    ? customText
    : (selectedSub?.variants.find(v => v.label === selectedVariantLabel)?.text || selectedSub?.variants[0]?.text || '');

  const handleSelectSub = useCallback((cat, sub) => {
    setSelectedCat(cat);
    setSelectedSub(sub);
    setUseCustom(false);
    const firstVariant = sub.variants[0];
    setSelectedVariantLabel(firstVariant?.label || null);
    setErrorMessage(null);
    const baseText = firstVariant?.text || '';
    if (baseText) {
      generateResponses({ baseText, catTitle: cat.title, subId: sub.id, subTitle: sub.title, toneId: selectedToneId, bypassCache: true });
    }
  }, [selectedToneId, generateResponses]);

  const handleSelectVariant = useCallback((variant) => {
    setUseCustom(false);
    setSelectedVariantLabel(variant.label);
    setErrorMessage(null);
    if (variant.text) {
      generateResponses({ baseText: variant.text, catTitle: selectedCat?.title, subId: selectedSub?.id, subTitle: selectedSub?.title, toneId: selectedToneId, bypassCache: true });
    }
  }, [selectedCat, selectedSub, selectedToneId, generateResponses]);

  const handleSelectTone = useCallback((toneId) => {
    setSelectedToneId(toneId);
    if (currentBaseText.trim()) {
      generateResponses({ baseText: currentBaseText, catTitle: selectedCat?.title, subId: selectedSub?.id, subTitle: selectedSub?.title, toneId, bypassCache: true });
    }
  }, [currentBaseText, selectedCat, selectedSub, generateResponses]);

  const handleToggleCustom = useCallback((customState) => {
    setUseCustom(customState);
    if (customState && !customText && selectedSub) {
      const activeVariantText = selectedSub.variants.find(v => v.label === selectedVariantLabel)?.text || selectedSub.variants[0]?.text || '';
      setCustomText(activeVariantText);
    }
  }, [customText, selectedSub, selectedVariantLabel]);

  const handleGenerateAll = useCallback((bypassCache = true) => {
    if (!currentBaseText.trim()) {
      showToast('Please enter text to generate variations', 'error');
      return;
    }
    generateResponses({
      baseText: currentBaseText,
      catTitle: selectedCat?.title,
      subId: selectedSub?.id,
      subTitle: selectedSub?.title,
      toneId: selectedToneId,
      bypassCache
    });
  }, [currentBaseText, selectedCat, selectedSub, selectedToneId, generateResponses, showToast]);

  const handleRegenerateSingle = useCallback(async (type) => {
    const textToUse = currentBaseText;
    if (!textToUse.trim()) return;
    setLoadingStates(prev => ({ ...prev, [type]: true }));
    const subKey = selectedSub?.id || 'custom';
    const subHistory = historyRef.current[subKey] || { standard: [], lively: [], short: [] };
    const avoid = (Array.isArray(subHistory[type]) ? subHistory[type].flat() : []).slice(-3);
    try {
      const newResult = await executeSingleRephrase(type, { baseText: textToUse, toneId: selectedToneId, categoryTitle: selectedCat?.title, subsectionTitle: selectedSub?.title, avoidHistory: avoid });
      const formatted = type === 'short' ? (Array.isArray(newResult) ? newResult : [newResult]) : newResult;
      setOutputs(prev => ({ ...prev, [type]: formatted }));
      historyRef.current[subKey] = { ...subHistory, [type]: [...(subHistory[type] || []), formatted].filter(Boolean) };
      showToast(`Regenerated ${type} variation`);
    } catch (err) {
      showToast(err.message || 'Failed to generate', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, [type]: false }));
    }
  }, [currentBaseText, selectedToneId, selectedCat, selectedSub, showToast]);

  const handleCopy = useCallback((type, text) => {
    if (!text) return;
    const contentToCopy = Array.isArray(text) ? text.join('\n') : text;
    navigator.clipboard.writeText(contentToCopy).then(() => {
      setCopiedType(type);
      showToast('Copied to clipboard');
      setTimeout(() => setCopiedType(prev => prev === type ? null : prev), 1800);
    }, () => showToast('Failed to copy', 'error'));
  }, [showToast]);

  const handleUseAsBase = useCallback((content) => {
    const text = Array.isArray(content) ? content.join('\n') : (typeof content === 'string' ? content : '');
    setUseCustom(true);
    setCustomText(text);
    setSelectedVariantLabel(null);
    showToast('Loaded into workspace', 'info');
  }, [showToast]);

  const handleToggleFavorite = useCallback((subId) => {
    const updated = toggleFavoriteTemplate(subId, favoriteIds);
    setFavoriteIds(updated);
    const isNowFav = updated.includes(subId);
    showToast(isNowFav ? 'Saved to starred' : 'Removed from starred', 'info');
  }, [favoriteIds, showToast]);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleGenerateAll(true); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); searchInputRef.current?.focus(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerateAll]);

  const totalSubsections = categories.reduce((acc, cat) => acc + cat.subsections.length, 0);

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F4F5F1] flex flex-col selection:bg-[#00D66B]/30 selection:text-[#00D66B] font-sans">
      {/* ── Top Header Bar ── */}
      <header className="sticky top-0 z-30 bg-[#0A0A0D]/95 backdrop-blur-xl border-b border-white/[0.07] px-4 sm:px-6 md:px-8 py-3.5 select-none">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4">
          {/* Left branding & Branch Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-3">
              <div 
                style={{ backgroundColor: branchConfig.accent }}
                className="w-9 h-9 rounded-2xl text-[#04170D] font-bold flex items-center justify-center shrink-0 shadow-sm transition-colors"
              >
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-['Space_Grotesk'] text-base font-semibold tracking-tight text-[#F4F5F1] leading-none">
                    {branchConfig.label} Templates
                  </h1>
                </div>
                <span className="text-xs text-[#8B8E97] block mt-1">
                  {branchConfig.tagline}
                </span>
              </div>
            </div>

            {/* Branch Selector Switcher */}
            <div className="flex items-center bg-[#0E0E12] border border-white/[0.07] p-1 rounded-full sm:ml-2">
              <button
                type="button"
                onClick={() => handleSwitchBranch('betfalme')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer touch-manipulation ${
                  activeBranch === 'betfalme'
                    ? 'bg-[#00D66B] text-[#04170D] shadow-sm'
                    : 'text-[#8B8E97] hover:text-white'
                }`}
              >
                BetFalme
              </button>
              <button
                type="button"
                onClick={() => handleSwitchBranch('sofabets')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer touch-manipulation ${
                  activeBranch === 'sofabets'
                    ? 'bg-[#A855F7] text-white shadow-sm'
                    : 'text-[#8B8E97] hover:text-white'
                }`}
              >
                SofaBets
              </button>
              <button
                type="button"
                onClick={() => handleSwitchBranch('safibets')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer touch-manipulation ${
                  activeBranch === 'safibets'
                    ? 'bg-[#38BDF8] text-[#04170D] shadow-sm'
                    : 'text-[#8B8E97] hover:text-white'
                }`}
              >
                SafiBets
              </button>
            </div>

            {/* Mobile Actions Right */}
            <div className="flex md:hidden items-center gap-2 ml-auto sm:ml-0">
              <button
                onClick={() => setShowOnlyFavorites(prev => !prev)}
                className={`p-2 text-xs rounded-full flex items-center gap-1 border ${
                  showOnlyFavorites ? 'bg-amber-400/20 text-amber-400 border-amber-400/30' : 'bg-[#1B1C22] border-white/5 text-[#8B8E97]'
                }`}
              >
                <Star className={`w-4 h-4 ${showOnlyFavorites ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => setIsKeyModalOpen(true)}
                className="w-8 h-8 rounded-full bg-[#1B1C22] border border-white/5 text-[#8B8E97] flex items-center justify-center"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Search Input */}
          <div className="relative w-full md:w-80 lg:w-[460px]">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#54565F]" />
            <input
              ref={searchInputRef}
              id="templates-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search templates, triggers, or codes (e.g. 2.1)..."
              className="w-full bg-[#1B1C22] hover:bg-[#232429] focus:bg-[#232429] border border-white/[0.07] focus:border-[#00D66B] rounded-full pl-11 pr-12 py-2.5 sm:py-3 text-xs text-[#F4F5F1] placeholder-[#54565F] focus:outline-none transition-all font-mono"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="text-[10px] text-[#8B8E97] hover:text-white px-2 py-0.5 rounded-full bg-[#0E0E12]"><X className="w-3 h-3" /></button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono font-bold text-[#54565F] bg-[#0E0E12] border border-white/5 px-2 py-0.5 rounded-full">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setShowOnlyFavorites(prev => !prev)}
              className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full transition-all cursor-pointer border ${
                showOnlyFavorites ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' : 'bg-[#1B1C22] border-white/[0.07] text-[#8B8E97] hover:text-white hover:bg-[#232429]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-current text-amber-400' : 'text-[#8B8E97]'}`} />
              <span>Starred</span>
              {favoriteIds.length > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 font-bold">
                  {favoriteIds.length}
                </span>
              )}
            </button>

            <div className="text-xs text-[#54565F] flex items-center gap-1.5 font-mono">
              <span className="text-[#F4F5F1] font-bold">{categories.length}</span>
              <span>categories</span>
              <span>·</span>
              <span className="text-[#F4F5F1] font-bold">{totalSubsections}</span>
              <span>templates</span>
            </div>

            <button
              onClick={() => setIsKeyModalOpen(true)}
              className="w-9 h-9 rounded-full bg-[#1B1C22] border border-white/[0.07] hover:border-white/20 text-[#8B8E97] hover:text-white flex items-center justify-center cursor-pointer transition-all"
              title="API Key Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Resizable Layout ── */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col lg:flex-row gap-5 md:gap-6 items-start">
        
        {/* Column 1: Category Sidebar (Manual Resizable on Desktop) */}
        <section 
          style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${sidebarWidth}px` : '100%' }}
          className="shrink-0 lg:sticky lg:top-[84px] relative"
        >
          <CategoryList
            categories={categories}
            selectedSub={selectedSub}
            onSelectSub={handleSelectSub}
            searchQuery={searchQuery}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            showOnlyFavorites={showOnlyFavorites}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />
        </section>

        {/* Resizer Drag Handle (Desktop only) */}
        <div
          onMouseDown={handleMouseDownResize}
          className="hidden lg:flex flex-col justify-center items-center w-2 -mx-3 self-stretch cursor-col-resize z-20 group hover:w-3 transition-all select-none"
          title="Drag to resize Category column"
        >
          <div className="w-[3px] h-12 rounded-full bg-white/10 group-hover:bg-[#00D66B] transition-colors" />
        </div>

        {/* Column 2 & 3: Template Workspace & AI Variations Rail (Flex-1) */}
        <div className="flex-1 min-w-0 w-full grid grid-cols-1 xl:grid-cols-12 gap-5 md:gap-6">
          {/* Workspace (7 cols) */}
          <section className="xl:col-span-7">
            <WorkspacePanel
              currentCat={selectedCat}
              currentSub={selectedSub}
              selectedVariantLabel={selectedVariantLabel}
              onSelectVariant={handleSelectVariant}
              useCustom={useCustom}
              onToggleCustom={handleToggleCustom}
              customText={customText}
              onCustomTextChange={setCustomText}
              currentBaseText={currentBaseText}
              tones={TONES}
              selectedToneId={selectedToneId}
              onSelectTone={handleSelectTone}
              isGenerating={isGeneratingAll}
              onGenerate={() => handleGenerateAll(true)}
              errorMessage={errorMessage}
              isFavorite={selectedSub ? favoriteIds.includes(selectedSub.id) : false}
              onToggleFavorite={selectedSub ? () => handleToggleFavorite(selectedSub.id) : undefined}
              onOpenKeyModal={() => setIsKeyModalOpen(true)}
              hasApiKey={!!apiKey}
            />
          </section>

          {/* AI Variations Rail (5 cols) */}
          <section className="xl:col-span-5">
            <AlternativesPanel
              outputs={outputs}
              loadingStates={loadingStates}
              copiedType={copiedType}
              onCopy={handleCopy}
              onUseAsBase={handleUseAsBase}
              onRegenerateSingle={handleRegenerateSingle}
            />
          </section>
        </div>
      </main>

      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        currentKey={apiKey}
        onSaveKey={handleSaveApiKey}
      />

      <Toast toast={toast} />
    </div>
  );
}
