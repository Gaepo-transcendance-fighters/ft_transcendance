"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { io } from "socket.io-client";
import secureLocalStorage from "react-secure-storage";

const server_domain = process.env.NEXT_PUBLIC_SERVER_URL_4000;

export default function HomePage() {
  const router = useRouter();
  const { authState, authDispatch } = useAuth();

  useEffect(() => {
    console.log("🙋🏻‍♂️ [app/page.tsx] You are in app/page.tsx");

    const socket = io(`${server_domain}/chat`, {
      query: { userId: secureLocalStorage.getItem("idx") as string },
      autoConnect: false,
    });

    const gameSocket = io(`${server_domain}/game/playroom`, {
      query: { userId: secureLocalStorage.getItem("idx") as string },
      autoConnect: false,
    });

    authDispatch({ type: "SET_CHAT_SOCKET", value: socket });
    authDispatch({ type: "SET_GAME_SOCKET", value: gameSocket });

    console.log("🙋🏻‍♂️ [app/page.tsx] go to login");
    authState.chatSocket?.disconnect();
    return router.replace("/login");
  }, []);

  return null;
}
