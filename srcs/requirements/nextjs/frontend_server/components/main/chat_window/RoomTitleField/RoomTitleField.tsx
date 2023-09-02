"use client";

import Stack from "./RoomNameStack";
import Typography from "@mui/material/Typography";
import VpnKeyTwoToneIcon from "@mui/icons-material/VpnKeyTwoTone";
import "./RoomTitleField.css";
import { IconButton, Button } from "@mui/material";
import SettingIconButton from "./SettingIconButton";
import { useEffect, useState } from "react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { IChatRoom, ReturnMsgDto } from "@/type/RoomType";
import { useRoom } from "@/context/RoomContext";
import { Dispatch, SetStateAction } from "react";
import { socket } from "@/app/page";
import { useUser } from "@/context/UserContext";
import { IChat } from "@/type/type";

export enum Mode {
  PRIVATE = "private",
  PUBLIC = "public",
  PROTECTED = "protected",
}

const RoomTitleField = ({
  setMsgs,
  showAlert,
  setShowAlert,
}: {
  setMsgs: Dispatch<SetStateAction<IChat[]>>;
  showAlert: boolean;
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { roomState, roomDispatch } = useRoom();
  const { userState } = useUser();

  useEffect(() => {
    const leaveHandler = (channel: IChatRoom[]) => {
      console.log("leaveHandler roomState.isLobbyBtn", roomState.isLobbyBtn);
      if (roomState.currentRoom && roomState.isLobbyBtn) {
        roomDispatch({ type: "SET_IS_OPEN", value: false });
        roomDispatch({ type: "SET_CUR_ROOM", value: null });
        roomDispatch({ type: "SET_IS_LOBBY_BTN", value: false });
      } else
        console.log("[RoomTItleField] there isn't roomState.currentRoom case");
    };
    socket.on("chat_goto_lobby", leaveHandler);

    return () => {
      socket.off("chat_goto_lobby", leaveHandler);
    };
  }, [roomState.isLobbyBtn]);

  const leaveRoom = () => {
    if (roomState.currentRoom?.mode !== "private") {
      const payload = {
        channelIdx: roomState.currentRoom?.channelIdx,
        userIdx: userState.userIdx, // [작업필요] 추후 나의 userIdx로 교체필요
      };
      roomDispatch({ type: "SET_IS_LOBBY_BTN", value: true });
      socket.emit("chat_goto_lobby", payload, (ret: ReturnMsgDto) => {
        console.log("leaveRoom chat_goto_lobby ret : ", ret);
      });
    } else {
      roomDispatch({ type: "SET_CUR_ROOM", value: null });
      roomDispatch({ type: "SET_IS_OPEN", value: false });
    }
  };

  useEffect(() => {
    const changingPw = (res: IChatRoom[]) => {
      roomDispatch({ type: "SET_NON_DM_ROOMS", value: res });
    };

    socket.on("BR_chat_room_password", changingPw);
    return () => {
      socket.off("BR_chat_room_password", changingPw);
    }
  }, []);

  return (
    <div className="room_title_field">
      <div className="room_title_field_left">
        <Stack />
        <div className="room_name">
          {
            <Typography variant="h4">
              {roomState.currentRoom?.mode === "private"
                ? userState.nickname + "'s room"
                : roomState.currentRoom?.owner + "'s room"}
            </Typography>
          }
        </div>
      </div>
      <div className="room_title_field_right">
        <div className="room_type">
          {roomState.currentRoom?.mode === "protected" ? (
            <VpnKeyTwoToneIcon />
          ) : null}
        </div>
        <div className="room_setting">
          {roomState.currentRoom?.mode === "private" ? null : (
            <SettingIconButton
              showAlert={showAlert}
              setShowAlert={setShowAlert}
            />
          )}
        </div>
        <div className="room_exit">
          <Button variant="contained" size="small" onClick={leaveRoom}>
            lobby
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomTitleField;
