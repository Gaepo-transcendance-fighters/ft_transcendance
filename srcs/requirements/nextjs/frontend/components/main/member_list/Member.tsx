"use client";

import Image from "next/image";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";
import "@/components/main/member_list/MemberList.css";
import { useState, MouseEvent, useEffect } from "react";
import MemberModal from "./MemberModal";
import { useRoom } from "@/context/RoomContext";
import {
  IChatKick,
  IChatMute,
  IChatRoomAdmin,
  IMember,
  Permission,
  alert,
} from "@/type/type";
import { Menu, MenuItem, Paper, makeStyles } from "@mui/material";
import { useUser } from "@/context/UserContext";
import Alert from "@mui/material/Alert";
import { socket } from "@/app/page";
import { ILeftMember } from "../room_list/Room";

export default function Member({
  idx,
  person,
}: {
  idx?: number;
  person: IMember;
}) {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [string, setString] = useState<string>("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  // const [isGranted, setIsGranted] = useState<boolean>(false);
  const { roomState, roomDispatch } = useRoom();
  const { userState } = useUser();
  const strings = [
    "now an administrator",
    "not an administrator anymore",
    "muted",
    "kicked",
    "banned",
  ];

  const handleOpenModal = () => {
    // setOpenModal(true);
    userState.nickname === person.nickname
      ? setOpenModal(false)
      : setOpenModal(true);
  };

  // useEffect(() => {
  //   const CheckGrant = (payload: Permission) => {
  //     payload === Permission.MEMBER ? setIsGranted(false) : setIsGranted(true);
  //   };
  //   socket.on("chat_get_grant", CheckGrant);

  //   return () => {
  //     socket.off("chat_get_grant", CheckGrant);
  //   };
  // }, []);

  const CheckOwner = (nickname: string) => {
    nickname === roomState.currentRoom?.owner
      ? setIsOwner(true)
      : setIsOwner(false);
  }; // TODO : isOwner 사용한다음엔 false로 설정하기

  useEffect(() => {
    if (roomState.currentRoom?.owner === userState.nickname) setIsOwner(true);
    roomState.adminAry.map((adminElement) => {
      return adminElement.nickname === userState.nickname
        ? setIsAdmin(true)
        : setIsAdmin(false);
    });
  }, [roomState.adminAry]);

  const handleOpenMenu = (
    e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>
  ) => {
    e.preventDefault();
    userState.nickname === roomState.currentRoom?.owner || isAdmin
      ? setAnchorEl(e.currentTarget)
      : null;
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (showAlert) {
      const time = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      return () => clearTimeout(time);
    }
  }, [showAlert]);

  useEffect(() => {
    const ChatRoomAdmin = (payload: IChatRoomAdmin) => {
      roomDispatch({ type: "SET_ADMIN_ARY", value: payload.admin });
    };
    socket.on("chat_room_admin", ChatRoomAdmin);

    return () => {
      socket.off("chat_room_admin", ChatRoomAdmin);
    };
  }, []);

  const SetAdmin = () => {
    socket.emit(
      "chat_room_admin",
      JSON.stringify({
        channelIdx: roomState.currentRoom?.channelIdx,
        userIdx: person.userIdx,
        grant: !isAuthorized,
      }),
      (ret: string | number) => {
        console.log("SetAdmin ret : ", ret);
        setIsAuthorized((prev) => !prev); //
        console.log("SetAdmin isAuthorized : ", isAuthorized);
        setShowAlert(true);
      }
    );
  };

  useEffect(() => {
    isAuthorized ? setString(strings[0]) : setString(strings[1]);
  }, [isAuthorized]);

  useEffect(() => {
    const ChatMute = (data: IChatMute) => {
      console.log("Mute : ", data);
      // console로 값 확인 후 아래
      // emit - roomId 채팅에 있던 사람들한테 알림 쏴주기
      // TODO : mute된 사람 전역? / useState
    };
    socket.on("chat_mute", ChatMute);

    return () => {
      socket.off("chat_mute", ChatMute);
    };
  });

  const Mute = () => {
    socket.emit(
      "chat_mute",
      JSON.stringify({
        channelIdx: roomState.currentRoom?.channelIdx,
        targetNickname: person.nickname,
        targetIdx: person.userIdx,
      })
    );
    setShowAlert(true);
    setString(strings[2]);
  };

  useEffect(() => {
    const ChatKick = (data: IChatKick) => {
      if (data.targetNickname === userState.nickname) {
        roomDispatch({ type: "SET_CUR_ROOM", value: null });
        return;
      }
      console.log("ChatKick ", data);
      const list: IMember[] = data.leftMember.map((mem: ILeftMember) => {
        return {
          nickname: mem.userNickname,
          userIdx: mem.userIdx,
          imgUri: mem.imgUri,
        };
      });
      roomDispatch({ type: "SET_CUR_MEM", value: list });
    };
    socket.on("chat_kick", ChatKick);

    return () => {
      socket.off("chat_kick", ChatKick);
    };
  }, []);

  const Kick = () => {
    socket.emit(
      "chat_kick",
      JSON.stringify({
        channelIdx: roomState.currentRoom?.channelIdx,
        targetNickname: person.nickname,
        targetIdx: person.userIdx,
      }),
      (ret: string | number) => {
        console.log("ret : ", ret);
        // if (ret === 200) {
        // setShowAlert(true);
        // setString(strings[3]);
      }
    );
  };

  useEffect(() => {
    const ChatBan = (data: IChatKick) => {
      if (data.targetNickname === userState.nickname) {
        roomDispatch({ type: "SET_CUR_ROOM", value: null });
        return;
      }
      console.log("ban", data);
      const list: IMember[] = data.leftMember.map((mem: ILeftMember) => {
        return {
          nickname: mem.userNickname,
          userIdx: mem.userIdx,
          imgUri: mem.imgUri,
        };
      });

      roomDispatch({ type: "SET_CUR_MEM", value: list });
    };
    socket.on("chat_ban", ChatBan);

    return () => {
      socket.off("chat_ban", ChatBan);
    };
  }, []);

  const Ban = () => {
    socket.emit(
      "chat_ban",
      JSON.stringify({
        channelIdx: roomState.currentRoom?.channelIdx,
        targetNickname: person.nickname,
        targetIdx: person.userIdx,
      }),
      (ret: string | number) => {
        console.log("Ban : ", ret);
        if (ret === 200) {
          setShowAlert(true);
          setString(strings[4]);
        }
      }
    );
  };

  return (
    <>
      <div
        key={idx}
        className="membtn"
        onClick={handleOpenModal}
        onContextMenu={(e) => {
          userState.nickname !== person.nickname &&
          person.nickname !== roomState.currentRoom!.owner
            ? handleOpenMenu(e)
            : e.preventDefault();
        }}
      >
        <div className="memimg">
          <Image src="/seal.png" alt="profile" width={53} height={53} />
          {/* <Image src={person.imgUri} alt="profile" width={53} height={53} /> */}
        </div>
        <div className="memname">{person.nickname}</div>
        <div className="memicon">
          {person.nickname === roomState.currentRoom?.owner ? (
            <StarRoundedIcon sx={{ height: "15px", color: "yellow" }} />
          ) : (
            roomState.adminAry.map((admin, idx) => {
              return admin.nickname === person.nickname ? (
                <StarOutlineRoundedIcon
                  key={idx}
                  sx={{ height: "15px", color: "yellow" }}
                />
              ) : null;
            })
          )}
        </div>
      </div>
      <Paper sx={{ width: "500px" }}>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          style={{ minWidth: 300 }}
        >
          {isOwner ? (
            <MenuItem onClick={SetAdmin}>
              {isAuthorized ? "Unset Admin" : "Set Admin"}
            </MenuItem>
          ) : null}
          <MenuItem onClick={Mute}>Mute</MenuItem>
          <MenuItem onClick={Kick}>Kick</MenuItem>
          <MenuItem onClick={Ban}>Ban</MenuItem>
        </Menu>
        {showAlert ? (
          <Alert sx={alert} severity="info" style={{ width: "333px" }}>
            {person.nickname} is {string}
          </Alert>
        ) : null}
      </Paper>
      <MemberModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        person={person}
      />
    </>
  );
}
