"use client";

import Layout from "@/components/public/Layout";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ModalPortal } from "@/components/public/ModalPortal";
import { useModalContext } from "@/context/ModalContext";
import InviteGame from "@/components/main/InviteGame/InviteGame";
import { useGame } from "@/context/GameContext";
import { GameType } from "@/type/type";
// import { server_domain } from "../page";
import { IChatRoom, Mode, ReturnMsgDto } from "@/type/RoomType";
import { useRoom } from "@/context/RoomContext";
import secureLocalStorage from "react-secure-storage";
import { useUser } from "@/context/UserContext";
import { io } from "socket.io-client";
const server_domain = process.env.NEXT_PUBLIC_SERVER_URL_4000;

const Page = () => {
  const param = useSearchParams();
  const router = useRouter();
  const { gameDispatch } = useGame();
  const [client, setClient] = useState(false);
  const { authState, authDispatch } = useAuth();
  const { userState } = useUser();
  const { roomState, roomDispatch } = useRoom();
  const { openModal, closeModal } = useModalContext();
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (authState.gameSocket?.connected)
      console.log(`[main page]🥳 게임 소켓 연결 상태 Good!`)
    else
      console.log(`[main page]🥺 게임 소켓 연결 BAD...`)
    if (param.get("from") === "game") {
      const handlePopState = (e: PopStateEvent) => {
        e.preventDefault();
        router.replace("/home?from=game");
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, []);

  useEffect(() => {
    if (authState.chatSocket === undefined) {
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
    }
    console.log(
      "🤷 [home page.tsx] authState.chatSocket?.connected : ",
      authState.chatSocket?.connected
    );
    if (!authState.chatSocket?.connected) {
      console.log("🤷 [home page.tsx] connection try");
      authState.chatSocket?.connect();
    }
  }, [authState.chatSocket, authState.chatSocket?.connected]);

  useEffect(() => {
    setClient(true);
    const askInvite = ({
      userIdx,
      userNickname,
    }: {
      userIdx: number;
      userNickname: string;
    }) => {
      openModal({
        children: <InviteGame nickname={userNickname} idx={userIdx} />,
      });
    };

    const recieveInvite = ({
      inviteUserIdx, // 초대 한 사람
      inviteUserNickname,
      targetUserIdx, // 초대 받은 사람
      targetUserNickname,
      answer,
    }: {
      inviteUserIdx: number; // 초대 한 사람
      inviteUserNickname: string;
      targetUserIdx: number; // 초대 받은 사람
      targetUserNickname: string;
      answer: boolean;
    }) => {
      if (answer === false) {
        if (!authState.chatSocket) return;
        authState.chatSocket.emit(
          "BR_set_status_online",
          {
            userNickname: authState.userInfo.nickname,
          },
          (ret: ReturnMsgDto) => {}
        );
        closeModal();
      } else if (answer === true) {
        gameDispatch({ type: "SET_GAME_MODE", value: GameType.FRIEND });
        const target = { nick: inviteUserNickname, id: inviteUserIdx };
        gameDispatch({ type: "B_PLAYER", value: target });
        if (roomState.currentRoom) {
          if (!authState.chatSocket) return;
          if (roomState.currentRoom.mode === Mode.PRIVATE) {
            roomDispatch({ type: "SET_CUR_ROOM", value: null });
            roomDispatch({ type: "SET_IS_OPEN", value: false });
          } else {
            authState.chatSocket.emit(
              "chat_goto_lobby",
              {
                channelIdx: roomState.currentRoom!.channelIdx,
                userIdx: parseInt(secureLocalStorage.getItem("idx") as string),
              },
              (ret: ReturnMsgDto) => {
                if (ret.code === 200) {
                  roomDispatch({ type: "SET_IS_OPEN", value: false });
                  roomDispatch({ type: "SET_CUR_ROOM", value: null });
                } else if (ret.code === 400) {
                  roomDispatch({ type: "SET_IS_OPEN", value: false });
                  roomDispatch({ type: "SET_CUR_ROOM", value: null });
                } else {
                  console.log("HomeGoToLobby : ", ret.msg);
                }
              }
            );
          }
        }
        closeModal();
        router.replace("./optionselect");
      }
    };

    const HomeGoToLobby = (payload: IChatRoom[]) => {
      roomDispatch({ type: "SET_NON_DM_ROOMS", value: payload });
    };
    if (!authState.chatSocket) return;
    authState.chatSocket.on("chat_goto_lobby", HomeGoToLobby);
    authState.chatSocket.on("chat_receive_answer", recieveInvite);
    authState.chatSocket.on("chat_invite_answer", askInvite);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("chat_goto_lobby", HomeGoToLobby);
      authState.chatSocket.off("chat_receive_answer");
      authState.chatSocket.off("chat_invite_answer");
    };
  }, [
    authState.chatSocket,
    authState.chatSocket?.connected,
    roomState,
    roomState.currentRoom?.channelIdx,
  ]);

  useEffect(() => {
    if (authState.chatSocket === undefined) return;
    const interval = setInterval(() => {
      authState.chatSocket!.emit("health_check", {}, (res: ReturnMsgDto) => {
        if (res.code === 200) {
          setCount(3);
        }
      });
    }, 30);

    return () => {
      clearInterval(interval);
      if (!authState.chatSocket) return;
      authState.chatSocket.off("health_check");
    };
  }, [count, setCount]);

  useEffect(() => {
    const interval_check = setInterval(() => {
      setCount((prev) => prev - 1);
      // console.log("count : ", count);
    }, 200);
    if (count < 0) {
      router.replace("/login");
    }

    return () => {
      clearInterval(interval_check);
    };
  }, [count, setCount]);

  if (!client) return <></>;

  return (
    <>
      <Layout></Layout>
      <ModalPortal />
    </>
  );
};

export default Page;
