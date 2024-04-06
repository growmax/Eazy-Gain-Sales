"use client";

import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "../hooks/use-auth-context";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const { authenticated } = useAuthContext();
  const [checked, setChecked] = useState(false);
  const check = useCallback(() => {
    if (!authenticated) {
      if (router.pathname != "/auth/login") {
        router.replace("/auth/login");
      }
    } else {
      if (authenticated && router.pathname === "/auth/login") {
        router.replace("/");
      }
    }
    setChecked(true);
  }, [authenticated, router]);

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
