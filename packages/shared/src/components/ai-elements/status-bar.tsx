import { useState, useEffect, useCallback } from "react";
import { cn } from "../../lib/utils";
import { CircleIcon, ZapIcon, FileTextIcon, ShieldOffIcon } from "lucide-react";

export type AgentMode = "code" | "plan" | "bypass";

interface StatusBarProps {
  agentInfo?: { name?: string; version?: string } | null;
  modelId?: string | null;
  sessionId?: string | null;
  connected: boolean;
  totalChars: number; // total characters in conversation (for token estimate)
  mode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
  className?: string;
}

const MODE_CONFIG: Record<AgentMode, { label: string; icon: typeof ZapIcon; color: string; description: string }> = {
  code: { label: "Code", icon: ZapIcon, color: "text-green-500", description: "Normal coding mode" },
  plan: { label: "Plan", icon: FileTextIcon, color: "text-blue-500", description: "Plan before coding" },
  bypass: { label: "Bypass", icon: ShieldOffIcon, color: "text-orange-500", description: "Skip confirmations" },
};

const MODES: AgentMode[] = ["code", "plan", "bypass"];

function estimateTokens(chars: number): string {
  const tokens = Math.round(chars / 4);
  if (tokens < 1000) return `${tokens}`;
  if (tokens < 100000) return `${(tokens / 1000).toFixed(1)}k`;
  return `${Math.round(tokens / 1000)}k`;
}

export const StatusBar = ({
  agentInfo,
  modelId,
  sessionId,
  connected,
  totalChars,
  mode,
  onModeChange,
  className,
}: StatusBarProps) => {
  // Shift+Tab mode cycling
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "Tab") {
        e.preventDefault();
        const currentIdx = MODES.indexOf(mode);
        const nextIdx = (currentIdx + 1) % MODES.length;
        onModeChange(MODES[nextIdx]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, onModeChange]);

  const ModeIcon = MODE_CONFIG[mode].icon;
  const tokens = estimateTokens(totalChars);

  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-1 text-[11px] text-muted-foreground border-t bg-muted/30",
        className
      )}
    >
      {/* Left: connection + agent info */}
      <div className="flex items-center gap-2">
        <CircleIcon
          className={cn("h-2 w-2 fill-current", connected ? "text-green-500" : "text-red-500")}
        />
        {agentInfo?.name && (
          <span>{agentInfo.name}</span>
        )}
        {agentInfo?.version && (
          <span className="opacity-60">v{agentInfo.version}</span>
        )}
      </div>

      {/* Center: mode switcher */}
      <div className="flex items-center gap-1">
        {MODES.map((m) => {
          const cfg = MODE_CONFIG[m];
          const Icon = cfg.icon;
          const isActive = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              title={`${cfg.description} (Shift+Tab to cycle)`}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors",
                isActive
                  ? `${cfg.color} bg-accent font-medium`
                  : "hover:bg-accent/50 opacity-50 hover:opacity-100"
              )}
            >
              <Icon className="h-3 w-3" />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Right: tokens + model + session */}
      <div className="flex items-center gap-2">
        {Number(tokens.replace('k','')) > 0 && (
          <span title="Estimated context tokens">~{tokens} tokens</span>
        )}
        {modelId && modelId !== "default" && (
          <span className="opacity-60">{modelId}</span>
        )}
      </div>
    </div>
  );
};
