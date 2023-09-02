"use client";

import { Box, Button } from "@mui/material";
import { useState, useCallback, useEffect, useRef } from "react";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import { socket } from "@/app/page";
import { Dispatch } from "react";
import { SetStateAction } from "react";
import { useRoom } from "@/context/RoomContext";
import { IChat } from "@/type/type";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
interface IPayload {
  channelIdx: number | undefined;
  senderIdx: number;
  msg: string;
  targetIdx?: number | null;
}

interface Props {
  setMsgs: Dispatch<SetStateAction<IChat[]>>;
}
const BottomField = ({ setMsgs }: Props) => {
  const [msg, setMsg] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { roomState } = useRoom();
  const { userState } = useUser();
  const { authState } = useAuth();

  const changeMsg = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(event.target.value);
  };

  useEffect(() => {
    const messageHandler = (chatFromServer: IChat) => {
      let result;
      if (roomState.currentRoom?.mode === "private") {
        if (
          roomState.currentDmRoomMemberList?.userIdx1 ===
          chatFromServer.senderIdx
        ) {
          result = roomState.currentDmRoomMemberList?.userNickname1;
        } else if (
          roomState.currentDmRoomMemberList?.userIdx2 ===
          chatFromServer.senderIdx
        ) {
          result = roomState.currentDmRoomMemberList?.userNickname2;
        } else return;
        const chat = {
          channelIdx: chatFromServer.channelIdx,
          senderIdx:
            chatFromServer.sender ===
            roomState.currentDmRoomMemberList?.userIdx1
              ? roomState.currentDmRoomMemberList?.userIdx1
              : roomState.currentDmRoomMemberList?.userIdx2,
          sender: result,
          msg: chatFromServer.msg,
          msgDate: chatFromServer.msgDate,
        };
        setMsgs((prevChats: IChat[]) => [chat, ...prevChats]);
        console.log(chat);
      } else {
        result = roomState.currentRoomMemberList.find(
          (person) => person.userIdx === chatFromServer.senderIdx
        );
        if (result?.nickname) {
          const chat = {
            channelIdx: chatFromServer.channelIdx,
            senderIdx: chatFromServer.senderIdx,
            sender: result?.nickname,
            msg: chatFromServer.msg,
            msgDate: chatFromServer.msgDate,
          };
          setMsgs((prevChats: IChat[]) => [chat, ...prevChats]);
        } else {
          console.log("[ERROR] there aren't nickname from data");
        }
      }
    };
    socket.on("chat_send_msg", messageHandler);
    
    return () => {
      socket.off("chat_send_msg", messageHandler);
    };
  }, [roomState.currentRoomMemberList, roomState.currentDmRoomMemberList]);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const onSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      let payload: IPayload | undefined = undefined;
      if (
        roomState.currentRoom?.mode === "private" &&
        roomState.currentDmRoomMemberList?.userIdx1 &&
        roomState.currentDmRoomMemberList?.userIdx2
        ) {
          payload = {
            channelIdx: roomState.currentRoom?.channelIdx,
            senderIdx: userState.userIdx,
            msg: msg,
            targetIdx:
            userState.userIdx === roomState.currentDmRoomMemberList?.userIdx1
            ? roomState.currentDmRoomMemberList?.userIdx2
            : roomState.currentDmRoomMemberList?.userIdx1,
          };
        } else if (
          roomState.currentRoom?.mode === "public" ||
          roomState.currentRoom?.mode === "protected"
          ) {
            payload = {
              channelIdx: roomState.currentRoom?.channelIdx,
              senderIdx: userState.userIdx,
              msg: msg,
        };
      }
      socket.emit("chat_send_msg", payload);
      setMsg("");
      inputRef.current?.focus();
    },
    [msg]
  );

  return (
    <Box
      sx={{
        marginBottom: 0,
        backgroundColor: "#4174D3",
        display: "flex",
        justifyContent: "center",
        margin: "0.5% 2% 2% 2%",
        borderRadius: "10px",
        minWidth: "260px",
      }}
    >
      <Box sx={{ display: "flex" }}>
        <Box component="form" noValidate autoComplete="off" onSubmit={onSubmit}>
          <FormControl>
            <OutlinedInput
              style={{
                backgroundColor: "#1e4ca9",
                height: "5%",
                width: "45vw",
                margin: "8px",
                color: "white",
                marginTop: "3%",
              }}
              autoFocus
              ref={inputRef}
              value={msg}
              onChange={changeMsg}
              placeholder="Please enter message"
              inputProps={{
                style: {
                  height: "10px",
                },
              }}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  onSubmit(event);
                }
              }}
            />
          </FormControl>
        </Box>
        <Button
          style={{
            width: "8.5vw",
            justifyContent: "center",
            alignItems: "center",
            verticalAlign: "middle",
            margin: "2.5% 0 2.5% 0",
          }}
          variant="contained"
          onClick={onSubmit}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default BottomField;
