"use client";

import { useEffect, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useAppStore } from "../store/useAppStore";

// Type for Monaco editor instance
type MonacoEditor = Parameters<OnMount>[0];

// Extend Window interface for Monaco
declare global {
  interface Window {
    monaco?: {
      editor: {
        setTheme: (theme: string) => void;
      };
    };
  }
}

interface CodeEditorProps {
  className?: string;
}

export const CodeEditor = ({ className = "" }: CodeEditorProps) => {
  const { code, setCode, theme, lineCount, status } = useAppStore();
  const editorRef = useRef<MonacoEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;

    // Set editor theme
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      lineNumbers: "on",
      roundedSelection: false,
      selectOnLineNumbers: true,
      automaticLayout: true,
      wordWrap: "on",
      lineHeight: 20,
      padding: { top: 16, bottom: 16 },
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  // Update editor theme when app theme changes
  useEffect(() => {
    if (editorRef.current) {
      const monaco = window.monaco;
      if (monaco) {
        monaco.editor.setTheme(theme === "dark" ? "vs-dark" : "vs");
      }
    }
  }, [theme]);

  const isEditing = status === "editing" || status === "rendering";

  return (
    <div className={`relative ${className}`}>
      {/* Header with line count */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Mermaid Code Editor
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {lineCount} / 400 lines
          </span>
          {isEditing && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Live Preview
            </span>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="h-96 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="mermaid"
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme={theme === "dark" ? "vs-dark" : "vs"}
          options={{
            readOnly: false,
            wordWrap: "on",
            lineNumbers: "on",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            lineHeight: 20,
            padding: { top: 16, bottom: 16 },
            automaticLayout: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            parameterHints: { enabled: true },
            hover: { enabled: true },
          }}
        />
      </div>

      {/* Footer with character count */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{code.length} characters</span>
          <span>
            {lineCount > 400 ? (
              <span className="text-red-600 dark:text-red-400 font-medium">
                Exceeds line limit!
              </span>
            ) : (
              `${400 - lineCount} lines remaining`
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
