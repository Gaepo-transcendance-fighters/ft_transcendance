"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useRequireAuth = (redirectUrl: string = "/login") => {
  const router = useRouter();
  const { authState } = useAuth();

  useEffect(() => {
    console.log("🙋🏻 [useRequireAuth] You are in useRequireAuth");
    if (document.URL.includes("/login/auth")) return;
    if (document.URL.includes("/init") && authState.userInfo.id) return;
    if (
      !document.URL.includes("/mypage") &&
      !document.URL.includes("/login") &&
      !document.URL.includes("/optionselect") &&
      !document.URL.includes("/secondauth") &&
      !document.URL.includes("/inwaiting") &&
      !document.URL.includes("/init") &&
      !document.URL.includes("/home") &&
      !document.URL.includes("/gameresult") &&
      !document.URL.includes("/gameplaying") &&
      !document.URL.includes("/game")
    ) {
      console.log("👉🏻 [useRequireAuth] return useRequireAuth");
      return;
    }
    console.log("👉🏻 [useRequireAuth] You are moved to /");
    return router.replace("/");
  }, []);
};
