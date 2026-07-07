import { categories, Category } from "./data";

interface SidebarProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function Sidebar({ selectedId, onSelect }: SidebarProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="px-3 pt-3 pb-2">
        <p className="text-[10px] uppercase tracking-widest" style={{ color: "#4a5568", fontWeight: 600 }}>
          Categories
        </p>
      </div>
      <nav className="flex-1 px-2 pb-3 space-y-0.5">
        {categories.map((cat: Category) => {
          const isActive = selectedId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all duration-150 group relative"
              style={{
                background: isActive ? `${cat.color}18` : "transparent",
                border: isActive ? `1px solid ${cat.color}35` : "1px solid transparent",
              }}
              title={`Shortcut: ${cat.shortcut.toUpperCase()}`}
            >
              <span className="text-base flex-shrink-0 w-5 text-center leading-none">{cat.icon}</span>
              <span
                className="flex-1 min-w-0 truncate text-xs leading-snug"
                style={{
                  color: isActive ? "#e2e8f0" : "#718096",
                  fontWeight: isActive ? 500 : 400,
                  transition: "color 0.15s",
                }}
              >
                {cat.name}
              </span>
              <span
                className="flex-shrink-0 text-[9px] px-1 py-0.5 rounded font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: "#2d3748",
                  color: "#718096",
                  border: "1px solid #4a5568",
                }}
              >
                {cat.shortcut.toUpperCase()}
              </span>
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r"
                  style={{ background: cat.color }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
