import { CaseReducer, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";

export type LogType = "debug" | "info" | "warn" | "error";

type LogItem = {
  id: string;
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
    message: string;
    type?: LogType;
    skipConsole?: boolean;
  }>
> = (state, { payload }) => {
  state.data.push({
    id: uuid(),
    type: payload.type || "debug",
    message: payload.message,
    time: new Date().toISOString(),
  });
  if (payload.skipConsole) return;
  console[payload.type || "info"](payload.message);
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
