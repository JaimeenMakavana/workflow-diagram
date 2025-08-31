// 1. Idle State (App just loaded, no code yet)
export type IdleState = {
  status: "idle";
  code: string; // empty string
  error: string | null;
  theme: "light" | "dark";
};

// 2. Loaded State (diagram restored from localStorage)
export type LoadedState = {
  status: "loaded";
  code: string; // restored code
  error: string | null;
  theme: "light" | "dark";
  timestamp: string; // when last saved
};

// 3. Editing State (user typing/pasting code)
export type EditingState = {
  status: "editing";
  code: string;
  error: string | null; // syntax/line count errors
  theme: "light" | "dark";
  lineCount: number;
};

// 4. Rendering State (valid code being visualized)
export type RenderingState = {
  status: "rendering";
  code: string;
  error: null; // must be null here
  theme: "light" | "dark";
  rendered: boolean; // true if diagram is drawn
};

// 5. Error State (invalid syntax or >400 lines)
export type ErrorState = {
  status: "error";
  code: string;
  error: string; // error message
  theme: "light" | "dark";
};

// 6. Saved State (diagram stored in localStorage)
export type SavedState = {
  status: "saved";
  code: string;
  error: string | null;
  theme: "light" | "dark";
  id: string; // unique id for localStorage
  timestamp: string; // when it was saved
};

// 7. Export State (diagram being exported as PNG/SVG)
export type ExportState = {
  status: "exporting";
  code: string;
  error: string | null;
  theme: "light" | "dark";
  format: "png" | "svg";
  progress: number; // export progress %
};

// 8. Theme State (user toggled dark/light mode)
export type ThemeState = {
  status: "theme-change";
  code: string;
  error: string | null;
  theme: "light" | "dark";
};

// Union type for all possible states
export type AppState =
  | IdleState
  | LoadedState
  | EditingState
  | RenderingState
  | ErrorState
  | SavedState
  | ExportState
  | ThemeState;

// Helper type for common properties
export type BaseState = {
  code: string;
  error: string | null;
  theme: "light" | "dark";
  svgContent: string;
};

// Action types for state transitions
export type AppAction =
  | { type: "SET_CODE"; payload: string }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_THEME"; payload: "light" | "dark" }
  | { type: "START_EDITING" }
  | { type: "START_RENDERING" }
  | { type: "SET_RENDERED"; payload: boolean }
  | { type: "START_EXPORT"; payload: "png" | "svg" }
  | { type: "SET_EXPORT_PROGRESS"; payload: number }
  | { type: "COMPLETE_EXPORT" }
  | { type: "SAVE_DIAGRAM" }
  | { type: "LOAD_DIAGRAM" }
  | { type: "RESET_TO_IDLE" };
