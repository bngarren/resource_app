import { CaseReducer, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";

export type LogCategory = "app" | "redux" | "domain";
export type LogType = "debug" | "info" | "warn" | "error";

type LogItem = {
  id: string;
  category: LogCategory;
  type: LogType;
  message: string;
  time: string;
};

type LoggerState = {
  data: LogItem[];
};

const initialState: LoggerState = {
  data: [],
};

const _log: CaseReducer<
  LoggerState,
  PayloadAction<{
    category?: LogCategory;
    message: string;
    type?: LogType;
    toConsole?: boolean;
  }>
> = (state, { payload }) => {
  const category = payload.category || "app";
  const type = payload.type || "debug";
  const toConsole = payload.toConsole != null ? payload.toConsole : false;

  state.data.push({
    id: uuid(),
    category: category,
    type: type,
    message: payload.message,
    time: new Date().toISOString(),
  });
  // Errors are always logged to console
  if (toConsole === true || type === "error") {
    console[type](`[${category}] ${payload.message}`);
  }
};

const slice = createSlice({
  name: "logger",
  initialState: initialState,
  reducers: {
    log: _log,
    reset: (state) => {
      state.data = [];
    },
  },
});

export const { log, reset } = slice.actions;
export default slice.reducer;
