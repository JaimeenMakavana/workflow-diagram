import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  AppState,
  BaseState,
  IdleState,
  LoadedState,
  EditingState,
  RenderingState,
  ErrorState,
  SavedState,
  ExportState,
  ThemeState,
} from "../types/state";

interface AppStore extends BaseState {
  // Status
  status: AppState["status"];

  // Additional properties that may exist on some states
  timestamp?: string;
  id?: string;
  format?: "png" | "svg";
  progress?: number;
  rendered?: boolean;
  lineCount: number;
  svgContent: string;

  // Actions
  setCode: (code: string) => void;
  setError: (error: string | null) => void;
  setTheme: (theme: "light" | "dark") => void;
  setSvgContent: (svgContent: string) => void;
  startEditing: () => void;
  startRendering: () => void;
  setRendered: (rendered: boolean) => void;
  startExport: (format: "png" | "svg") => void;
  setExportProgress: (progress: number) => void;
  completeExport: () => void;
  saveDiagram: () => void;
  loadDiagram: () => void;
  resetToIdle: () => void;

  // Computed values
  canRender: boolean;
  canExport: boolean;
}

const initialState: IdleState = {
  status: "idle",
  code: "",
  error: null,
  theme: "light",
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        lineCount: 0,
        canRender: false,
        canExport: false,
        svgContent: "",

        setCode: (code: string) => {
          const lineCount = code.split("\n").length;
          const currentState = get();

          // Check line count limit
          if (lineCount > 400) {
            set({
              status: "error",
              code,
              error: `Code exceeds 400 line limit (${lineCount} lines)`,
              theme: currentState.theme,
              lineCount,
              canRender: false,
              canExport: false,
              svgContent: currentState.svgContent,
            } as ErrorState);
            return;
          }

          // If we have code and no errors, start editing
          if (code.trim() && !currentState.error) {
            set({
              status: "editing",
              code,
              error: null,
              theme: currentState.theme,
              lineCount,
              canRender: true,
              canExport: true,
              svgContent: currentState.svgContent,
            } as EditingState);
          } else if (!code.trim()) {
            // Empty code, go back to idle
            set({
              status: "idle",
              code: "",
              error: null,
              theme: currentState.theme,
              lineCount: 0,
              canRender: false,
              canExport: false,
              svgContent: "",
            } as IdleState);
          } else {
            // Just update code in current state
            set({ code, lineCount });
          }
        },

        setError: (error: string | null) => {
          const currentState = get();
          if (error) {
            set({
              status: "error",
              code: currentState.code,
              error,
              theme: currentState.theme,
              lineCount: currentState.lineCount,
              canRender: false,
              canExport: false,
            } as ErrorState);
          } else {
            // Clear error, go back to editing if we have code
            if (currentState.code.trim()) {
              set({
                status: "editing",
                code: currentState.code,
                error: null,
                theme: currentState.theme,
                lineCount: currentState.lineCount,
                canRender: true,
                canExport: true,
              } as EditingState);
            }
          }
        },

        setTheme: (theme: "light" | "dark") => {
          const currentState = get();
          set({
            status: "theme-change",
            code: currentState.code,
            error: currentState.error,
            theme,
            lineCount: currentState.lineCount,
            canRender: currentState.canRender,
            canExport: currentState.canExport,
            svgContent: currentState.svgContent,
          } as ThemeState);
        },

        setSvgContent: (svgContent: string) => {
          set({ svgContent });
        },

        startEditing: () => {
          const currentState = get();
          if (currentState.code.trim()) {
            set({
              status: "editing",
              code: currentState.code,
              error: null,
              theme: currentState.theme,
              lineCount: currentState.lineCount,
              canRender: true,
              canExport: true,
            } as EditingState);
          }
        },

        startRendering: () => {
          const currentState = get();
          if (currentState.canRender && !currentState.error) {
            set({
              status: "rendering",
              code: currentState.code,
              error: null,
              theme: currentState.theme,
              rendered: false,
              lineCount: currentState.lineCount,
              canRender: true,
              canExport: true,
            } as RenderingState);
          }
        },

        setRendered: (rendered: boolean) => {
          const currentState = get();
          if (currentState.status === "rendering") {
            set({ rendered });
          }
        },

        startExport: (format: "png" | "svg") => {
          const currentState = get();
          if (currentState.canExport) {
            set({
              status: "exporting",
              code: currentState.code,
              error: currentState.error,
              theme: currentState.theme,
              format,
              progress: 0,
              lineCount: currentState.lineCount,
              canRender: currentState.canRender,
              canExport: true,
            } as ExportState);
          }
        },

        setExportProgress: (progress: number) => {
          const currentState = get();
          if (currentState.status === "exporting") {
            set({ progress });
          }
        },

        completeExport: () => {
          const currentState = get();
          // Go back to previous state
          if (currentState.code.trim() && !currentState.error) {
            set({
              status: "editing",
              code: currentState.code,
              error: null,
              theme: currentState.theme,
              lineCount: currentState.lineCount,
              canRender: true,
              canExport: true,
            } as EditingState);
          }
        },

        saveDiagram: () => {
          const currentState = get();
          if (currentState.code.trim()) {
            const id = `diagram_${Date.now()}`;
            const timestamp = new Date().toISOString();

            // Save to localStorage
            localStorage.setItem(
              id,
              JSON.stringify({
                code: currentState.code,
                theme: currentState.theme,
                timestamp,
              })
            );

            set({
              status: "saved",
              code: currentState.code,
              error: currentState.error,
              theme: currentState.theme,
              id,
              timestamp,
              lineCount: currentState.lineCount,
              canRender: true,
              canExport: true,
            } as SavedState);
          }
        },

        loadDiagram: () => {
          // Try to load the most recent diagram
          const keys = Object.keys(localStorage).filter((key) =>
            key.startsWith("diagram_")
          );
          if (keys.length > 0) {
            const mostRecent = keys.sort().pop()!;
            const saved = JSON.parse(localStorage.getItem(mostRecent)!);
            const lineCount = saved.code.split("\n").length;

            set({
              status: "loaded",
              code: saved.code,
              error: null,
              theme: saved.theme,
              timestamp: saved.timestamp,
              lineCount,
              canRender: true,
              canExport: true,
            } as LoadedState);
          }
        },

        resetToIdle: () => {
          set({
            status: "idle",
            code: "",
            error: null,
            theme: get().theme,
            lineCount: 0,
            canRender: false,
            canExport: false,
          } as IdleState);
        },
      }),
      {
        name: "mermaid-workflow-storage",
        partialize: (state) => ({
          theme: state.theme,
          // Don't persist code or other state, just theme preference
        }),
      }
    )
  )
);
