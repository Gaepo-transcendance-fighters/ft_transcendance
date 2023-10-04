"use client";

import Modal from "@mui/material/Modal";
import {
  ChangeEvent,
  MouseEvent,
  Dispatch,
  SetStateAction,
  KeyboardEvent,
  useRef,
} from "react";
import "./ProtectedModal.css";
import { Box, Typography } from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { useRoom } from "@/context/RoomContext";
import { IChatRoom, ReturnMsgDto } from "@/type/RoomType";
import { Socket } from "socket.io-client";
import { RoomContextData, RoomAction } from "@/context/RoomContext";
import { UserContextData } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";

const box = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "333px",
  height: "200px",
  bgcolor: "rgb(25, 200, 255)",
  border: 0,
  borderRadius: "10px",
  color: "white",
};

const box2 = {
  width: "100",
  height: "136px",
  bgcolor: "rgb(18, 163, 255)",
  border: 0,
  borderRadius: "10px",
  color: "white",
  m: 4,
};

export default function ProtectedModal({
  open,
  handleClose,
  room,
  setFail,
  fail,
  RoomEnter,
}: {
  open: boolean;
  handleClose: () => void;
  room: IChatRoom;
  setFail: Dispatch<SetStateAction<boolean>>;
  fail: boolean;
  RoomEnter: (
    room: IChatRoom,
    roomState: RoomContextData,
    userState: UserContextData,
    roomDispatch: Dispatch<RoomAction>,
    chatSocket: Socket
  ) => void; // <==================== 삭제필요
}) {
  const { roomState, roomDispatch } = useRoom();
  const { authState } = useAuth();
  const pwRef = useRef("");

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    pwRef.current = e.target.value;
  };

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!authState.chatSocket) return;
    e.preventDefault();
    setFail(false);
    console.log("onClick authState : ", authState);
    authState.chatSocket.emit(
      "chat_enter",
      {
        userNickname: authState.userInfo.nickname,
        userIdx: authState.userInfo.id,
        channelIdx: room.channelIdx,
        password: pwRef.current,
      },
      (ret: ReturnMsgDto) => {
        if (ret.code === 200) {
          RoomEnter(
            room,
            roomState,
            {
              imgUri: authState.userInfo.imgUrl,
              nickname: authState.userInfo.nickname,
              userIdx: authState.userInfo.id,
            },
            roomDispatch,
            authState.chatSocket!
          );
          handleClose();
          setFail(false);
        } else {
          setFail(true);
        }
      }
    );
    pwRef.current = "";
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!authState.chatSocket) return;
    if (e.code === "Enter") {
      setFail(false);
    console.log("onClick authState : ", authState);
    authState.chatSocket.emit(
        "chat_enter",
        {
          userNickname: authState.userInfo.nickname,
          userIdx: authState.userInfo.id,
          channelIdx: room.channelIdx,
          password: pwRef.current,
        },
        (ret: ReturnMsgDto) => {
          if (ret.code === 200) {
            // RoomEnter(room);
            RoomEnter(
              room,
              roomState,
              {
                imgUri: authState.userInfo.imgUrl,
                nickname: authState.userInfo.nickname,
                userIdx: authState.userInfo.id,
              },
              roomDispatch,
              authState.chatSocket!
            );
            handleClose();
            setFail(false);
          } else {
            setFail(true);
          }
        }
      );
      pwRef.current = "";
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="protected-room-modal"
      aria-describedby="enter-password-modal"
    >
      <Box sx={box}>
        <button className="prxbutton" onClick={handleClose}>
          X
        </button>
        <Box sx={box2}>
          <div className="prlock">
            <LockRoundedIcon
              sx={{ height: "100%", width: "100%", color: "#6c899b" }}
            />
          </div>
          <Box className="prboxcontainer">
            <input
              className="prinput"
              type="password"
              placeholder="password"
              onChange={onChange}
              autoFocus={true}
              onKeyDown={onKeyDown}
            ></input>
            <button className="prsubmitbutton" onClick={onClick}>
              submit
            </button>
          </Box>
          <div className="prfailmsg">
            {!fail ? null : (
              <Typography sx={{ fontSize: "16px" }}>
                Please check your password
              </Typography>
            )}
          </div>
        </Box>
      </Box>
    </Modal>
  );
}
