import React from "react";
import { useThemeStore } from "../../stores/uiStore";
import { Button } from "../ui/button";
import { Palette, Check } from "lucide-react";

const themes = [
  { id: "light", name: "Light", preview: "#ffffff" },
  { id: "dark", name: "Dark", preview: "#0f172a" },
  { id: "ocean", name: "Ocean", preview: "#0ea5e9" },
  { id: "forest", name: "Forest", preview: "#22c55e" },
  { id: "sunset", name: "Sunset", preview: "#f97316" },
  { id: "purple", name: "Purple", preview: "#8b5cf6" },
];

export default function ThemeSelector() {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Palette className="h-5 w-5" />
        <span className="sr-only">Change theme</span>
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-md border bg-white dark:bg-slate-950 shadow-lg">
            <div className="p-2">
              <div className="text-sm font-medium mb-2 px-2 py-1">
                Choose Theme
              </div>
              <div className="grid grid-cols-2 gap-1">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-2 px-2 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-700"
                      style={{ backgroundColor: t.preview }}
                    />
                    <span className="text-sm">{t.name}</span>
                    {theme === t.id && <Check className="w-3 h-3 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
