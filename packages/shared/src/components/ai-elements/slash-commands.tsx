import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "../../lib/utils";

export interface SlashCommand {
  command: string;
  label: string;
  description: string;
  category: "skill" | "session" | "nav";
}

export const DEFAULT_SLASH_COMMANDS: SlashCommand[] = [
  // DevBoy Skills
  { command: "/skill:devboy-solve-issue", label: "Solve Issue", description: "Full cycle: branch → code → tests → MR", category: "skill" },
  { command: "/skill:devboy-review-mr", label: "Review MR", description: "Strict code review with inline comments", category: "skill" },
  { command: "/skill:devboy-fix-review-comments", label: "Fix Review Comments", description: "Fix all review comments in current MR", category: "skill" },
  { command: "/skill:devboy-get-issues", label: "Get Issues", description: "List issues from ClickUp/GitLab", category: "skill" },
  { command: "/skill:devboy-create-issue", label: "Create Issue", description: "Create structured ClickUp issue", category: "skill" },
  { command: "/skill:devboy-prepare-daily", label: "Prepare Daily", description: "Daily development report", category: "skill" },
  { command: "/skill:devboy-post-deploy", label: "Post Deploy", description: "Post-deploy notification", category: "skill" },
  { command: "/skill:devboy-pull-from-main-and-fix-conflicts", label: "Pull from Main", description: "Update branch from main, fix conflicts", category: "skill" },
  { command: "/skill:devboy-setup-local-nginx", label: "Setup Nginx", description: "Configure nginx reverse proxy", category: "skill" },
  { command: "/skill:e2e", label: "Run E2E Tests", description: "Run Cucumber BDD E2E tests", category: "skill" },
  // Session commands
  { command: "/new", label: "New Session", description: "Start a new conversation", category: "session" },
  { command: "/compact", label: "Compact", description: "Compact conversation context", category: "session" },
  { command: "/help", label: "Help", description: "Show available commands", category: "session" },
];

interface SlashCommandsPopupProps {
  query: string; // text after "/"
  onSelect: (command: string) => void;
  onClose: () => void;
  commands?: SlashCommand[];
  className?: string;
}

export const SlashCommandsPopup = ({
  query,
  onSelect,
  onClose,
  commands = DEFAULT_SLASH_COMMANDS,
  className,
}: SlashCommandsPopupProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = commands.filter((cmd) => {
    const q = query.toLowerCase();
    return (
      cmd.command.toLowerCase().includes(q) ||
      cmd.label.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q)
    );
  });

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[selectedIndex] as HTMLElement;
    item?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (filtered.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % filtered.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
          break;
        case "Enter":
        case "Tab":
          e.preventDefault();
          if (filtered[selectedIndex]) {
            onSelect(filtered[selectedIndex].command);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filtered, selectedIndex, onSelect, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  if (filtered.length === 0) return null;

  // Group by category
  const skills = filtered.filter((c) => c.category === "skill");
  const session = filtered.filter((c) => c.category === "session");

  let globalIndex = 0;

  const renderGroup = (title: string, items: SlashCommand[]) => {
    if (items.length === 0) return null;
    return (
      <>
        <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </div>
        {items.map((cmd) => {
          const idx = globalIndex++;
          return (
            <div
              key={cmd.command}
              className={cn(
                "px-3 py-2 cursor-pointer flex items-center gap-3 text-sm",
                idx === selectedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              )}
              onClick={() => onSelect(cmd.command)}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <span className="font-mono text-xs text-muted-foreground w-56 truncate">
                {cmd.command}
              </span>
              <span className="flex-1 truncate">{cmd.description}</span>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div
      className={cn(
        "absolute bottom-full left-0 right-0 mb-1 z-50",
        "bg-popover border rounded-lg shadow-lg max-h-64 overflow-y-auto",
        className
      )}
      ref={listRef}
    >
      {renderGroup("Skills", skills)}
      {renderGroup("Session", session)}
    </div>
  );
};
