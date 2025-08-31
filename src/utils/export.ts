import { toPng, toSvg } from "html-to-image";

export interface ExportOptions {
  format: "png" | "svg";
  quality?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export const exportDiagram = async (
  element: HTMLElement,
  options: ExportOptions,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    onProgress?.(10);

    const exportOptions = {
      quality: options.quality || 1.0,
      width: options.width || element.scrollWidth,
      height: options.height || element.scrollHeight,
      backgroundColor: options.backgroundColor || "white",
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
        width: `${options.width || element.scrollWidth}px`,
        height: `${options.height || element.scrollHeight}px`,
      },
    };

    onProgress?.(30);

    let dataUrl: string;

    if (options.format === "png") {
      dataUrl = await toPng(element, exportOptions);
    } else {
      dataUrl = await toSvg(element, exportOptions);
    }

    onProgress?.(80);

    // Create download link
    const link = document.createElement("a");
    link.download = `mermaid-diagram-${Date.now()}.${options.format}`;
    link.href = dataUrl;

    onProgress?.(90);

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onProgress?.(100);

    return dataUrl;
  } catch (error) {
    console.error("Export failed:", error);
    throw new Error(
      `Failed to export diagram: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const validateExportElement = (element: HTMLElement): boolean => {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;

  return true;
};

export const getOptimalExportDimensions = (
  element: HTMLElement
): { width: number; height: number } => {
  const rect = element.getBoundingClientRect();
  const scale = 2; // Higher resolution for export

  return {
    width: Math.round(rect.width * scale),
    height: Math.round(rect.height * scale),
  };
};

export const exportSvgContent = async (
  svgContent: string,
  options: ExportOptions,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    onProgress?.(10);

    // Create a temporary container with the SVG content
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = svgContent;
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "-9999px";
    document.body.appendChild(tempContainer);

    onProgress?.(30);

    let dataUrl: string;

    if (options.format === "png") {
      dataUrl = await toPng(tempContainer, {
        quality: options.quality || 1.0,
        width: options.width || 800,
        height: options.height || 600,
        backgroundColor: options.backgroundColor || "white",
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });
    } else {
      dataUrl = await toSvg(tempContainer, {
        width: options.width || 800,
        height: options.height || 600,
      });
    }

    onProgress?.(80);

    // Create download link
    const link = document.createElement("a");
    link.download = `mermaid-diagram-${Date.now()}.${options.format}`;
    link.href = dataUrl;

    onProgress?.(90);

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up temporary container
    document.body.removeChild(tempContainer);

    onProgress?.(100);

    return dataUrl;
  } catch (error) {
    console.error("SVG export failed:", error);
    throw new Error(
      `Failed to export diagram: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
