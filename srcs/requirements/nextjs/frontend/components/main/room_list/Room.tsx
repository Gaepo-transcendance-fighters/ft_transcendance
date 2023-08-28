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
} from "@/type/type";
import { socket } from "@/app/page";
import Alert from "@mui/material/Alert";
import { useUser } from "@/context/UserContext";
import { IMember } from "@/type/type";

export interface ILeftMember {
  userNickname: string, userIdx: number, imgUri: string
}

export default function Room({ room, idx }: { room: IChatRoom; idx: number }) {
  const [open, setOpen] = useState(false);
  const [fail, setFail] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [newMem, setNewMem] = useState("");
  const { roomState, roomDispatch } = useRoom();
  const { userState } = useUser();

    // userIdx: number | undefined;
    // nickname: string | undefined;
    // imgUri: string | undefined;
    // permission?: Permission | undefined;


  useEffect(() => {
    const ChatExitRoom = ({leftMember, owner}: {leftMember: ILeftMember[], owner: string}) => {
      console.log("room", room)
      console.log("owner", owner)
      if (!leftMember){
        roomDispatch({type: "SET_CUR_ROOM", value: null});
        roomDispatch({type: "SET_IS_OPEN", value: false})
        // window.alert("너 킥 당함"); // TODO : 서버에서 다섯번 보냄? 왜?
        return ;
      }
      const list: IMember[] = leftMember.map((mem: ILeftMember) => {
        return {
        nickname: mem.userNickname,
        userIdx: mem.userIdx,
        imgUri: mem.imgUri,
    }})
    const newRoom: IChatRoom = {
      owner: owner ? owner : room.owner,
      channelIdx: roomState.currentRoom!.channelIdx,
      mode: roomState.currentRoom!.mode,
    }
      roomDispatch({type: "SET_CUR_MEM", value: list})
      roomDispatch({type: "SET_CUR_ROOM", value: newRoom})
    };
    socket.on("chat_room_exit", ChatExitRoom);

    return () => {
      socket.off("chat_room_exit", ChatExitRoom);
    };
  }, [roomState.currentRoom]);

  useEffect(() => {
    const ChatEnterNoti = (data: IChatEnterNoti) => {
      // console.log("ChatEnterNoti ", data )
      setShowAlert(true);
      setNewMem(data.newMember);
      roomDispatch({type: "SET_CUR_MEM", value: data.member})
      roomDispatch({type: "SET_ADMIN_ARY", value: data.admin})
    };
    socket.on("chat_enter_noti", ChatEnterNoti);

    return () => {
      socket.off("chat_enter_noti", ChatEnterNoti);
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
    const ChatEnter = (payload: IChatEnter) => {
      roomDispatch({ type: "SET_CUR_MEM", value: payload.member });
      roomDispatch({ type: "SET_ADMIN_ARY", value: payload.admin });
      //channelIdx 안보내줘도 될듯?
    };
    socket.on("chat_enter", ChatEnter);

    return () => {
      socket.off("chat_enter", ChatEnter);
    };
  }, []);

  useEffect(() => {
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
    };
    socket.on("chat_get_DM", ChatDmEnter);

    return () => {
      socket.off("chat_get_DM", ChatDmEnter);
    };
  }, []);

  useEffect(() => {
    const NoMember = (payload: IChatRoom[]) => {
      roomDispatch({ type: "SET_NON_DM_ROOMS", value: payload });
    };
    socket.on("BR_chat_room_delete", NoMember);

    return () => {
      socket.off("BR_chat_room_delete", NoMember);
    };
  }, []);

  useEffect(() => {
    const GoToLobby = (payload: IChatRoom[]) => {
      console.log("GoToLobby ", payload);
      roomDispatch({ type: "SET_NON_DM_ROOMS", value: payload });
    };
    socket.on("chat_goto_lobby", GoToLobby);

    return () => {
      socket.off("chat_goto_lobby", GoToLobby);
    };
  }, []);

  const RoomEnter = (room: IChatRoom) => {
    if (roomState.currentRoom && roomState.currentRoom.mode !== Mode.PRIVATE) {
      socket.emit(
        "chat_goto_lobby",
        JSON.stringify({
          channelIdx: roomState.currentRoom.channelIdx,
          userIdx: userState.userIdx,
        }),
        (ret: number | string) => {
          console.log("chat_goto_lobby ret : ", ret);
        }
      );
    }
    roomDispatch({ type: "SET_CUR_ROOM", value: room });
    roomDispatch({ type: "SET_IS_OPEN", value: true });
  };

  const RoomClick = (room: IChatRoom) => {
    if (roomState.currentRoom?.channelIdx !== room.channelIdx) {
      // TODO : 누른 버튼 색 다르게 해보기
      if (room.mode === Mode.PROTECTED) handleOpen();
      else if (room.mode === Mode.PRIVATE) {
        socket.emit(
          "chat_get_DM",
          JSON.stringify({
            channelIdx: room.channelIdx,
          }),
          (ret: number) => {
            if (ret === 200) {
              RoomEnter(room);
            }
          }
        );
      } else {
        socket.emit(
          "chat_enter",
          JSON.stringify({
            userNickname: userState.nickname,
            userIdx: userState.userIdx,
            channelIdx: room.channelIdx,
          }),
          (ret: number) => {
            if (ret === 200) {
              RoomEnter(room);
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
          {room.owner ? room.owner : room.targetNickname}'s
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
    </>
  );
}
