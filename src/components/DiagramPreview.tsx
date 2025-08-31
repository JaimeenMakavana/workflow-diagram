"use client";

import { useState } from "react";
import { useMermaidRenderer } from "../hooks/useMermaidRenderer";
import { useAppStore } from "../store/useAppStore";

interface DiagramPreviewProps {
  className?: string;
}

export const DiagramPreview = ({ className = "" }: DiagramPreviewProps) => {
  const { diagramRef, isRendering, hasError, error, svgContent } =
    useMermaidRenderer();
  const { code, status, theme } = useAppStore();

  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const isEmpty = !code.trim();
  const isExporting = status === "exporting";

  if (isEmpty) {
    return (
      <div
        className={`flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg ${className}`}
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No diagram to preview
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Start typing Mermaid code in the editor to see your diagram here
          </p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className={`h-96 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 ${className}`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Diagram Error
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <div className="text-sm text-red-600 dark:text-red-400">
                <p>Please check your Mermaid syntax and try again.</p>
                <p className="mt-1">Common issues:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>
                    Missing graph declaration (e.g.,{" "}
                    <code className="bg-red-100 dark:bg-red-900 px-1 rounded">
                      graph TD
                    </code>
                    )
                  </li>
                  <li>Invalid syntax or missing semicolons</li>
                  <li>Unsupported Mermaid features</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Diagram Preview
        </h3>
        <div className="flex items-center space-x-4">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              title="Zoom Out"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                />
              </svg>
            </button>
            <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              title="Zoom In"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                />
              </svg>
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
              title="Reset View"
            >
              Reset
            </button>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-2">
            {isRendering && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Rendering...
                </span>
              </div>
            )}
            {isExporting && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Exporting...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Diagram Container */}
      <div
        className="h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden relative"
        onMouseDown={(e) => {
          if (e.button === 0) {
            // Left click only
            setIsDragging(true);
            setDragStart({
              x: e.clientX - panOffset.x,
              y: e.clientY - panOffset.y,
            });
          }
        }}
        onMouseMove={(e) => {
          if (isDragging) {
            setPanOffset({
              x: e.clientX - dragStart.x,
              y: e.clientY - dragStart.y,
            });
          }
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onWheel={(e) => {
          e.preventDefault();
          const delta = e.deltaY > 0 ? -0.1 : 0.1;
          setZoom(Math.max(0.1, Math.min(3, zoom + delta)));
        }}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        {/* Fixed container that maintains size */}
        <div className="w-full h-full relative">
          {/* Scrollable content area */}
          <div
            className="absolute inset-0 overflow-auto"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
          >
            <div
              ref={diagramRef}
              className="w-full h-full flex items-center justify-center p-4"
              style={{
                backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                color: theme === "dark" ? "#f8fafc" : "#1e293b",
                transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
              }}
            >
              {isRendering ? (
                <div className="text-center" key="loading-spinner">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Rendering diagram...
                  </p>
                </div>
              ) : svgContent ? (
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{isRendering ? "Rendering..." : "Ready"}</span>
          <div className="flex items-center space-x-4">
            <span>Zoom: {Math.round(zoom * 100)}%</span>
            <span>{theme === "dark" ? "Dark Theme" : "Light Theme"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
