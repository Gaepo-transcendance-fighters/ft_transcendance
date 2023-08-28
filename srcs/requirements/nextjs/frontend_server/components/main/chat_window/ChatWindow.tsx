"use client";

import BottomField from "./BottomField/BottomField";
import ChatField from "./ChatField/ChatField";
import RoomTitleField from "./RoomTitleField/RoomTitleField";
import LobbyWindow from "./LobbyWindow";
import { Box } from "@mui/material";
import { useRoom } from "@/context/RoomContext";
import { useEffect, useState } from "react";

interface IChat {
  channelIdx: number;
  senderIdx: number;
  msg: string;
  msgDate: Date;
}

const ChatWindow = () => {
  const { roomState, roomDispatch } = useRoom();
  const [msgs, setMsgs] = useState<IChat[]>([]);

  useEffect(() => {
    setMsgs([]);
  }, [roomState.currentRoom])

  return (
    <Box sx={{ margin: "0", padding: "0", height: "60vh", minWidth: "300px" }}>
      {roomState.isOpen ? (
        <>
          <RoomTitleField setMsgs={setMsgs} />
          <ChatField msgs={msgs} />
          <BottomField setMsgs={setMsgs} />
        </>
      ) : (
        <LobbyWindow />
      )}
    </Box>
  );
};

export default ChatWindow;
