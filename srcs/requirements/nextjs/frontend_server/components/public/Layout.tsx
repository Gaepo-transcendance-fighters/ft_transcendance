"use client";

import { CardContent, Stack, Box } from "@mui/material";
import FriendList from "../main/friend_list/FriendList";
import RoomList from "../main/room_list/RoomList";
import ChatWindow from "../main/chat_window/ChatWindow";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Myprofile from "../main/myprofile/MyProfile";
import GameStartButton from "../game/GameStartButton";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRoom } from "@/context/RoomContext";
import { useUser } from "@/context/UserContext";
import { useFriend } from "@/context/FriendContext";
import { socket } from "@/app/page";
import { IMaindata } from "@/type/type";
import { ReturnMsgDto } from "@/type/RoomType";


const Layout = () => {
  const { authState } = useAuth();
  const { roomState, roomDispatch } = useRoom();
  const { friendState, friendDispatch } = useFriend();
  const { userState, userDispatch } = useUser();

  useEffect(() => {
    const MainEnter = (data: IMaindata) => {
      roomDispatch({ type: "SET_NON_DM_ROOMS", value: data.channelList });
      friendDispatch({ type: "SET_FRIENDLIST", value: data.friendList });
      friendDispatch({ type: "SET_BLOCKLIST", value: data.blockList });
      userDispatch({ type: "CHANGE_IMG", value: data.userObject.imgUri });
      userDispatch({
        type: "CHANGE_NICK_NAME",
        value: data.userObject.nickname,
      });
      userDispatch({ type: "SET_USER_IDX", value: data.userObject.userIdx });
    };

    socket.on("main_enter", MainEnter);

    return () => {
      socket.off("main_enter", MainEnter);
    };
  }, []);
  useEffect(() => {
    console.log(userState.nickname);
    socket.emit(
      "main_enter",
      { intra: localStorage.getItem("intra") },
      (ret: ReturnMsgDto) => {
        if (ret.code === 200) {
        }
      }
    );
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <Stack
        sx={{
          width: "20vw",
          height: "100vh",
          padding: 0,
          margin: 0,
        }}
      >
        <CardContent
          sx={{
            height: "35vh",
            ml: 1,
            mr: 1,
            mt: 1,
            backgroundColor: "#4292DA",
            borderRadius: "10px",
          }}
        >
          <Myprofile />
          {/* <Myprofile Img={소켓으로받아온 imguri링크} Nickname={소켓으로받아온 닉네임}/> */}
          {/* <InviteGame /> */}
          {/* <WaitAccept /> */}
        </CardContent>
        <FriendList />
      </Stack>

      <Stack
        sx={{
          width: "60vw",
          height: "100vh",
          padding: 0,
          margin: 0,
        }}
      >
        <CardContent sx={{ height: "37vh" }}>
          <GameStartButton />
        </CardContent>
        <ChatWindow />
      </Stack>

      <Stack
        sx={{
          width: "20vw",
          height: "100vh",
          padding: 0,
          margin: 0,
        }}
      >
        <RoomList />
      </Stack>
    </Box>
  );
};

export default Layout;
