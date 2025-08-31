export interface ValidationResult {
  isValid: boolean;
  error: string | null;
  lineCount: number;
}

export const validateMermaidCode = (code: string): ValidationResult => {
  const trimmedCode = code.trim();

  if (!trimmedCode) {
    return {
      isValid: false,
      error: "Code cannot be empty",
      lineCount: 0,
    };
  }

  const lines = trimmedCode.split("\n");
  const lineCount = lines.length;

  // Check line count limit
  if (lineCount > 400) {
    return {
      isValid: false,
      error: `Code exceeds 400 line limit (${lineCount} lines)`,
      lineCount,
    };
  }

  // Basic Mermaid syntax validation
  const hasGraphDeclaration =
    /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|quadrantChart|requirement|gitgraph|mindmap|timeline|zenuml|sankey|xyChart|block|blockdiag|seqdiag|actdiag|nwdiag|packetdiag|rackdiag|c4Diagram|mermaid)/i.test(
      trimmedCode
    );

  if (!hasGraphDeclaration) {
    return {
      isValid: false,
      error: "Invalid Mermaid syntax: Missing graph declaration",
      lineCount,
    };
  }

  // Check for basic structure
  const hasContent = lines.some(
    (line) => line.trim() && !line.trim().startsWith("%")
  );
  if (!hasContent) {
    return {
      isValid: false,
      error: "Invalid Mermaid syntax: No content found",
      lineCount,
    };
  }

  return {
    isValid: true,
    error: null,
    lineCount,
  };
};

export const countLines = (code: string): number => {
  if (!code.trim()) return 0;
  return code.split("\n").length;
};

export const truncateCode = (code: string, maxLines: number = 400): string => {
  const lines = code.split("\n");
  if (lines.length <= maxLines) return code;

  return (
    lines.slice(0, maxLines).join("\n") +
    "\n// ... truncated (exceeds 400 lines)"
  );
};

export const sanitizeCode = (code: string): string => {
  // Remove potential XSS vectors while preserving Mermaid syntax
  return code
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
};
