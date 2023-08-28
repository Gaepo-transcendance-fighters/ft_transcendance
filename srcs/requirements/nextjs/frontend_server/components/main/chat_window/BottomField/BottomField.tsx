"use client";

import { Box, Button } from "@mui/material";
import { useState, useCallback, useEffect, useRef } from "react";
import FormControl, { useFormControl } from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import { io } from "socket.io-client";
import { socket } from "@/app/page";
import { Dispatch } from "react";
import { SetStateAction } from "react";
import { useRoom } from "@/context/RoomContext";
import { useAuth } from "@/context/AuthContext";

const userId = 7;
interface IChat {
  channelIdx: number;
  senderIdx: number;
  msg: string;
  msgDate: Date;
}
interface Props {
  setMsgs: Dispatch<SetStateAction<IChat[]>>;
}
// setMsgs: Dispatch<SetStateAction<IChat[]>>
const BottomField = ({ setMsgs }: Props) => {
  const [msg, setMsg] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { roomState } = useRoom();

  const changeMsg = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(event.target.value);
  };

  useEffect(() => {
    const messageHandler = (chat: IChat) => {
      console.log("chat", chat);
      setMsgs((prevChats: any) => [...prevChats, chat]);
      setMsg("");
    };
    socket.on("chat_send_msg", messageHandler);

    return () => {
      socket.off("chat_send_msg", messageHandler);
    };
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  });

  const onSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const payload = {
        channelIdx: roomState.currentRoom?.channelIdx,
        senderIdx: 98364,
        msg: msg,
      };
      console.log("payload", payload);
      socket.emit("chat_send_msg", JSON.stringify(payload));
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
          // type="submit"
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
