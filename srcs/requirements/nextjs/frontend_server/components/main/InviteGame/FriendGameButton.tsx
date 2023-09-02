"use client";

import { Button } from "@mui/material";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/app/page";
import WaitAccept from "./WaitAccept";

import { IFriend } from "@/type/type";
import { useAuth } from "@/context/AuthContext";
import { useModalContext } from "@/context/ModalContext";

const FriendGameButton = ({ prop }: { prop: IFriend }) => {
  const router = useRouter();
  const { authState } = useAuth();
  const { openModal } = useModalContext();

  const handleOpenModal = () => {
    socket.emit("chat_invite_ask", {
      myUserIdx: authState.id,
      targetUserIdx: prop.friendIdx,
    });
    openModal({
      children: <WaitAccept nickname={prop.friendNickname}/>,
    });
  };

  useEffect(() => {
    const askInvite = () => {
      handleOpenModal();
    };
    socket.on("chat_invite_ask", askInvite);

    return () => {
      socket.off("chat_invite_ask");
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

export default FriendGameButton;

// display: "flex",
// alignItems: "center",
// justifyContent: "center",
