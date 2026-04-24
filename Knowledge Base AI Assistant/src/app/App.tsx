import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Flame, Search, Sparkles, BookOpen, Copy, Check,
  ChevronDown, ChevronRight, X, Zap, Languages, AlertTriangle,
  Heart, Clock, MessageSquare, RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from './components/Toaster';
import { responsesData, ResponseItem, CATEGORIES, CATEGORY_ICONS } from './data/responses';
import { analyzeClientMessage, AnalysisResult, MatchResult } from './utils/aiMatcher';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
type AppMode = 'ai' | 'browse';
type Tone = 'standard' | 'highEmpathy';

const S = {
  bg: '#0a0a10',
  surface: '#111118',
  card: '#16161f',
  cardHover: '#1c1c28',
  border: '#1e1e2c',
  borderHover: '#2e2e42',
  orange: '#f97316',
  orangeDim: '#ea580c',
  orangeGlow: 'rgba(249,115,22,0.15)',
  orangeText: '#fb923c',
  textPrimary: '#e8eaf0',
  textSecondary: '#8b93a7',
  textMuted: '#4b5363',
  green: '#22c55e',
  red: '#ef4444',
  purple: '#8b5cf6',
  yellow: '#eab308',
};

// ─────────────────────────────────────────────────────────────────────────────
// COPY HOOK
// ─────────────────────────────────────────────────────────────────────────────
function useCopy() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Copied to clipboard', { duration: 1500 });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, []);
  return { copiedId, copy };
}

