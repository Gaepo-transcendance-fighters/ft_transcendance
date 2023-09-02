"use client";

import { useEffect, useState } from "react";
import Rooms from "./Rooms";
import { useRoom } from "@/context/RoomContext";
import { socket } from "@/app/page";
import { useUser } from "@/context/UserContext";
import { IChatRoom, ReturnMsgDto, alert } from "@/type/RoomType";
import { Alert } from "@mui/material";

export default function RoomTypeButton() {
  const { roomState, roomDispatch } = useRoom();
  const [disabled, setDisabled] = useState(true);
  const { userState } = useUser();

  useEffect(() => {
    const ChatGetDmRoomList = (payload?: IChatRoom[]) => {
      payload ? roomDispatch({ type: "SET_DM_ROOMS", value: payload }) : null;
    };
    socket.on("chat_get_DMList", ChatGetDmRoomList);

    return () => {
      socket.off("chat_get_DMList", ChatGetDmRoomList);
    };
  }, []);

  const OnClick = (isNotDm: boolean) => {
    setDisabled(isNotDm);
  };

  useEffect(() => {
    const ChatGetRoomList = (payload?: IChatRoom[]) => {
      payload
        ? roomDispatch({ type: "SET_NON_DM_ROOMS", value: payload })
        : null;
    };
    socket.on("chat_get_roomList", ChatGetRoomList);

    return () => {
      socket.off("chat_get_roomList", ChatGetRoomList);
    };
  }, []);

  const NonDmBtnClick = () => {
    socket.emit("chat_get_roomList", (ret: ReturnMsgDto) => {});
    OnClick(true);
  };

  const DmBtnClick = () => {
    socket.emit(
      "chat_get_DMList",
      {
        userNickname: userState.nickname,
        userIdx: userState.userIdx,
      },
      (ret: ReturnMsgDto) => {
        console.log(ret);
      }
    );
    OnClick(false);
  };

  useEffect(() => {
    if (roomState.hasNewDmRoomAlert === true) {
      const time = setTimeout(() => {
        roomDispatch({ type:"SET_NEW_DM_ROOM_ALERT", value: false})
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
