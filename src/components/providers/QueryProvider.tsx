"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

function QueryProvider({ children }: { children: React.ReactNode }) {
  // One client per browser session; useState keeps it stable across re-renders.
  const [client] = React.useState(makeQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export { QueryProvider };
