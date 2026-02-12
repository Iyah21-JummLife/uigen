import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

interface ToolInvocationDisplayProps {
  toolInvocation: ToolInvocation;
}

function getToolMessage(toolInvocation: ToolInvocation): string {
  const { toolName, args } = toolInvocation;
  const command = args?.command as string | undefined;
  const path = args?.path as string | undefined;

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return `Created ${path ?? "file"}`;
      case "str_replace":
        return `Edited ${path ?? "file"}`;
      case "insert":
        return `Edited ${path ?? "file"}`;
      case "view":
        return `Viewed ${path ?? "file"}`;
    }
  }

  if (toolName === "file_manager") {
    const newPath = args?.new_path as string | undefined;
    switch (command) {
      case "rename":
        return `Renamed ${path ?? "file"} → ${newPath ?? "new file"}`;
      case "delete":
        return `Deleted ${path ?? "file"}`;
    }
  }

  return toolName;
}

export function ToolInvocationDisplay({ toolInvocation }: ToolInvocationDisplayProps) {
  const isComplete = toolInvocation.state === "result" && toolInvocation.result;
  const message = getToolMessage(toolInvocation);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{message}</span>
    </div>
  );
}
