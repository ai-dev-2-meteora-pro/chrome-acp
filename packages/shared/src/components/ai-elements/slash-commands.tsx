import { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";
import { SlashIcon } from "lucide-react";

export interface SlashCommand {
  command: string;
  label: string;
  description: string;
  category: "skill" | "session";
}

export const DEFAULT_SLASH_COMMANDS: SlashCommand[] = [
  { command: "/skill:devboy-solve-issue", label: "Solve Issue", description: "Full cycle: branch → code → tests → MR", category: "skill" },
  { command: "/skill:devboy-review-mr", label: "Review MR", description: "Strict code review with inline comments", category: "skill" },
  { command: "/skill:devboy-fix-review-comments", label: "Fix Review", description: "Fix all review comments in current MR", category: "skill" },
  { command: "/skill:devboy-get-issues", label: "Get Issues", description: "List issues from ClickUp/GitLab", category: "skill" },
  { command: "/skill:devboy-create-issue", label: "Create Issue", description: "Create structured ClickUp issue", category: "skill" },
  { command: "/skill:devboy-prepare-daily", label: "Daily Report", description: "Daily development report", category: "skill" },
  { command: "/skill:devboy-post-deploy", label: "Post Deploy", description: "Post-deploy notification", category: "skill" },
  { command: "/skill:devboy-pull-from-main-and-fix-conflicts", label: "Pull Main", description: "Update branch, fix conflicts", category: "skill" },
  { command: "/skill:e2e", label: "E2E Tests", description: "Run Cucumber BDD tests", category: "skill" },
  { command: "/new", label: "New Session", description: "Start fresh conversation", category: "session" },
  { command: "/compact", label: "Compact", description: "Compact conversation context", category: "session" },
  { command: "/help", label: "Help", description: "Show available commands", category: "session" },
];

interface SlashCommandButtonProps {
  onSelect: (command: string) => void;
  commands?: SlashCommand[];
}

export const SlashCommandButton = ({
  onSelect,
  commands = DEFAULT_SLASH_COMMANDS,
}: SlashCommandButtonProps) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus filter input when opened
  useEffect(() => {
    if (open) {
      setFilter("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = commands.filter((cmd) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return cmd.command.toLowerCase().includes(q) || cmd.label.toLowerCase().includes(q);
  });

  const skills = filtered.filter((c) => c.category === "skill");
  const session = filtered.filter((c) => c.category === "session");

  const handleSelect = (command: string) => {
    onSelect(command);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium",
          "h-8 w-8 p-0",
          "hover:bg-accent hover:text-accent-foreground",
          "transition-colors",
          open && "bg-accent text-accent-foreground"
        )}
        title="Slash commands"
      >
        <SlashIcon className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed bottom-20 left-4 z-50 w-80 bg-popover border rounded-lg shadow-lg overflow-hidden">
          {/* Filter input */}
          <div className="p-2 border-b">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search commands..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
                if (e.key === "Enter" && filtered.length > 0) {
                  handleSelect(filtered[0].command);
                }
              }}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Commands list */}
          <div className="max-h-64 overflow-y-auto">
            {skills.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Skills
                </div>
                {skills.map((cmd) => (
                  <button
                    key={cmd.command}
                    type="button"
                    onClick={() => handleSelect(cmd.command)}
                    className="w-full px-3 py-1.5 text-left hover:bg-accent flex items-center gap-2 text-sm"
                  >
                    <span className="font-medium truncate w-24">{cmd.label}</span>
                    <span className="text-muted-foreground text-xs truncate flex-1">{cmd.description}</span>
                  </button>
                ))}
              </>
            )}
            {session.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-t">
                  Session
                </div>
                {session.map((cmd) => (
                  <button
                    key={cmd.command}
                    type="button"
                    onClick={() => handleSelect(cmd.command)}
                    className="w-full px-3 py-1.5 text-left hover:bg-accent flex items-center gap-2 text-sm"
                  >
                    <span className="font-mono text-xs text-muted-foreground w-16">{cmd.command}</span>
                    <span className="truncate flex-1">{cmd.description}</span>
                  </button>
                ))}
              </>
            )}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">No commands found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
