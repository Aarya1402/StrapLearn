"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Zap, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-secondary border border-border w-[140px] h-10 animate-pulse" />
    );
  }

  const themes = [
    { id: "light", icon: Sun, label: "Light" },
    { id: "dark", icon: Moon, label: "Dark" },
    { id: "boost", icon: Zap, label: "Boost" },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-2xl bg-secondary border border-border shadow-sm">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.id;
        
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 group
              ${isActive 
                ? "bg-card text-brand-600 shadow-sm ring-1 ring-border" 
                : "text-muted-foreground hover:text-foreground"
              }
            `}
            title={t.label}
          >
            <Icon 
              size={14} 
              className={`
                ${isActive ? "scale-110" : "opacity-60 group-hover:opacity-100"}
                ${isActive && t.id === 'boost' ? "fill-brand-500 text-brand-500" : ""}
                transition-all
              `} 
            />
            <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "opacity-100" : "hidden md:inline-block opacity-40 group-hover:opacity-100 transition-opacity"}`}>
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
