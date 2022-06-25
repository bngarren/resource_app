import * as React from "react";
import config from "../config";
import { useAuth } from "./auth";

type HTTPMethod = "GET" | "POST" | "UPDATE" | "DELETE" | "PATCH" | "PUT";

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
