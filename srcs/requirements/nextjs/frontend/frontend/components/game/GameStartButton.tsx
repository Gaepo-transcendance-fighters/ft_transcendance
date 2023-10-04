"use client";

import { Button } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRoom } from "@/context/RoomContext";
import { useAuth } from "@/context/AuthContext";
import secureLocalStorage from "react-secure-storage";
import { ReturnMsgDto } from "@/type/RoomType";
import { useUser } from "@/context/UserContext";
import { useEffect } from "react";
import { useFriend } from "@/context/FriendContext";
import { IOnGame } from "@/type/type";

const GameStartButton = () => {
  const router = useRouter();
  const { roomState, roomDispatch } = useRoom();
  const { authState } = useAuth();
  const { userState } = useUser();
  const { friendState, friendDispatch } = useFriend();

  useEffect(() => {
    const SetStatusOnGame = (payload: IOnGame) => {
      // console.log("SetStatusOnGame : ", payload);
    };

    authState.chatSocket?.on("BR_set_status_ongame", SetStatusOnGame);
  }, [friendState.friendList]);

  const onClick = () => {
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
    if (roomState.currentRoom?.channelIdx) {
      authState.chatSocket!.emit(
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
            // console.log("GameStartButton : ", ret.msg);
          }
        }
      );
    }
    router.push("./game");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "normal",
      }}
    >
      <Button
        onClick={onClick}
        variant="outlined"
        style={{
          padding: "40px 60px",
          borderRadius: "15px",
          border: "10px solid",
          backgroundColor: "white",
        }}
      >
        <Image
          src="/CrazyPong.png"
          alt="offline"
          width={250}
          height={150}
        ></Image>
      </Button>
    </div>
  );
};

export default GameStartButton;
