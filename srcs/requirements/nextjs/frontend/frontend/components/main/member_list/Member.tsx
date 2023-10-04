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
  ReturnMsgDto,
  alert,
  ILeftMember,
  Mode,
} from "@/type/RoomType";
import { Menu, MenuItem } from "@mui/material";
import { useUser } from "@/context/UserContext";
import Alert from "@mui/material/Alert";
import { useAuth } from "@/context/AuthContext";

const strings = [
  "now an administrator",
  "not an administrator anymore",
  "muted",
  "kicked",
  "banned",
];

const server_domain = process.env.NEXT_PUBLIC_SERVER_URL_4000;
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
  const { roomState, roomDispatch } = useRoom();
  const { userState } = useUser();
  const { authState } = useAuth();

  const handleOpenModal = () => {
    userState.nickname === person.nickname
      ? setOpenModal(false)
      : setOpenModal(true);
  };

  const CheckOwner = (nickname: string) => {
    nickname === roomState.currentRoom?.owner
      ? setIsOwner(true)
      : setIsOwner(false);
  }; // TODO : isOwner 사용한다음엔 false로 설정하기

  useEffect(() => {
    if (roomState.currentRoom?.owner === userState.nickname) setIsOwner(true);
    roomState.adminAry.map((adminElement) => {
      return adminElement.nickname === userState.nickname // 내가 어드민 이라면
        ? setIsAdmin(true)
        : setIsAdmin(false);
    });
  }, [roomState.adminAry, roomState.currentRoom]);

  const handleOpenMenu = (
    e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>
  ) => {
    e.preventDefault();
    let imAdmin = roomState.adminAry.find((admin) => {
      return admin.nickname === person.nickname; // 클릭한 멤버가 어드민이라면
    });
    if (imAdmin !== undefined) setIsAuthorized(true);
    userState.nickname === roomState.currentRoom?.owner || (isAdmin && !imAdmin) // 내가 어드민이고 우클릭한 대상도 어드민이면
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
    if (!authState.chatSocket) return;
    const ChatRoomAdmin = (payload: IChatRoomAdmin) => {
      roomDispatch({ type: "SET_ADMIN_ARY", value: payload.admin });
    };

    authState.chatSocket.on("chat_room_admin", ChatRoomAdmin);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("chat_room_admin", ChatRoomAdmin);
    };
  }, []);

  const SetAdmin = () => {
    if (!authState.chatSocket) return;
    authState.chatSocket.emit(
      "chat_room_admin",
      {
        channelIdx: roomState.currentRoom?.channelIdx,
        userIdx: person.userIdx,
        grant: !isAuthorized,
      },
      (ret: ReturnMsgDto) => {
        setIsAuthorized((prev) => !prev);
        setShowAlert(true);
      }
    );
  };

  useEffect(() => {
    isAuthorized ? setString(strings[0]) : setString(strings[1]);
  }, [isAuthorized]);

  useEffect(() => {
    if (!authState.chatSocket) return;
    const ChatMute = (data: IChatMute) => {
    };
    authState.chatSocket.on("chat_mute", ChatMute);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("chat_mute", ChatMute);
    };
  });

  const Mute = () => {
    if (!authState.chatSocket) return;
    authState.chatSocket.emit("chat_mute", {
      channelIdx: roomState.currentRoom?.channelIdx,
      targetNickname: person.nickname,
      targetIdx: person.userIdx,
    });
    setShowAlert(true);
    setString(strings[2]);
  };

  useEffect(() => {
    if (!authState.chatSocket) return;
    const ChatKick = (data: IChatKick) => {
      if (data.targetNickname === userState.nickname) {
        roomDispatch({ type: "SET_CUR_ROOM", value: null });
        return;
      }
      const list: IMember[] = data.leftMember.map((mem: ILeftMember) => {
        return {
          nickname: mem.userNickname,
          userIdx: mem.userIdx,
          imgUri: mem.imgUri,
        };
      });
      roomDispatch({ type: "SET_CUR_MEM", value: list });
    };
    authState.chatSocket.on("chat_kick", ChatKick);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("chat_kick", ChatKick);
    };
  }, []);

  const Kick = () => {
    if (!authState.chatSocket) return;
    authState.chatSocket.emit(
      "chat_kick",
      {
        channelIdx: roomState.currentRoom?.channelIdx,
        targetNickname: person.nickname,
        targetIdx: person.userIdx,
      },
      (ret: ReturnMsgDto) => {
        // if (ret === 200) {
        // setShowAlert(true);
        // setString(strings[3]);
      }
    );
  };

  useEffect(() => {
    if (!authState.chatSocket) return;
    const ChatBan = (data: IChatKick) => {
      if (data.targetNickname === userState.nickname) {
        roomDispatch({ type: "SET_CUR_ROOM", value: null });
        return;
      }
      const list: IMember[] = data.leftMember.map((mem: ILeftMember) => {
        return {
          nickname: mem.userNickname,
          userIdx: mem.userIdx,
          imgUri: mem.imgUri,
        };
      });
      roomDispatch({ type: "SET_CUR_MEM", value: list });
    };
    authState.chatSocket.on("chat_ban", ChatBan);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("chat_ban", ChatBan);
    };
  }, []);

  const Ban = () => {
    if (!authState.chatSocket) return;
    authState.chatSocket.emit(
      "chat_ban",
      {
        channelIdx: roomState.currentRoom?.channelIdx,
        targetNickname: person.nickname,
        targetIdx: person.userIdx,
      },
      (ret: ReturnMsgDto) => {
        if (ret.code === 200) {
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
          <Image
            src={`${server_domain}/img/${person.userIdx}.png`}
            alt="mem profile"
            width={53}
            height={53}
          />
        </div>
        <div className="memname">{person.nickname}</div>
        <div className="memicon">
          {roomState.currentRoom?.mode !== Mode.PRIVATE &&
          person.nickname === roomState.currentRoom?.owner ? (
            <StarRoundedIcon sx={{ height: "15px", color: "yellow" }} />
          ) : (
            roomState.currentRoom?.mode !== Mode.PRIVATE &&
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
      {/* menu css 관련 컴포넌트였는데, 지금 급한거 아니기에 지움 */}
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
      <MemberModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        person={person}
      />
    </>
  );
}