// ─────────────────────────────────────────────────────────────────────────────
// COPY BUTTON
// ─────────────────────────────────────────────────────────────────────────────
function CopyBtn({ text, id, copiedId, copy, size = 'md' }: {
  text: string; id: string; copiedId: string | null;
  copy: (t: string, id: string) => void; size?: 'sm' | 'md';
}) {
  const isCopied = copiedId === id;
  const pad = size === 'sm' ? '6px 10px' : '8px 14px';
  return (
    <button
      onClick={() => copy(text, id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: pad, borderRadius: 8,
        background: isCopied ? S.green : S.orange,
        color: '#fff', border: 'none', cursor: 'pointer',
        fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      {isCopied ? <Check size={13} /> : <Copy size={13} />}
      {isCopied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE CARD (used in Browse mode)
// ─────────────────────────────────────────────────────────────────────────────
function ResponseCard({ item, copiedId, copy, defaultTone = 'standard', highlight = '' }: {
  item: ResponseItem;
  copiedId: string | null;
  copy: (t: string, id: string) => void;
  defaultTone?: Tone;
  highlight?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [tone, setTone] = useState<Tone>(item.highEmpathy ? defaultTone : 'standard');
  const [altIdx, setAltIdx] = useState(0);

  const variant = tone === 'highEmpathy' && item.highEmpathy ? item.highEmpathy : item.standard;
  const allVersions = [variant.main, ...(variant.alts || [])];
  const activeText = allVersions[altIdx] ?? variant.main;

  // Reset alt idx when tone changes
  const handleTone = (t: Tone) => { setTone(t); setAltIdx(0); };

  function highlightText(text: string, query: string) {
    if (!query.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} style={{ background: S.orangeGlow, color: S.orangeText, borderRadius: 2, padding: '0 2px' }}>{part}</mark>
          ) : part
        )}
      </>
    );
  }

  const copyId = `${item.id}-${tone}-${altIdx}`;

  return (
    <div style={{
      border: `1px solid ${expanded ? S.borderHover : S.border}`,
      borderRadius: 10, overflow: 'hidden',
      transition: 'border-color 0.2s',
      background: expanded ? S.cardHover : S.card,
    }}>
      {/* Header row */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          gap: 10, padding: '12px 16px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: S.textPrimary, textAlign: 'left',
        }}
      >
        <span style={{ color: expanded ? S.orangeText : S.textMuted, flexShrink: 0, transition: 'color 0.2s' }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: S.textPrimary }}>
          {highlight ? highlightText(item.title, highlight) : item.title}
        </span>
        {item.highEmpathy && (
          <span style={{ fontSize: 10, color: S.textMuted, background: S.surface, padding: '2px 7px', borderRadius: 20, border: `1px solid ${S.border}` }}>
            2 tones
          </span>
        )}
        {(variant.alts?.length ?? 0) > 0 && (
          <span style={{ fontSize: 10, color: S.textMuted, background: S.surface, padding: '2px 7px', borderRadius: 20, border: `1px solid ${S.border}` }}>
            {variant.alts!.length + 1} alts
          </span>
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '0 16px 16px' }}>
          {/* Tone toggle */}
          {item.highEmpathy && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {(['standard', 'highEmpathy'] as Tone[]).map(t => (
                <button
                  key={t}
                  onClick={() => handleTone(t)}
                  style={{
                    padding: '5px 12px', borderRadius: 20, border: `1px solid ${tone === t ? S.orange : S.border}`,
                    background: tone === t ? S.orangeGlow : 'transparent',
                    color: tone === t ? S.orangeText : S.textMuted,
                    fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  {t === 'highEmpathy' ? <Heart size={11} /> : <MessageSquare size={11} />}
                  {t === 'standard' ? 'Standard' : 'High Empathy'}
                </button>
              ))}
            </div>
          )}

          {/* Response text */}
          <div style={{
            background: S.surface, border: `1px solid ${S.border}`,
            borderRadius: 8, padding: '12px 14px', marginBottom: 10,
          }}>
            <p style={{ fontSize: 13, color: S.textSecondary, lineHeight: 1.65, margin: 0, whiteSpace: 'pre-line' }}>
              {highlight ? highlightText(activeText, highlight) : activeText}
            </p>
          </div>

          {/* Alternatives row */}
          {allVersions.length > 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {allVersions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setAltIdx(i)}
                  style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11,
                    border: `1px solid ${altIdx === i ? S.orange : S.border}`,
                    background: altIdx === i ? S.orangeGlow : 'transparent',
                    color: altIdx === i ? S.orangeText : S.textMuted,
                    cursor: 'pointer',
                  }}
                >
                  {i === 0 ? 'Main' : `Alt ${i}`}
                </button>
              ))}
            </div>
          )}

          {/* Copy row */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <CopyBtn text={activeText} id={copyId} copiedId={copiedId} copy={copy} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI RESULT CARD
// ─────────────────────────────────────────────────────────────────────────────
function AIResultCard({ match, index, copiedId, copy, suggestedTone }: {
  match: MatchResult; index: number;
  copiedId: string | null; copy: (t: string, id: string) => void;
  suggestedTone: Tone;
}) {
  const [tone, setTone] = useState<Tone>(match.item.highEmpathy ? suggestedTone : 'standard');
  const [altIdx, setAltIdx] = useState(0);
  const [open, setOpen] = useState(index === 0);

  const variant = tone === 'highEmpathy' && match.item.highEmpathy ? match.item.highEmpathy : match.item.standard;
  const allVersions = [variant.main, ...(variant.alts || [])];
  const activeText = allVersions[altIdx] ?? variant.main;
  const copyId = `ai-${match.item.id}-${tone}-${altIdx}`;

  const confColor = match.confidence === 'high' ? S.orange : match.confidence === 'medium' ? S.yellow : S.textMuted;
  const isTop = index === 0;

  return (
    <div style={{
      border: `1px solid ${isTop ? S.orange : S.border}`,
      borderRadius: 12,
      background: isTop ? 'rgba(249,115,22,0.04)' : S.card,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', background: 'transparent', border: 'none',
          cursor: 'pointer', color: S.textPrimary, textAlign: 'left',
        }}
      >
        {isTop && (
          <span style={{
            background: S.orange, color: '#fff', borderRadius: 6,
            padding: '2px 7px', fontSize: 10, fontWeight: 700, flexShrink: 0,
          }}>BEST MATCH</span>
        )}
        <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>
          {match.item.title}
        </span>
        <span style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 20,
          border: `1px solid ${confColor}33`, color: confColor, flexShrink: 0,
        }}>
          {CATEGORY_ICONS[match.item.category]} {match.item.categoryShort}
        </span>
        {open ? <ChevronDown size={13} color={S.textMuted} /> : <ChevronRight size={13} color={S.textMuted} />}
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px' }}>
          {/* Tone toggle */}
          {match.item.highEmpathy && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {(['standard', 'highEmpathy'] as Tone[]).map(t => (
                <button key={t} onClick={() => { setTone(t); setAltIdx(0); }}
                  style={{
                    padding: '4px 12px', borderRadius: 20,
                    border: `1px solid ${tone === t ? S.orange : S.border}`,
                    background: tone === t ? S.orangeGlow : 'transparent',
                    color: tone === t ? S.orangeText : S.textMuted,
                    fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                  {t === 'highEmpathy' ? <Heart size={10} /> : <MessageSquare size={10} />}
                  {t === 'standard' ? 'Standard' : 'High Empathy'}
                </button>
              ))}
            </div>
          )}

          {/* Response text */}
          <div style={{ background: S.surface, borderRadius: 8, padding: '12px 14px', marginBottom: 10, border: `1px solid ${S.border}` }}>
            <p style={{ margin: 0, fontSize: 13, color: S.textSecondary, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {activeText}
            </p>
          </div>

          {/* Alts + Copy row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            {allVersions.length > 1 ? (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {allVersions.map((_, i) => (
                  <button key={i} onClick={() => setAltIdx(i)}
                    style={{
                      padding: '3px 9px', borderRadius: 20, fontSize: 11,
                      border: `1px solid ${altIdx === i ? S.orange : S.border}`,
                      background: altIdx === i ? S.orangeGlow : 'transparent',
                      color: altIdx === i ? S.orangeText : S.textMuted,
                      cursor: 'pointer',
                    }}>
                    {i === 0 ? 'Main' : `Alt ${i}`}
                  </button>
                ))}
              </div>
            ) : <span />}
            <CopyBtn text={activeText} id={copyId} copiedId={copiedId} copy={copy} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI ASSIST PANEL
// ─────────────────────────────────────────────────────────────────────────────
function AIAssistPanel({ copiedId, copy }: { copiedId: string | null; copy: (t: string, id: string) => void }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAnalyze = useCallback(() => {
    if (!input.trim()) return;
    setLoading(true);
    // Tiny artificial delay for UX feel
    setTimeout(() => {
      const r = analyzeClientMessage(input);
      setResult(r);
      setLoading(false);
    }, 400);
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleAnalyze();
  };

  const handleClear = () => { setInput(''); setResult(null); textareaRef.current?.focus(); };

  const langLabel: Record<string, string> = { en: 'English', sw: 'Swahili', mixed: 'Swahili / English' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Input area */}
      <div style={{
        border: `1px solid ${input.length > 0 ? S.borderHover : S.border}`,
        borderRadius: 12, background: S.card, overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={"Paste or type the client's message here...\n\nExamples:\n• \"Where is my withdrawal? It's been 2 hours!\"\n• \"Pesa yangu haikuja mpesa, niliweka KSh 500\"\n• \"I won but you didn't pay me — this is fraud!!!\""}
          style={{
            width: '100%', minHeight: 140, padding: '14px 16px',
            background: 'transparent', border: 'none', outline: 'none', resize: 'none',
            color: S.textPrimary, fontSize: 13, lineHeight: 1.65,
            fontFamily: 'inherit', caretColor: S.orange,
          }}
        />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', borderTop: `1px solid ${S.border}`,
        }}>
          <span style={{ fontSize: 11, color: S.textMuted }}>
            {input.length > 0 ? `${input.length} chars · ` : ''}Ctrl+Enter to analyze
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {input.length > 0 && (
              <button onClick={handleClear} style={{
                background: 'transparent', border: `1px solid ${S.border}`, borderRadius: 7,
                color: S.textMuted, cursor: 'pointer', padding: '5px 10px', fontSize: 12,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <X size={11} /> Clear
              </button>
            )}
            <button
              onClick={handleAnalyze}
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading ? S.orange : S.border,
                color: input.trim() && !loading ? '#fff' : S.textMuted,
                border: 'none', borderRadius: 8, padding: '6px 16px',
                fontSize: 12, fontWeight: 600, cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
              }}
            >
              <Zap size={12} />
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Detection bar */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
            padding: '10px 14px', borderRadius: 10,
            background: S.card, border: `1px solid ${S.border}`,
          }}>
            <span style={{ fontSize: 11, color: S.textMuted, marginRight: 4 }}>Detected:</span>

            {/* Emotion */}
            <span style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 20, fontSize: 12,
              border: `1px solid ${result.emotion.color}44`,
              background: `${result.emotion.color}18`,
              color: result.emotion.color, fontWeight: 600,
            }}>
              {result.emotion.emoji} {result.emotion.label}
              {result.emotion.level !== 'low' && (
                <span style={{ opacity: 0.7, fontSize: 10 }}>({result.emotion.level})</span>
              )}
            </span>

            {/* Language */}
            {result.detectedLanguage !== 'en' && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 20, fontSize: 12,
                border: `1px solid ${S.purple}44`, background: `${S.purple}18`,
                color: S.purple,
              }}>
                <Languages size={11} />
                {langLabel[result.detectedLanguage]}
              </span>
            )}

            {/* Topics */}
            {result.detectedTopics.map(t => (
              <span key={t} style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 11,
                border: `1px solid ${S.border}`, background: S.surface, color: S.textSecondary,
              }}>{t}</span>
            ))}

            {/* Tone suggestion */}
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              marginLeft: 'auto', fontSize: 11, color: S.textMuted,
            }}>
              Suggested tone:
              <span style={{ color: result.suggestedTone === 'highEmpathy' ? S.purple : S.orangeText, fontWeight: 600 }}>
                {result.suggestedTone === 'highEmpathy' ? '💜 High Empathy' : '📋 Standard'}
              </span>
            </span>
          </div>

          {/* AI Generated suggestion (when no template match) */}
          {result.aiSuggestion && (
            <div style={{
              borderRadius: 12, border: `1px solid ${S.purple}44`,
              background: `${S.purple}0d`, padding: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Sparkles size={14} color={S.purple} />
                <span style={{ fontSize: 12, fontWeight: 600, color: S.purple }}>AI Generated Response</span>
                {result.aiReasoning && (
                  <span style={{ fontSize: 10, color: S.textMuted, marginLeft: 4 }}>
                    — {result.aiReasoning}
                  </span>
                )}
              </div>
              <div style={{ background: S.surface, borderRadius: 8, padding: '12px 14px', marginBottom: 10, border: `1px solid ${S.border}` }}>
                <p style={{ margin: 0, fontSize: 13, color: S.textSecondary, lineHeight: 1.7 }}>
                  {result.aiSuggestion}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <CopyBtn text={result.aiSuggestion} id="ai-generated" copiedId={copiedId} copy={copy} />
              </div>
            </div>
          )}

          {/* Template matches */}
          {result.matches.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: S.textMuted }}>
                  {result.aiSuggestion ? 'Related templates:' : `${result.matches.length} template match${result.matches.length > 1 ? 'es' : ''} found:`}
                </span>
              </div>
              {result.matches.map((match, i) => (
                <AIResultCard
                  key={match.item.id}
                  match={match}
                  index={i}
                  copiedId={copiedId}
                  copy={copy}
                  suggestedTone={result.suggestedTone}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {result.matches.length === 0 && !result.aiSuggestion && (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: S.textMuted, fontSize: 13 }}>
              No matching templates found. Try a different query.
            </div>
          )}
        </div>
      )}

      {/* Empty state hint */}
      {!result && !loading && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          padding: '32px 16px', color: S.textMuted,
        }}>
          <Sparkles size={32} color={S.border} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 13, margin: '0 0 6px', color: S.textSecondary }}>Paste a client message to get an instant response suggestion</p>
            <p style={{ fontSize: 11, margin: 0, color: S.textMuted }}>Supports English, Swahili & mixed language · Detects emotion · Suggests tone</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 480 }}>
            {[
              'Where is my withdrawal???',
              'Pesa yangu haikuja mpesa',
              'I lost everything in Aviator 😢',
              'Your site is a FRAUD!!!',
              'Cashback sijapata leo',
            ].map(ex => (
              <button key={ex} onClick={() => setInput(ex)} style={{
                padding: '6px 12px', borderRadius: 20, fontSize: 11,
                border: `1px solid ${S.border}`, background: S.card,
                color: S.textSecondary, cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BROWSE PANEL
// ─────────────────────────────────────────────────────────────────────────────
function BrowsePanel({ searchQuery, copiedId, copy }: {
  searchQuery: string; copiedId: string | null; copy: (t: string, id: string) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Expand category when selected
  useEffect(() => {
    if (selectedCategory !== 'all') {
      setExpandedCategories(prev => new Set(prev).add(selectedCategory));
    }
  }, [selectedCategory]);

  // When searching, expand all matching categories
  useEffect(() => {
    if (searchQuery.trim()) {
      const matchingCats = new Set(
        responsesData
          .filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
            item.standard.main.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.highEmpathy?.main.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(item => item.category)
      );
      setExpandedCategories(matchingCats);
    }
  }, [searchQuery]);

  const grouped = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return CATEGORIES.map(cat => {
      const items = responsesData.filter(item => {
        if (selectedCategory !== 'all' && item.category !== cat) return false;
        if (item.category !== cat) return false;
        if (!q) return true;
        return (
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.keywords.some(k => k.toLowerCase().includes(q)) ||
          item.standard.main.toLowerCase().includes(q) ||
          (item.standard.alts || []).some(a => a.toLowerCase().includes(q)) ||
          item.highEmpathy?.main.toLowerCase().includes(q) ||
          (item.highEmpathy?.alts || []).some(a => a.toLowerCase().includes(q))
        );
      });
      return { category: cat, items };
    }).filter(g => g.items.length > 0);
  }, [searchQuery, selectedCategory]);

  const totalMatches = grouped.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div>
      {/* Category pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        <button
          onClick={() => setSelectedCategory('all')}
          style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500,
            border: `1px solid ${selectedCategory === 'all' ? S.orange : S.border}`,
            background: selectedCategory === 'all' ? S.orangeGlow : 'transparent',
            color: selectedCategory === 'all' ? S.orangeText : S.textMuted,
            cursor: 'pointer',
          }}
        >
          All ({responsesData.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = responsesData.filter(i => i.category === cat).length;
          const active = selectedCategory === cat;
          return (
            <button key={cat} onClick={() => setSelectedCategory(active ? 'all' : cat)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 11,
                border: `1px solid ${active ? S.orange : S.border}`,
                background: active ? S.orangeGlow : 'transparent',
                color: active ? S.orangeText : S.textMuted,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              }}>
              {CATEGORY_ICONS[cat]} {cat.split(' ')[0]} ({count})
            </button>
          );
        })}
      </div>

      {/* Results summary */}
      {searchQuery && (
        <div style={{ marginBottom: 10, fontSize: 12, color: S.textMuted }}>
          <span style={{ color: S.orangeText, fontWeight: 600 }}>{totalMatches}</span> result{totalMatches !== 1 ? 's' : ''} for "<span style={{ color: S.textSecondary }}>{searchQuery}</span>"
        </div>
      )}

      {/* Category accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {grouped.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: S.textMuted }}>
            <Search size={28} style={{ marginBottom: 10, opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: 13 }}>No responses match your search.</p>
          </div>
        ) : grouped.map(({ category, items }) => {
          const isOpen = expandedCategories.has(category);
          return (
            <div key={category} style={{
              border: `1px solid ${isOpen ? S.borderHover : S.border}`,
              borderRadius: 12, overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}>
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '13px 16px', background: isOpen ? S.cardHover : S.card,
                  border: 'none', cursor: 'pointer', color: S.textPrimary, textAlign: 'left',
                  borderBottom: isOpen ? `1px solid ${S.border}` : 'none',
                  transition: 'background 0.2s',
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{CATEGORY_ICONS[category]}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{category}</span>
                <span style={{
                  fontSize: 11, color: S.textMuted,
                  background: S.surface, padding: '2px 8px', borderRadius: 20,
                  border: `1px solid ${S.border}`,
                }}>
                  {items.length} template{items.length !== 1 ? 's' : ''}
                </span>
                <span style={{ color: isOpen ? S.orangeText : S.textMuted, transition: 'color 0.2s' }}>
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              </button>

              {/* Items */}
              {isOpen && (
                <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 6, background: S.surface }}>
                  {items.map(item => (
                    <ResponseCard
                      key={item.id}
                      item={item}
                      copiedId={copiedId}
                      copy={copy}
                      highlight={searchQuery}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState<AppMode>('ai');
  const [searchQuery, setSearchQuery] = useState('');
  const { copiedId, copy } = useCopy();
  const searchRef = useRef<HTMLInputElement>(null);

  // When switching to browse with a search in AI mode, carry it over
  const handleModeSwitch = (m: AppMode) => {
    setMode(m);
    if (m === 'browse') {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.textPrimary, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Toaster />

      {/* ── HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: `${S.surface}ee`,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${S.border}`,
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 56 }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${S.orange}, #dc2626)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Flame size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: S.textPrimary, lineHeight: 1.2 }}>Flame AI</div>
                <div style={{ fontSize: 10, color: S.textMuted, lineHeight: 1 }}>Betfalme Support</div>
              </div>
            </div>

            {/* Search (browse mode) */}
            {mode === 'browse' && (
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: S.textMuted, pointerEvents: 'none' }} />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  style={{
                    width: '100%', padding: '7px 32px 7px 30px',
                    background: S.card, border: `1px solid ${searchQuery ? S.borderHover : S.border}`,
                    borderRadius: 8, color: S.textPrimary, fontSize: 12, outline: 'none',
                    caretColor: S.orange, transition: 'border-color 0.2s',
                  }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: S.textMuted, padding: 2,
                  }}>
                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            {/* Spacer in AI mode */}
            {mode === 'ai' && <div style={{ flex: 1 }} />}

            {/* Mode toggle */}
            <div style={{
              display: 'flex', background: S.card,
              border: `1px solid ${S.border}`, borderRadius: 10, padding: 3, gap: 2,
            }}>
              {([
                { id: 'ai', icon: <Sparkles size={12} />, label: 'AI Assist' },
                { id: 'browse', icon: <BookOpen size={12} />, label: 'Browse' },
              ] as const).map(({ id, icon, label }) => (
                <button key={id} onClick={() => handleModeSwitch(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 7, border: 'none',
                    background: mode === id ? S.orange : 'transparent',
                    color: mode === id ? '#fff' : S.textMuted,
                    fontSize: 12, fontWeight: mode === id ? 600 : 400,
                    cursor: 'pointer', transition: 'all 0.18s',
                  }}>
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '20px 20px 60px' }}>
        {mode === 'ai' ? (
          <div>
            {/* AI mode heading */}
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color={S.orange} />
              <span style={{ fontSize: 13, color: S.textSecondary }}>
                Paste the client's message — get an instant matched response with tone suggestion
              </span>
            </div>
            <AIAssistPanel copiedId={copiedId} copy={copy} />
          </div>
        ) : (
          <BrowsePanel searchQuery={searchQuery} copiedId={copiedId} copy={copy} />
        )}
      </main>
    </div>
  );
}
