import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationDisplay } from "../ToolInvocationDisplay";

afterEach(() => {
  cleanup();
});

test("shows 'Created' for str_replace_editor create command", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Created /App.jsx")).toBeDefined();
});

test("shows 'Edited' for str_replace_editor str_replace command", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "2",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/Button.jsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Edited /Button.jsx")).toBeDefined();
});

test("shows 'Edited' for str_replace_editor insert command", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "3",
        toolName: "str_replace_editor",
        args: { command: "insert", path: "/utils.js" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Edited /utils.js")).toBeDefined();
});

test("shows 'Viewed' for str_replace_editor view command", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "4",
        toolName: "str_replace_editor",
        args: { command: "view", path: "/App.jsx" },
        state: "result",
        result: "file contents",
      }}
    />
  );
  expect(screen.getByText("Viewed /App.jsx")).toBeDefined();
});

test("shows 'Renamed' for file_manager rename command", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "5",
        toolName: "file_manager",
        args: { command: "rename", path: "/old.jsx", new_path: "/new.jsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Renamed /old.jsx → /new.jsx")).toBeDefined();
});

test("shows 'Deleted' for file_manager delete command", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "6",
        toolName: "file_manager",
        args: { command: "delete", path: "/temp.jsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Deleted /temp.jsx")).toBeDefined();
});

test("shows spinner for pending tool invocation", () => {
  const { container } = render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "7",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "call",
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot for completed tool invocation", () => {
  const { container } = render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "8",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("falls back to tool name for unknown tools", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{
        toolCallId: "9",
        toolName: "unknown_tool",
        args: {},
        state: "result",
        result: "done",
      }}
    />
  );
  expect(screen.getByText("unknown_tool")).toBeDefined();
});
