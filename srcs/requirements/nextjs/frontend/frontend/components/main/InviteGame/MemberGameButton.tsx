"use client";

import { Button } from "@mui/material";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import WaitAccept from "./WaitAccept";
import { IChatRoom, IMember, ReturnMsgDto } from "@/type/RoomType";
import { useAuth } from "@/context/AuthContext";
import { useModalContext } from "@/context/ModalContext";
import { useGame } from "@/context/GameContext";
import { GameType } from "@/type/type";
import secureLocalStorage from "react-secure-storage";
import { useRoom } from "@/context/RoomContext";
import { useUser } from "@/context/UserContext";

const MemberGameButton = ({ prop }: { prop: IMember }) => {
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
        // console.log("MemberGameButton : ", res);
      }
    );
    authState.chatSocket.emit(
      "chat_invite_ask",
      {
        myUserIdx: parseInt(secureLocalStorage.getItem("idx") as string),
        targetUserIdx: prop.userIdx,
      },
      (res: ReturnMsgDto) => {
        if (res.code === 200) {
          openModal({
            children: <WaitAccept nickname={prop.nickname} />,
          });
        } else if (res.msg === "Bad Request, target user is offline") {
          // TODO : 알맞은 메시지 띄우기
          alert("상대방이 오프라인입니다.");
          closeModal();
        } else if (res.code === 400) {
          alert("상대방이 게임 중입니다.");
          closeModal();
        }
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
      if (answer === false) {
        closeModal();
      } else if (answer === true) {
        gameDispatch({ type: "SET_GAME_MODE", value: GameType.FRIEND });
        const target = { nick: targetUserNickname, id: targetUserIdx };
        gameDispatch({ type: "B_PLAYER", value: target });
        authState.chatSocket?.emit(
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
              // console.log("HomeGoToLobby : ", ret.msg);
            }
          }
        );
        closeModal();
        router.replace("./optionselect");
      }
    };

    const MemGoToLobby = (payload: IChatRoom[]) => {
      // console.log("MemGoToLobby : ", payload);
      roomDispatch({ type: "SET_NON_DM_ROOMS", value: payload });
    };
    authState.chatSocket.on("chat_goto_lobby", MemGoToLobby);
    authState.chatSocket.on("chat_receive_answer", recieveInvite);
    authState.chatSocket.on("chat_invite_ask", askInvite);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("chat_goto_lobby", MemGoToLobby);
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

export default MemberGameButton;
