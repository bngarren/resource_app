import { createSlice, CaseReducer, PayloadAction } from "@reduxjs/toolkit";

type AppState = {
  isAuthenticationLoaded: boolean;
};

const slice = createSlice({
  name: "app",
  initialState: {
    isAuthenticationLoaded: false,
  } as AppState,
  reducers: {
    setIsAuthenticationLoaded: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticationLoaded = action.payload;
    },
  },
});

export const { setIsAuthenticationLoaded } = slice.actions;

export default slice.reducer;
