"use client";

import { useEffect, useState, useRef } from "react";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ProtectedModal from "./ProtectedModal";
import { useRoom } from "@/context/RoomContext";
import {
  IChatRoom,
  Mode,
  IChatDmEnter,
  IChatEnter,
  IChatEnterNoti,
  alert,
  lock,
  clickedLock,
  IMember,
  ILeftMember,
  ReturnMsgDto,
} from "@/type/RoomType";
import Alert from "@mui/material/Alert";
import { useUser } from "@/context/UserContext";
import { useInitMsg } from "@/context/InitMsgContext";
import RoomEnter from "@/external_functions/RoomEnter";
import { useAuth } from "@/context/AuthContext";

export default function Room({ room, idx }: { room: IChatRoom; idx: number }) {
  const [open, setOpen] = useState(false);
  const [fail, setFail] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [showAlertBan, setShowAlertBan] = useState<boolean>(false);
  const [newMem, setNewMem] = useState("");
  const { roomState, roomDispatch } = useRoom();
  const { userState } = useUser();
  const { authState } = useAuth();
  const { initMsgDispatch } = useInitMsg();

  useEffect(() => {
    if (!authState.chatSocket) return;
    const ChatExitRoom = ({
      leftMember,
      owner,
    }: {
      leftMember: ILeftMember[];
      owner: string;
    }) => {
      if (!authState.chatSocket) return;
      if (!leftMember) {
        roomDispatch({ type: "SET_CUR_ROOM", value: null });
        roomDispatch({ type: "SET_IS_OPEN", value: false });
        // window.alert("너 킥 당함"); // TODO : 서버에서 다섯번 보냄? 왜?
        return;
      }
      const list: IMember[] = leftMember.map((mem: ILeftMember) => {
        return {
          nickname: mem.userNickname,
          userIdx: mem.userIdx,
          imgUri: mem.imgUri,
        };
      });
      const newRoom: IChatRoom = {
        owner: owner,
        channelIdx: roomState.currentRoom!.channelIdx,
        mode: roomState.currentRoom!.mode,
      };
      roomDispatch({ type: "SET_CUR_MEM", value: list });
      roomDispatch({ type: "SET_CUR_ROOM", value: newRoom });
      // room.owner = owner;
    };
    authState.chatSocket.on("chat_room_exit", ChatExitRoom);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("chat_room_exit", ChatExitRoom);
    };
  }, [roomState.currentRoom]);

  useEffect(() => {
    if (!authState.chatSocket) return;
    const ChatEnterNoti = (data: IChatEnterNoti) => {
      setShowAlert(true);
      setNewMem(data.newMember);
      roomDispatch({ type: "SET_CUR_MEM", value: data.member });
      roomDispatch({ type: "SET_ADMIN_ARY", value: data.admin });
    };
    authState.chatSocket.on("chat_enter_noti", ChatEnterNoti);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("chat_enter_noti", ChatEnterNoti);
    };
  }, []);

  useEffect(() => {
    if (showAlert) {
      const time = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      return () => clearTimeout(time);
    }
  }, [showAlert]);

  useEffect(() => {
    if (showAlertBan) {
      const time = setTimeout(() => {
        setShowAlertBan(false);
      }, 3000);

      return () => clearTimeout(time);
    }
  }, [showAlertBan]);

  const leftPadding = (idx: number) => {
    if (idx < 10) return "00" + idx.toString();
    else if (idx < 100) return "0" + idx.toString();
    else return idx;
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFail(false);
    roomState.currentRoom
      ? roomDispatch({ type: "SET_IS_OPEN", value: true })
      : null;
  };

  useEffect(() => {
    if (!authState.chatSocket) return;
    const ChatEnter = (payload: IChatEnter) => {
      roomDispatch({ type: "SET_CUR_MEM", value: payload.member });
      roomDispatch({ type: "SET_ADMIN_ARY", value: payload.admin });
    };
    authState.chatSocket.on("chat_enter", ChatEnter);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("chat_enter", ChatEnter);
    };
  }, []);

  useEffect(() => {
    if (!authState.chatSocket) return;
    const ChatDmEnter = (payload: IChatDmEnter) => {
      roomDispatch({
        type: "SET_CUR_DM_MEM",
        value: {
          userIdx1: payload.userIdx1,
          userIdx2: payload.userIdx2,
          userNickname1: payload.userNickname1,
          userNickname2: payload.userNickname2,
          // channelIdx: payload.channelIdx,
          imgUri: payload.imgUri,
        },
      });
      initMsgDispatch({ type: "SET_INIT_MSG", value: payload });
    };
    authState.chatSocket.on("chat_get_DM", ChatDmEnter);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("chat_get_DM", ChatDmEnter);
    };
  }, []);

  useEffect(() => {
    if (!authState.chatSocket) return;
    const NoMember = (payload: IChatRoom[]) => {
      roomDispatch({ type: "SET_NON_DM_ROOMS", value: payload });
    };
    authState.chatSocket.on("BR_chat_room_delete", NoMember);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("BR_chat_room_delete", NoMember);
    };
  }, []);

  useEffect(() => {
    if (!authState.chatSocket) return;
    const GoToLobby = (payload: IChatRoom[]) => {
      roomDispatch({ type: "SET_NON_DM_ROOMS", value: payload });
    };
    authState.chatSocket.on("chat_goto_lobby", GoToLobby);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("chat_goto_lobby", GoToLobby);
    };
  }, []);

  const RoomClick = (room: IChatRoom) => {
    if (!authState.chatSocket) return;
    if (roomState.currentRoom?.channelIdx !== room.channelIdx) {
      if (room.mode === Mode.PROTECTED) handleOpen();
      else if (room.mode === Mode.PRIVATE) {
        authState.chatSocket.emit(
          "chat_get_DM",
          {
            channelIdx: room.channelIdx,
          },
          (ret: ReturnMsgDto) => {
            if (ret.code === 200) {
              RoomEnter(
                room,
                roomState,
                userState,
                roomDispatch,
                authState.chatSocket!
              );
            }
          }
        );
      } else {
        authState.chatSocket.emit(
          "chat_enter",
          {
            userNickname: userState.nickname,
            userIdx: userState.userIdx,
            channelIdx: room.channelIdx,
          },
          (ret: ReturnMsgDto) => {
            if (ret.code === 200) {
              RoomEnter(
                room,
                roomState,
                userState,
                roomDispatch,
                authState.chatSocket!
              );
            } else if (ret.code === 201) {
              // Banned user
              setShowAlertBan(true);
            }
          }
        );
      }
    }
  };

  return (
    <>
      <button
        key={idx}
        className={
          roomState.currentRoom?.channelIdx === room.channelIdx
            ? "clickeditem"
            : "item"
        }
        onClick={() => RoomClick(room)}
      >
        <div
          className={
            roomState.currentRoom?.channelIdx === room.channelIdx
              ? "clickedroomidx"
              : "roomidx"
          }
        >
          {leftPadding(room.channelIdx)}
        </div>
        <div className="owner">
          {room.owner ? "GF CHANNEL" : `${room.targetNickname}'s`}
          {/* {room.owner ? room.owner : room.targetNickname}'s */}
        </div>
        <div className="lock">
          {room.mode === Mode.PROTECTED ? (
            <LockRoundedIcon
              sx={
                roomState.currentRoom?.channelIdx === room.channelIdx
                  ? clickedLock
                  : lock
              }
            />
          ) : (
            ""
          )}
        </div>
      </button>
      <ProtectedModal
        open={open}
        handleClose={handleClose}
        room={room}
        fail={fail}
        setFail={setFail}
        RoomEnter={RoomEnter}
      />
      {showAlert ? (
        <Alert sx={alert} severity="info" style={{ width: "333px" }}>
          {newMem} has joined
        </Alert>
      ) : null}
      {showAlertBan ? (
        <Alert sx={alert} severity="info" style={{ width: "333px" }}>
          You are banned from the channel!!
        </Alert>
      ) : null}
    </>
  );
}
