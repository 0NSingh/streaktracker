"use client";

import { Provider } from "jotai";
import { useEffect } from "react";
import { userAtom, authLoadingAtom } from "@/packages/lib/store";
import { useSetAtom } from "jotai";

function AuthInit() {
  const setUser = useSetAtom(userAtom);
  const setLoading = useSetAtom(authLoadingAtom);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ user }) => {
        setUser(user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [setUser, setLoading]);

  return null;
}

export default function JotaiRoot({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <AuthInit />
      {children}
    </Provider>
  );
}
