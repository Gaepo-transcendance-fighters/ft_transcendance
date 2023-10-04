"use client";

import { Button } from "@mui/material";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import WaitAccept from "./WaitAccept";
import { useGame } from "@/context/GameContext";
import { IFriend } from "@/type/type";
import { useAuth } from "@/context/AuthContext";
import { useModalContext } from "@/context/ModalContext";
import { GameType } from "@/type/type";
import secureLocalStorage from "react-secure-storage";
import { useRoom } from "@/context/RoomContext";
import { IChatRoom, ReturnMsgDto } from "@/type/RoomType";
import { useUser } from "@/context/UserContext";

const FriendGameButton = ({ prop }: { prop: IFriend }) => {
  const router = useRouter();
  const { authState } = useAuth();
  const { openModal, closeModal } = useModalContext();
  const { gameDispatch } = useGame();
  const { roomState, roomDispatch } = useRoom();
  const { userState } = useUser();

  const handleOpenModal = () => {
    if (!authState.chatSocket) return;
    authState.chatSocket.emit(
      "BR_set_status_ongame",
      {
        userNickname: userState.nickname,
      },
      (res: ReturnMsgDto) => {
        // console.log("GameStartButton : ", res);
      }
    );
    authState.chatSocket.emit(
      "chat_invite_ask",
      {
        myUserIdx: parseInt(secureLocalStorage.getItem("idx") as string),
        targetUserIdx: prop.friendIdx,
      },
      (res: ReturnMsgDto) => {
        // console.log("handleOpenModal : ", res);
        if (res.code == 200) {
          openModal({
            children: <WaitAccept nickname={prop.friendNickname} />,
          });
        } else if (res.code === 400) alert("상대방이 게임 중 입니다.");
      }
    );
  };

  useEffect(() => {
    if (!authState.chatSocket) return;
    const askInvite = () => {
      handleOpenModal();
    };
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
      answer: boolean;
    }) => {
      // console.log("receive invite", answer);
      if (answer === false) {
        if (!authState.chatSocket) return;
        authState.chatSocket.emit(
          "BR_set_status_online",
          {
            userNickname: userState.nickname,
          },
          (ret: ReturnMsgDto) => {}
        );
        closeModal();
      } else if (answer === true) {
        gameDispatch({ type: "SET_GAME_MODE", value: GameType.FRIEND });
        const target = { nick: targetUserNickname, id: targetUserIdx };
        // console.log("target", target);
        gameDispatch({ type: "B_PLAYER", value: target });
        if (roomState.currentRoom) {
          authState.chatSocket?.emit(
            "chat_goto_lobby",
            {
              channelIdx: roomState.currentRoom!.channelIdx,
              userIdx: parseInt(secureLocalStorage.getItem("idx") as string),
            },
            (res: ReturnMsgDto) => {
              if (res.code === 200) {
                roomDispatch({ type: "SET_IS_OPEN", value: false });
                roomDispatch({ type: "SET_CUR_ROOM", value: null });
              } else {
                // console.log("FriendGoToLobby : ", res.msg);
              }
            }
          );
        }
        closeModal();
        router.replace("./optionselect");
      }
    };

    const FriendGoToLobby = (payload: IChatRoom[]) => {
      // console.log("FriendGoToLobby : ", payload);
      roomDispatch({ type: "SET_NON_DM_ROOMS", value: payload });
    };

    authState.chatSocket.on("chat_goto_lobby", FriendGoToLobby);
    authState.chatSocket.on("chat_receive_answer", recieveInvite);
    authState.chatSocket.on("chat_invite_ask", askInvite);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("chat_goto_lobby", FriendGoToLobby);
      authState.chatSocket.off("chat_receive_answer");
      authState.chatSocket.off("chat_invite_ask");
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
