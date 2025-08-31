"use client";

import { useEffect } from "react";
import { CodeEditor } from "../components/CodeEditor";
import { DiagramPreview } from "../components/DiagramPreview";
import { ControlPanel } from "../components/ControlPanel";
import { useAppStore } from "../store/useAppStore";

export default function Home() {
  const { loadDiagram, theme } = useAppStore();

  // Load saved diagram on mount
  useEffect(() => {
    loadDiagram();
  }, [loadDiagram]);

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark" : ""}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
          {/* Control Panel */}
          <div className="mb-6">
            <ControlPanel />
          </div>

          {/* Editor and Preview Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-10 gap-8">
            {/* Code Editor - 30% on large screens */}
            <div className="xl:col-span-3">
              <CodeEditor />
            </div>

            {/* Diagram Preview - 70% on large screens */}
            <div className="xl:col-span-7">
              <DiagramPreview />
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>
                Built with Next.js 14, TypeScript, and Mermaid.js •
                <a
                  href="https://mermaid.js.org/syntax/flowchart.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
                >
                  Mermaid Syntax Reference
                </a>
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
