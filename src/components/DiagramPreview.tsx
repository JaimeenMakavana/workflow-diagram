"use client";

import { useState, useRef, useCallback } from "react";
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

  // Ref for the diagram content wrapper
  const diagramWrapperRef = useRef<HTMLDivElement>(null);

  const isEmpty = !code.trim();
  const isExporting = status === "exporting";

  // Enhanced zoom controls with better UX
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(3, prev + 0.25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(0.25, prev - 0.25));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.25, Math.min(3, prev + delta)));
  }, []);

  // Enhanced mouse handling for smoother panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button === 0) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - panOffset.x,
          y: e.clientY - panOffset.y,
        });
        (e.currentTarget as HTMLDivElement).style.cursor = "grabbing";
      }
    },
    [panOffset.x, panOffset.y]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging) {
        setPanOffset({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart.x, dragStart.y]
  );

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(false);
    (e.currentTarget as HTMLDivElement).style.cursor = "grab";
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (isEmpty) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 ${className}`}
        style={{ height: "28rem" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-500">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-full h-full"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Ready to Create
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                Start typing Mermaid code in the editor to see your diagram
                appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 ${className}`}
        style={{ height: "28rem" }}
      >
        <div className="absolute inset-0 p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400"
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
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Diagram Error
              </h3>
              <div className="text-sm text-red-700 dark:text-red-300 mb-4">
                <p className="font-medium">{error}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Common Solutions:
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                    <span>
                      Check graph declaration (e.g.,{" "}
                      <code className="bg-red-100 dark:bg-red-900 px-1.5 py-0.5 rounded text-xs font-mono">
                        graph TD
                      </code>
                      )
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                    <span>Verify syntax and semicolons</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                    <span>Ensure supported Mermaid features</span>
                  </li>
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
      {/* Enhanced Header with Better Visual Hierarchy */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-xl px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Diagram Preview
            </h3>
            <div className="flex items-center space-x-2">
              {isRendering && (
                <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                  <div className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <span>Rendering...</span>
                </div>
              )}
              {isExporting && (
                <div className="flex items-center space-x-2 text-sm text-amber-600 dark:text-amber-400">
                  <div className="w-3 h-3 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
                  <span>Exporting...</span>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Zoom Controls */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.25}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
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

              <div className="px-3 py-1 min-w-[4rem] text-center">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              <button
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
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
            </div>

            <button
              onClick={handleZoomReset}
              className="px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200 border border-blue-200 dark:border-blue-800"
              title="Reset View"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Fixed-size Diagram Container - No scaling here */}
      <div
        className="relative bg-white dark:bg-gray-900 border-x border-b border-gray-200 dark:border-gray-700 rounded-b-xl overflow-hidden shadow-sm"
        style={{ height: "28rem" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      >
        {/* Fixed container that maintains size - NO SCALING */}
        <div className="w-full h-full relative">
          {/* Scrollable area - NO SCALING, just overflow handling */}
          <div className="absolute inset-0 overflow-auto">
            {/* Diagram content wrapper - ONLY THIS SCALES */}
            <div
              ref={diagramWrapperRef}
              className="w-full h-full flex items-center justify-center p-8"
              style={{
                backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                color: theme === "dark" ? "#f8fafc" : "#1e293b",
                // ONLY the diagram content scales, centered on the diagram
                transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${
                  panOffset.y / zoom
                }px)`,
                transformOrigin: "center center",
                // Smooth scaling animation
                transition: isDragging
                  ? "none"
                  : "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: isDragging ? "grabbing" : "grab",
              }}
            >
              {isRendering ? (
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-400 rounded-full animate-ping"></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Rendering Diagram
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Please wait while we process your Mermaid code...
                    </p>
                  </div>
                </div>
              ) : svgContent ? (
                <div
                  ref={diagramRef}
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              ) : null}
            </div>
          </div>
        </div>

        {/* Enhanced Zoom Indicator Overlay */}
        {zoom !== 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
            {Math.round(zoom * 100)}% Zoom
          </div>
        )}

        {/* Enhanced Pan Indicator */}
        {(panOffset.x !== 0 || panOffset.y !== 0) && (
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
            Panned: {Math.round(panOffset.x)}, {Math.round(panOffset.y)}
          </div>
        )}
      </div>

      {/* Enhanced Footer with Better Information Display */}
      <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isRendering
                    ? "bg-blue-500 animate-pulse"
                    : hasError
                    ? "bg-red-500"
                    : "bg-green-500"
                }`}
              ></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isRendering ? "Rendering..." : hasError ? "Error" : "Ready"}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
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
                  d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"
                />
              </svg>
              <span>Zoom: {Math.round(zoom * 100)}%</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  theme === "dark" ? "bg-gray-400" : "bg-gray-600"
                }`}
              ></div>
              <span>{theme === "dark" ? "Dark Theme" : "Light Theme"}</span>
            </div>

            {code.trim() && (
              <div className="flex items-center space-x-2">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>{code.split("\n").length} lines</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
