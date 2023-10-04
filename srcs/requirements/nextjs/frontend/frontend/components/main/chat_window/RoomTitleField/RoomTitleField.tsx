"use client";

import Stack from "./RoomNameStack";
import Typography from "@mui/material/Typography";
import VpnKeyTwoToneIcon from "@mui/icons-material/VpnKeyTwoTone";
import "./RoomTitleField.css";
import { Button } from "@mui/material";
import SettingIconButton from "./SettingIconButton";
import { useEffect, useState } from "react";
import { IChatRoom, ReturnMsgDto } from "@/type/RoomType";
import { useRoom } from "@/context/RoomContext";
import { Dispatch, SetStateAction } from "react";
import { useUser } from "@/context/UserContext";
import { IChat } from "@/type/type";
import { useAuth } from "@/context/AuthContext";

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
  const { authState } = useAuth();

  useEffect(() => {
    if (!authState.chatSocket) return;
    const leaveHandler = (channel: IChatRoom[]) => {
      if (roomState.currentRoom && roomState.isLobbyBtn) {
        roomDispatch({ type: "SET_IS_OPEN", value: false });
        roomDispatch({ type: "SET_CUR_ROOM", value: null });
        roomDispatch({ type: "SET_IS_LOBBY_BTN", value: false });
        roomDispatch({ type: "SET_NON_DM_ROOMS", value: channel });
      } else if (roomState.currentRoom && !roomState.isLobbyBtn) {
        roomDispatch({ type: "SET_IS_OPEN", value: false });
        roomDispatch({ type: "SET_CUR_ROOM", value: null });
        roomDispatch({ type: "SET_NON_DM_ROOMS", value: channel });
      } else {
        console.log("[RoomTItleField] there isn't roomState.currentRoom case");
      }
    };
    authState.chatSocket.on("chat_goto_lobby", leaveHandler);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("chat_goto_lobby", leaveHandler);
    };
  }, [roomState.isLobbyBtn]);

  const leaveRoom = () => {
    if (!authState.chatSocket) return;
    if (roomState.currentRoom?.mode !== "private") {
      const payload = {
        channelIdx: roomState.currentRoom?.channelIdx,
        userIdx: userState.userIdx, // [작업필요] 추후 나의 userIdx로 교체필요
      };
      roomDispatch({ type: "SET_IS_LOBBY_BTN", value: true });
      authState.chatSocket.emit(
        "chat_goto_lobby",
        payload,
        (ret: ReturnMsgDto) => {
        }
      );
    } else {
      roomDispatch({ type: "SET_CUR_ROOM", value: null });
      roomDispatch({ type: "SET_IS_OPEN", value: false });
    }
  };

  useEffect(() => {
    if (!authState.chatSocket) return;
    const changingPw = (res: IChatRoom[]) => {
      roomDispatch({ type: "SET_NON_DM_ROOMS", value: res });
    };

    authState.chatSocket.on("BR_chat_room_password", changingPw);
    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("BR_chat_room_password", changingPw);
    };
  }, []);

  return (
    <div className="room_title_field">
      <div className="room_title_field_left">
        <Stack />
        <div className="room_name">
          {
            <Typography variant="h4">
              {roomState.currentRoom?.mode === "private"
                ? roomState.currentRoom.targetNickname + "'s room"
                : "GF CHANNEL"}
              {/* {roomState.currentRoom?.mode === "private"
                ? roomState.currentRoom.targetNickname + "'s room"
                : roomState.currentRoom?.owner + "'s room"} */}
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
