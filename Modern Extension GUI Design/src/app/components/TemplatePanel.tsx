import { useState } from "react";
import { Category, Subcategory, Template } from "./data";
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react";

interface TemplatePanelProps {
  category: Category | null;
  searchQuery: string;
  allCategories: Category[];
}

interface CopiedState {
  subcatId: string;
  templateLabel: string;
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} style={{ background: "#f59e0b33", color: "#fbbf24", borderRadius: 2 }}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function TemplateCard({
  template,
  subcatId,
  copied,
  onCopy,
  query,
  color,
}: {
  template: Template;
  subcatId: string;
  copied: CopiedState | null;
  onCopy: (subcatId: string, label: string, text: string) => void;
  query: string;
  color: string;
}) {
  const isCopied = copied?.subcatId === subcatId && copied?.templateLabel === template.label;

  return (
    <div
      className="group relative rounded-lg p-3 transition-all duration-150 cursor-pointer"
      style={{
        background: "#1a202c",
        border: "1px solid #2d3748",
      }}
      onClick={() => onCopy(subcatId, template.label, template.text)}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span
          className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0"
          style={{
            background: `${color}22`,
            color: color,
            border: `1px solid ${color}44`,
            fontWeight: 600,
          }}
        >
          {template.label}
        </span>
        <button
          className="flex-shrink-0 p-1 rounded transition-all duration-150 opacity-0 group-hover:opacity-100"
          style={{
            background: isCopied ? "#065f4622" : "#2d3748",
            border: `1px solid ${isCopied ? "#10b981" : "#4a5568"}`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onCopy(subcatId, template.label, template.text);
          }}
          title="Copy to clipboard"
        >
          {isCopied ? (
            <Check size={12} style={{ color: "#10b981" }} />
          ) : (
            <Copy size={12} style={{ color: "#718096" }} />
          )}
        </button>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "#a0aec0" }}>
        {highlight(template.text, query)}
      </p>
    </div>
  );
}

function SubcategoryBlock({
  subcat,
  copied,
  onCopy,
  query,
  color,
  defaultOpen,
}: {
  subcat: Subcategory;
  copied: CopiedState | null;
  onCopy: (subcatId: string, label: string, text: string) => void;
  query: string;
  color: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2d3748" }}>
      <button
        className="w-full flex items-center gap-2 px-4 py-3 text-left transition-all duration-150"
        style={{ background: "#171e2b" }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-sm flex-shrink-0">{subcat.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs truncate" style={{ color: "#cbd5e0", fontWeight: 500 }}>
            {highlight(subcat.name, query)}
          </p>
          <p className="text-[10px] mt-0.5 truncate" style={{ color: "#4a5568" }}>
            {subcat.triggers}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: "#2d3748", color: "#718096" }}
          >
            {subcat.templates.length} {subcat.templates.length === 1 ? "reply" : "replies"}
          </span>
          {open ? (
            <ChevronDown size={12} style={{ color: "#4a5568" }} />
          ) : (
            <ChevronRight size={12} style={{ color: "#4a5568" }} />
          )}
        </div>
      </button>

      {open && (
        <div className="p-3 space-y-2" style={{ background: "#131a24", borderTop: "1px solid #2d3748" }}>
          {subcat.templates.map((t) => (
            <TemplateCard
              key={t.label}
              template={t}
              subcatId={subcat.id}
              copied={copied}
              onCopy={onCopy}
              query={query}
              color={color}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TemplatePanel({ category, searchQuery, allCategories }: TemplatePanelProps) {
  const [copied, setCopied] = useState<CopiedState | null>(null);

  const handleCopy = (subcatId: string, label: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied({ subcatId, templateLabel: label });
    setTimeout(() => setCopied(null), 2000);
  };

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    const results: { cat: Category; subcat: Subcategory }[] = [];
    for (const cat of allCategories) {
      for (const sub of cat.subcategories) {
        const matchName = sub.name.toLowerCase().includes(q);
        const matchTriggers = sub.triggers.toLowerCase().includes(q);
        const matchTemplates = sub.templates.some((t) => t.text.toLowerCase().includes(q));
        if (matchName || matchTriggers || matchTemplates) {
          results.push({ cat, subcat: sub });
        }
      }
    }

    if (results.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <span className="text-4xl">🔍</span>
          <p className="text-sm" style={{ color: "#4a5568" }}>
            No results for &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      );
    }

    return (
      <div className="p-4 space-y-3 overflow-y-auto h-full" style={{ scrollbarWidth: "thin", scrollbarColor: "#2d3748 transparent" }}>
        <p className="text-xs" style={{ color: "#4a5568" }}>
          {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
        </p>
        {results.map(({ cat, subcat }) => (
          <SubcategoryBlock
            key={subcat.id}
            subcat={subcat}
            copied={copied}
            onCopy={handleCopy}
            query={searchQuery}
            color={cat.color}
            defaultOpen={true}
          />
        ))}
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-5xl">📋</div>
        <div className="text-center">
          <p className="text-sm" style={{ color: "#718096" }}>
            Select a category or use
          </p>
          <p className="text-sm mt-1" style={{ color: "#4a5568" }}>
            <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: "#2d3748", border: "1px solid #4a5568", color: "#a0aec0" }}>/</kbd>{" "}
            to search across all templates
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-4 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: "1px solid #1a202c" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{category.icon}</span>
          <h2 className="text-sm" style={{ color: "#e2e8f0", fontWeight: 600 }}>
            {category.name}
          </h2>
          <span
            className="ml-auto text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: "#2d3748", color: "#718096" }}
          >
            {category.subcategories.length} topics
          </span>
        </div>
        <p className="text-[10px]" style={{ color: "#4a5568" }}>
          Triggers: {category.triggers}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "thin", scrollbarColor: "#2d3748 transparent" }}>
        {category.subcategories.map((sub, i) => (
          <SubcategoryBlock
            key={sub.id}
            subcat={sub}
            copied={copied}
            onCopy={handleCopy}
            query={searchQuery}
            color={category.color}
            defaultOpen={i === 0}
          />
        ))}
      </div>
    </div>
  );
}
