import * as React from "react";
import config from "../config";
import { useAuth } from "./auth";

type HTTPMethod = "GET" | "POST" | "UPDATE" | "DELETE" | "PATCH" | "PUT";

/**
 * This custom hooks helps wrap the Fetch API and provide us with
 * the user's JWT token so that it can be passed in the fetch requests
 * to our backend.
 *
 * @param withAuthentication If true, will get user JWT prepared
 */
export const useFetch = (withAuthentication = true) => {
  const { user } = useAuth();
  const [token, setToken] = React.useState<string>();

  React.useEffect(() => {
    (async () => {
      if (user && withAuthentication) {
        const dt = await user.getIdToken();
        setToken(dt);
      }
    })();
  });

  /**
   * A wrapper for Fetch API that uses authentication (i.e., inserts
   * the appropriate "authentication" header into the request with
   * the logged in user's token)
   *
   * @param method HTTP method
   * @param endpoint Our backend endpoint, e.g. /api/[endpoint]
   * @param body Body of the request. If an object, should be JSON.stringified
   * @param useAuth Whether to insert authentication header
   * @param additionalHeaders Other headers to add to the request
   * @returns
   */
  const backendFetch = async (
    method: HTTPMethod,
    endpoint: string,
    body?: string,
    useAuth = true,
    additionalHeaders?: Record<string, string>
  ) => {
    try {
      const res = await fetch(`${config.url}/${endpoint}`, {
        method: method,
        ...(method === "POST" && {
          body: body,
        }),
        headers: {
          "Content-Type": "application/json",
          ...(useAuth && { Authorization: `Bearer ${token}` }),
          ...additionalHeaders,
        },
      });
      if (!res.ok) {
        throw new Error(`Failed fetch. Return status ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      return error instanceof Error ? error : new Error("Failed fetch");
    }
  };

  return {
    backendFetch,
  };
};
