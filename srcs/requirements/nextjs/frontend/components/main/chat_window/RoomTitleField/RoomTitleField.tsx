"use client";

import Stack from "./RoomNameStack";
import Typography from "@mui/material/Typography";
import VpnKeyTwoToneIcon from "@mui/icons-material/VpnKeyTwoTone";
import "./RoomTitleField.css";
import { IconButton } from "@mui/material";
import SettingIconButton from "./SettingIconButton";
import { useState } from "react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useRoom } from "@/context/RoomContext";
import { Dispatch, SetStateAction } from "react";

interface IChat {
  channelIdx: number;
  senderIdx: number;
  msg: string;
  msgDate: Date;
}
interface Props {
  setMsgs: Dispatch<SetStateAction<IChat[]>>;
}
export enum Mode {
  PRIVATE = "private",
  PUBLIC = "public",
  PROTECTED = "protected",
}

const RoomTitleField = ({ setMsgs }: Props) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { roomState, roomDispatch } = useRoom();

  const leaveRoom = () => {
    roomDispatch({ type: "SET_IS_OPEN", value: false });
    roomDispatch({ type: "SET_CUR_ROOM", value: null });
  };

  return (
    <div className="room_title_field">
      <div className="room_title_field_left">
        <Stack />
        <div className="room_name">
          {
            <Typography variant="h4">
              {roomState.currentRoom?.owner + "'s room"}
            </Typography>
          }
        </div>
      </div>
      <div className="room_title_field_right">
        <div className="room_type">
          {roomState.currentRoom?.mode === Mode.PRIVATE ? (
            <VpnKeyTwoToneIcon />
          ) : null}
        </div>
        <div className="room_setting">
          <SettingIconButton />
        </div>
        <div className="room_exit">
          <IconButton aria-label="leave room" onClick={leaveRoom}>
            <DeleteForeverIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default RoomTitleField;
