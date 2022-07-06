import { UserPosition } from "./../../../../types/index";
import { ScanResult } from "../../types";
// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import config from "../../config";
import type { UserInventory } from "../../types";
import { RootState } from "./store";

// Define a service using a base URL and expected endpoints
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: config.api_url,
    // Add authentication header
    prepareHeaders: (headers, { getState }) => {
      // By default, if we have a token in the store, let's use that for authenticated requests
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    scan: builder.mutation<ScanResult, UserPosition>({
      query: (userPosition) => ({
        url: "scan",
        method: "POST",
        body: { userPosition },
      }),
    }),
    getUserInventory: builder.query<UserInventory, string>({
      query: (uuid) => `users/${uuid}/inventory`,
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useScanMutation, useGetUserInventoryQuery } = api;
