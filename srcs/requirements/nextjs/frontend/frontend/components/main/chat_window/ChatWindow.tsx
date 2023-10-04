"use client";

import BottomField from "./BottomField/BottomField";
import ChatField from "./ChatField/ChatField";
import RoomTitleField from "./RoomTitleField/RoomTitleField";
import LobbyWindow from "./LobbyWindow";
import { Box } from "@mui/material";
import { useRoom } from "@/context/RoomContext";
import { SetStateAction, useEffect, useState } from "react";
import { alert } from "@/type/RoomType";
import Alert from "@mui/material/Alert";
import { IChat } from "@/type/type";

const ChatWindow = () => {
  const { roomState } = useRoom();
  const [prevRoom, setPrevRoom] = useState<SetStateAction<number> | undefined>(undefined);
  const [msgs, setMsgs] = useState<IChat[]>([]);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  
  useEffect(() => {
    setPrevRoom(roomState.currentRoom?.channelIdx);
    if (prevRoom === roomState.currentRoom?.channelIdx || roomState.currentRoom?.mode === "private") return ;
    setMsgs([]);
  }, [roomState.currentRoom?.channelIdx, msgs]);

  return (
    <Box sx={{ margin: "0", padding: "0", height: "60vh", minWidth: "300px" }}>
      {roomState.isOpen ? (
        <>
          <RoomTitleField
            setMsgs={setMsgs}
            showAlert={showAlert}
            setShowAlert={setShowAlert}
          />
          <ChatField msgs={msgs} setMsgs={setMsgs} />
          <BottomField setMsgs={setMsgs} />
          {showAlert ? (
            <Alert sx={alert} severity="info" style={{ width: "333px" }}>
              You can't change the password
            </Alert>
          ) : null}
        </>
      ) : (
        <LobbyWindow />
      )}
    </Box>
  );
};

export default ChatWindow;
