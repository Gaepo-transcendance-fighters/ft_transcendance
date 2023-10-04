"use client";

import { Box, Button } from "@mui/material";
import { useState, useCallback, useEffect, useRef } from "react";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
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
  const { roomState } = useRoom();
  const { userState } = useUser();
  const { authState } = useAuth();

  const changeMsg = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > 80) {
      alert("글자 수는 80자 이하로 보낼 수 있습니다.");
      return;
    }
    setMsg(event.target.value);
  };

  useEffect(() => {
    if (!authState.chatSocket) return;
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
          senderIdx: chatFromServer.senderIdx,
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
    authState.chatSocket.on("chat_send_msg", messageHandler);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("chat_send_msg", messageHandler);
    };
  }, [
    roomState.currentRoomMemberList,
    roomState.currentDmRoomMemberList,
    roomState.currentRoom,
  ]);

  const onSubmit = useCallback(
    (event: React.FormEvent) => {
      if (!authState.chatSocket) return;
      event.preventDefault();
      if (!authState.chatSocket) return;
      const e = event.nativeEvent as InputEvent;
      if (e.isComposing) return;
      let payload: IPayload | undefined = undefined;
      if (msg === "") {
        return;
      }
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

      authState.chatSocket.emit("chat_send_msg", payload);
      setMsg("");
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
              value={msg}
              onChange={changeMsg}
              placeholder="Please enter message"
              inputProps={{
                style: {
                  height: "10px",
                },
              }}
              onKeyDown={(e) => {
                if (e.code === "Enter") {
                  onSubmit(e);
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
