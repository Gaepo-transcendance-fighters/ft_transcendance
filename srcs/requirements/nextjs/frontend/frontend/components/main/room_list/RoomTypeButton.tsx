"use client";

import { useEffect, useState } from "react";
import Rooms from "./Rooms";
import { useRoom } from "@/context/RoomContext";
import { useUser } from "@/context/UserContext";
import { IChatRoom, ReturnMsgDto, alert } from "@/type/RoomType";
import { Alert } from "@mui/material";
import { useAuth } from "@/context/AuthContext";

export default function RoomTypeButton() {
  const { roomState, roomDispatch } = useRoom();
  const [disabled, setDisabled] = useState(true);
  const { userState } = useUser();
  const { authState } = useAuth();

  useEffect(() => {
    if (!authState.chatSocket) return;
    const ChatGetDmRoomList = (payload?: IChatRoom[]) => {
      payload ? roomDispatch({ type: "SET_DM_ROOMS", value: payload }) : null;
    };
    authState.chatSocket.on("chat_get_DMList", ChatGetDmRoomList);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("chat_get_DMList", ChatGetDmRoomList);
    };
  }, []);

  const OnClick = (isNotDm: boolean) => {
    setDisabled(isNotDm);
  };

  useEffect(() => {
    if (!authState.chatSocket) return;
    const ChatGetRoomList = (payload?: IChatRoom[]) => {
      payload
        ? roomDispatch({ type: "SET_NON_DM_ROOMS", value: payload })
        : null;
    };
    authState.chatSocket.on("chat_get_roomList", ChatGetRoomList);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("chat_get_roomList", ChatGetRoomList);
    };
  }, []);

  const NonDmBtnClick = () => {
    if (!authState.chatSocket) return;
    authState.chatSocket.emit("chat_get_roomList", (ret: ReturnMsgDto) => {});
    OnClick(true);
  };

  const DmBtnClick = () => {
    if (!authState.chatSocket) return;
    authState.chatSocket.emit(
      "chat_get_DMList",
      {
        userNickname: userState.nickname,
        userIdx: userState.userIdx,
      },
      (ret: ReturnMsgDto) => {}
    );
    OnClick(false);
  };

  useEffect(() => {
    if (roomState.hasNewDmRoomAlert === true) {
      const time = setTimeout(() => {
        roomDispatch({ type: "SET_NEW_DM_ROOM_ALERT", value: false });
      }, 3000);

      return () => clearTimeout(time);
    }
  }, [roomState.hasNewDmRoomAlert]);

  return (
    <>
      <div>
        <button
          className="notdm typebutton"
          onClick={NonDmBtnClick}
          disabled={disabled}
        >
          Public / Protected
        </button>
        <button
          className="dm typebutton"
          onClick={DmBtnClick}
          disabled={!disabled}
        >
          DM
        </button>
      </div>
      <Rooms
        currentRoomList={disabled ? roomState.nonDmRooms : roomState.dmRooms}
        channelType={disabled}
      />
      {roomState.hasNewDmRoomAlert === true ? (
        <Alert sx={alert} severity="info" style={{ width: "333px" }}>
          You have new Direct Message Channel!
        </Alert>
      ) : null}
    </>
  );
}
