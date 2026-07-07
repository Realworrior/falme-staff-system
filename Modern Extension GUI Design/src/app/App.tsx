import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Keyboard, ChevronDown } from "lucide-react";
import { categories, Category } from "./components/data";
import { Sidebar } from "./components/Sidebar";
import { TemplatePanel } from "./components/TemplatePanel";

const SHORTCUT_MAP: Record<string, number> = {
  "1": 1, "2": 2, "3": 3, "4": 4, "5": 5,
  "6": 6, "7": 7, "8": 8, "9": 9,
  "q": 10, "w": 11, "e": 12, "r": 13, "t": 14, "y": 15,
};

function ShortcutBadge({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((k) => (
        <kbd
          key={k}
          className="inline-flex items-center justify-center rounded text-[10px] font-mono px-1.5 py-0.5"
          style={{ background: "#2d3748", border: "1px solid #4a5568", color: "#a0aec0", minWidth: 20 }}
        >
          {k}
        </kbd>
      ))}
    </div>
  );
}

function ShortcutsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: "#0d131c99", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 w-80 max-w-full"
        style={{ background: "#141d2b", border: "1px solid #2d3748" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm" style={{ color: "#e2e8f0", fontWeight: 600 }}>Keyboard Shortcuts</h3>
          <button onClick={onClose} className="p-1 rounded" style={{ color: "#4a5568" }}>
            <X size={14} />
          </button>
        </div>
        <div className="space-y-3">
          {[
            { action: "Focus search", keys: ["/"] },
            { action: "Clear search / Close", keys: ["Esc"] },
            { action: "Categories 1–9", keys: ["1", "–", "9"] },
            { action: "Category 10 (Lost Amounts)", keys: ["Q"] },
            { action: "Category 11 (Account)", keys: ["W"] },
            { action: "Category 12 (Closure)", keys: ["E"] },
            { action: "Category 13 (Maintenance)", keys: ["R"] },
            { action: "Category 14 (Responsible)", keys: ["T"] },
            { action: "Category 15 (Hard Cases)", keys: ["Y"] },
            { action: "Toggle shortcuts panel", keys: ["?"] },
          ].map(({ action, keys }) => (
            <div key={action} className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "#718096" }}>{action}</span>
              <ShortcutBadge keys={keys} />
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3" style={{ borderTop: "1px solid #2d3748" }}>
          <p className="text-[10px] text-center" style={{ color: "#4a5568" }}>
            Click any template to copy it to clipboard
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [selectedCatId, setSelectedCatId] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedCategory: Category | null =
    categories.find((c) => c.id === selectedCatId) ?? null;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA";

      if (e.key === "?" && !isTyping) {
        setShowShortcuts((s) => !s);
        return;
      }

      if (showShortcuts && e.key === "Escape") {
        setShowShortcuts(false);
        return;
      }

      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }

      if (e.key === "Escape" && isTyping) {
        setSearchQuery("");
        searchRef.current?.blur();
        return;
      }

      if (!isTyping && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const catId = SHORTCUT_MAP[e.key.toLowerCase()];
        if (catId) {
          setSelectedCatId(catId);
          setSearchQuery("");
        }
      }
    },
    [showShortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSearchChange = (v: string) => {
    setSearchQuery(v);
    if (v) setSelectedCatId(null);
  };

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: "#0a0f1a" }}>
      {/* Extension popup container */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: "min(980px, 100vw)",
          height: "min(680px, 100vh)",
          background: "#0d131c",
          border: "1px solid #1e2d40",
          borderRadius: "min(16px, 2vw)",
          boxShadow: "0 32px 64px #00000066, 0 0 0 1px #1a2535",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{
            background: "#111827",
            borderBottom: "1px solid #1e2d40",
          }}
        >
          {/* Logo / title */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
            >
              🎰
            </div>
            <div>
              <p className="text-xs leading-none" style={{ color: "#e2e8f0", fontWeight: 600 }}>
                Betfalme
              </p>
              <p className="text-[9px] leading-none mt-0.5" style={{ color: "#4a5568" }}>
                Support Templates v4
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div
            className="flex-1 flex items-center gap-2 rounded-lg px-3 py-1.5 mx-2"
            style={{ background: "#1a2332", border: "1px solid #2d3748" }}
          >
            <Search size={13} style={{ color: "#4a5568", flexShrink: 0 }} />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search templates, triggers, categories…"
              className="flex-1 bg-transparent outline-none text-xs placeholder:text-[11px]"
              style={{ color: "#cbd5e0" }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X size={12} style={{ color: "#4a5568" }} />
              </button>
            )}
            {!searchQuery && (
              <kbd
                className="text-[9px] font-mono px-1 py-0.5 rounded"
                style={{ background: "#2d3748", border: "1px solid #4a5568", color: "#718096" }}
              >
                /
              </kbd>
            )}
          </div>

          {/* Shortcuts button */}
          <button
            onClick={() => setShowShortcuts((s) => !s)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
            style={{
              background: showShortcuts ? "#2d3748" : "#1a2332",
              border: "1px solid #2d3748",
              color: "#718096",
            }}
            title="Keyboard shortcuts (?)"
          >
            <Keyboard size={12} />
            <span className="text-[10px]">Shortcuts</span>
            <kbd
              className="text-[9px] font-mono px-1 py-0.5 rounded"
              style={{ background: "#374151", border: "1px solid #4a5568", color: "#718096" }}
            >
              ?
            </kbd>
          </button>
        </div>

        {/* Shortcut pills row */}
        <div
          className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto flex-shrink-0"
          style={{ background: "#0f1724", borderBottom: "1px solid #1a2535", scrollbarWidth: "none" }}
        >
          <span className="text-[9px] flex-shrink-0 mr-1" style={{ color: "#374151" }}>QUICK:</span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCatId(cat.id); setSearchQuery(""); }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0 transition-all"
              style={{
                background: selectedCatId === cat.id ? `${cat.color}22` : "#1a2332",
                border: `1px solid ${selectedCatId === cat.id ? cat.color + "55" : "#2d3748"}`,
                color: selectedCatId === cat.id ? cat.color : "#4a5568",
              }}
            >
              <span className="text-[10px]">{cat.icon}</span>
              <span className="text-[9px] font-mono" style={{ fontWeight: 600 }}>
                {cat.shortcut.toUpperCase()}
              </span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div
            className="flex-shrink-0 overflow-hidden"
            style={{
              width: 190,
              borderRight: "1px solid #1a2535",
              background: "#0d131c",
            }}
          >
            <Sidebar selectedId={selectedCatId} onSelect={(id) => { setSelectedCatId(id); setSearchQuery(""); }} />
          </div>

          {/* Template panel */}
          <div className="flex-1 overflow-hidden" style={{ background: "#0a0f1a" }}>
            <TemplatePanel
              category={selectedCategory}
              searchQuery={searchQuery}
              allCategories={categories}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-2 flex-shrink-0 text-[10px]"
          style={{ background: "#0d131c", borderTop: "1px solid #1a2535", color: "#374151" }}
        >
          <span>betfalme.ke · Customer Support</span>
          <div className="flex items-center gap-3">
            <span>{categories.length} categories</span>
            <span>
              {categories.reduce((acc, c) => acc + c.subcategories.length, 0)} topics
            </span>
            <span>
              {categories.reduce((acc, c) => acc + c.subcategories.reduce((a, s) => a + s.templates.length, 0), 0)} replies
            </span>
          </div>
        </div>

        {/* Shortcuts overlay */}
        {showShortcuts && <ShortcutsPanel onClose={() => setShowShortcuts(false)} />}
      </div>
    </div>
  );
}
