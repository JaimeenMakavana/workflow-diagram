import { useEffect, useRef, useCallback, useState } from "react";
import mermaid from "mermaid";
import { useAppStore } from "../store/useAppStore";
import { validateMermaidCode } from "../utils/validation";

export const useMermaidRenderer = () => {
  const {
    code,
    error,
    theme,
    status,
    setError,
    setRendered,
    startRendering,
    setSvgContent,
    svgContent,
  } = useAppStore();

  const diagramRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "default",
      securityLevel: "strict",
      fontFamily: "monospace",
      fontSize: 14,
      themeVariables: {
        darkMode: theme === "dark",
        primaryColor: theme === "dark" ? "#3b82f6" : "#2563eb",
        primaryTextColor: theme === "dark" ? "#f8fafc" : "#1e293b",
        primaryBorderColor: theme === "dark" ? "#1e40af" : "#1d4ed8",
        lineColor: theme === "dark" ? "#475569" : "#cbd5e1",
        secondaryColor: theme === "dark" ? "#64748b" : "#94a3b8",
        tertiaryColor: theme === "dark" ? "#334155" : "#e2e8f0",
      },
    });
  }, [theme]);

  // Debounced render function
  const debouncedRender = useCallback(
    (code: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(async () => {
        if (!code.trim()) return;

        // Validate code first
        const validation = validateMermaidCode(code);
        if (!validation.isValid) {
          setError(validation.error);
          setSvgContent("");
          return;
        }

        // Clear any previous errors
        setError(null);

        try {
          setIsRendering(true);
          startRendering();

          // Generate a unique ID for this render
          const renderId = `mermaid-${Date.now()}`;

          // Render the diagram and get the SVG content
          const { svg } = await mermaid.render(renderId, code);

          // Update React state instead of manipulating DOM directly
          setSvgContent(svg);
          setRendered(true);
        } catch (renderError) {
          console.error("Mermaid render error:", renderError);
          setError(
            `Rendering failed: ${
              renderError instanceof Error
                ? renderError.message
                : "Unknown error"
            }`
          );
          setSvgContent("");
        } finally {
          setIsRendering(false);
        }
      }, 500); // 500ms debounce
    },
    [setError, startRendering, setRendered]
  );

  // Effect to trigger rendering when code changes
  useEffect(() => {
    if (code && status !== "exporting") {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        debouncedRender(code);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [code, status, debouncedRender]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Force re-render function (useful for theme changes)
  const forceRender = useCallback(async () => {
    if (code) {
      try {
        setIsRendering(true);
        startRendering();

        // Generate a unique ID for this render
        const renderId = `mermaid-${Date.now()}`;

        // Render the diagram and get the SVG content
        const { svg } = await mermaid.render(renderId, code);

        // Update React state instead of manipulating DOM directly
        setSvgContent(svg);
        setRendered(true);
      } catch (renderError) {
        console.error("Force render error:", renderError);
        setError(
          `Rendering failed: ${
            renderError instanceof Error ? renderError.message : "Unknown error"
          }`
        );
        setSvgContent("");
      } finally {
        setIsRendering(false);
      }
    }
  }, [code, setError, startRendering, setRendered]);

  // Effect to re-render when theme changes
  useEffect(() => {
    if (code && svgContent && status !== "exporting") {
      // Re-render with new theme
      const timer = setTimeout(() => {
        forceRender();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [theme, code, svgContent, forceRender, status]);

  return {
    diagramRef,
    isRendering,
    forceRender,
    hasError: !!error,
    error,
    svgContent,
  };
};
