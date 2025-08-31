import { useCallback } from "react";
import { useAppStore } from "../store/useAppStore";
import {
  exportDiagram,
  exportSvgContent,
  validateExportElement,
  getOptimalExportDimensions,
} from "../utils/export";

export const useExport = () => {
  const {
    startExport,
    setExportProgress,
    completeExport,
    code,
    theme,
    canExport,
    status,
  } = useAppStore();

  const exportAsPNG = useCallback(async () => {
    if (!canExport || !code.trim()) return;

    try {
      startExport("png");

      // Get SVG content from the store
      const { svgContent } = useAppStore.getState();

      if (!svgContent) {
        throw new Error("No diagram content to export");
      }

      const backgroundColor = theme === "dark" ? "#1e293b" : "#ffffff";

      await exportSvgContent(
        svgContent,
        {
          format: "png",
          quality: 1.0,
          width: 1200, // High resolution for PNG
          height: 800,
          backgroundColor,
        },
        (progress) => {
          setExportProgress(progress);
        }
      );

      completeExport();
    } catch (error) {
      console.error("PNG export failed:", error);
      completeExport();
      throw error;
    }
  }, [canExport, code, theme, startExport, setExportProgress, completeExport]);

  const exportAsSVG = useCallback(async () => {
    if (!canExport || !code.trim()) return;

    try {
      startExport("svg");

      // Get SVG content from the store
      const { svgContent } = useAppStore.getState();

      if (!svgContent) {
        throw new Error("No diagram content to export");
      }

      await exportSvgContent(
        svgContent,
        {
          format: "svg",
          width: 1200, // High resolution for SVG
          height: 800,
        },
        (progress) => {
          setExportProgress(progress);
        }
      );

      completeExport();
    } catch (error) {
      console.error("SVG export failed:", error);
      completeExport();
      throw error;
    }
  }, [canExport, code, startExport, setExportProgress, completeExport]);

  const isExporting = status === "exporting";

  return {
    exportAsPNG,
    exportAsSVG,
    isExporting,
    canExport,
  };
};
