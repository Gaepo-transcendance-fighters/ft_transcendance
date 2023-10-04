// RoomEnter.ts

import { IChatRoom, ReturnMsgDto } from "@/type/RoomType";
import { Socket } from "socket.io-client";
import { Mode } from "@/type/RoomType";
import { RoomContextData, RoomAction } from "@/context/RoomContext";
import { UserContextData } from "@/context/UserContext";
import { Dispatch } from "react";
import { useAuth } from "@/context/AuthContext";
import secureLocalStorage from "react-secure-storage";

const RoomEnter = (
  room: IChatRoom,
  roomState: RoomContextData,
  userState: UserContextData,
  roomDispatch: Dispatch<RoomAction>,
  chatSocket: Socket
) => {
  if (!chatSocket) return;
  if (roomState.currentRoom && roomState.currentRoom.mode !== Mode.PRIVATE) {
    chatSocket.emit(
      "chat_goto_lobby",
      {
        channelIdx: roomState.currentRoom.channelIdx,
        userIdx: parseInt(secureLocalStorage.getItem("idx") as string),
      },
      (ret: ReturnMsgDto) => {
        if (ret.code == 200) {
          roomDispatch({ type: "SET_CUR_ROOM", value: room });
          roomDispatch({ type: "SET_IS_OPEN", value: true });
          return;
        }
      }
    );
  }
  roomDispatch({ type: "SET_CUR_ROOM", value: room });
  roomDispatch({ type: "SET_IS_OPEN", value: true });
};

export default RoomEnter;
