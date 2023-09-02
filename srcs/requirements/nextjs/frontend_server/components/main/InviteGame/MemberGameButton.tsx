"use client";

import { Box, Button, Card, CardContent, Modal } from "@mui/material";
import { useEffect, useState, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/app/page";
import InviteGame from "./InviteGame";
import WaitAccept from "./WaitAccept";
import { IMember } from "@/type/RoomType";
import { useAuth } from "@/context/AuthContext";
import { useModalContext } from "@/context/ModalContext";
import { useGame } from "@/context/GameContext";
import { GameType } from "@/type/type";

const MemberGameButton = ({ prop }: { prop: IMember }) => {
  const router = useRouter();
  const { authState } = useAuth();
  const { openModal, closeModal } = useModalContext();
  const { gameDispatch } = useGame();

  const handleOpenModal = () => {
    socket.emit("chat_invite_ask", {
      myUserIdx: authState.id,
      targetUserIdx: prop.userIdx,
    });
    console.log("open");
    openModal({
      children: <WaitAccept nickname={prop.nickname}/>,
    });
  };

  useEffect(() => {
    const recieveInvite = ({
      inviteUserIdx,
      inviteUserNickname,
      targetUserIdx,
      targetUserNickname,
      answer,
    }: {
      inviteUserIdx: number;
      inviteUserNickname: string;
      targetUserIdx: number;
      targetUserNickname: string;
      answer: number;
    }) => {
      console.log("receive invite", answer);
      if (answer === 0) closeModal();
      else if (answer === 1) {
        gameDispatch({ type: "SET_GAME_MODE", value: GameType.FRIEND });
        closeModal();
        router.push("./optionselect");
      }
    };
    socket.on("chat_receive_answer", recieveInvite);
    socket.on("chat_invite_answer", recieveInvite);

    socket.on("chat_invite_ask", () => {});

    return () => {
      socket.off("chat_invite_ask");
      socket.off("chat_invite_answer");
    };
  }, []);

  return (
    <>
      <Button
        type="button"
        sx={{ minWidth: "max-content" }}
        variant="contained"
        onClick={handleOpenModal}
      >
        친선전
      </Button>
    </>
  );
};

export default MemberGameButton;
