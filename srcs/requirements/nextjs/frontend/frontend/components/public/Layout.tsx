"use client";

import { CardContent, Stack, Box } from "@mui/material";
import FriendList from "../main/friend_list/FriendList";
import RoomList from "../main/room_list/RoomList";
import ChatWindow from "../main/chat_window/ChatWindow";
import Myprofile from "../main/myprofile/MyProfile";
import GameStartButton from "../game/GameStartButton";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRoom } from "@/context/RoomContext";
import { useUser } from "@/context/UserContext";
import { useFriend } from "@/context/FriendContext";
import { IMaindata } from "@/type/type";
import { ReturnMsgDto } from "@/type/RoomType";

const Layout = () => {
  const { roomDispatch } = useRoom();
  const { friendDispatch } = useFriend();
  const { userDispatch } = useUser();
  const { authState } = useAuth();

  useEffect(() => {
    if (!authState.chatSocket) return;
    const MainEnter = (data: IMaindata) => {
      roomDispatch({ type: "SET_NON_DM_ROOMS", value: data.channelList });
      roomDispatch({ type: "SET_DM_ROOMS", value: data.dmChannelList });
      friendDispatch({ type: "SET_FRIENDLIST", value: data.friendList });
      friendDispatch({ type: "SET_BLOCKLIST", value: data.blockList });
      userDispatch({
        type: "CHANGE_IMG",
        value: data.userObject.imgUri,
      });
      userDispatch({
        type: "CHANGE_NICK_NAME",
        value: data.userObject.nickname,
      });
      userDispatch({ type: "SET_USER_IDX", value: data.userObject.userIdx });
    };
    authState.chatSocket.on("main_enter", MainEnter);
    authState.chatSocket.emit(
      "main_enter",
      { userNickname: authState.userInfo.nickname },
      (ret: ReturnMsgDto) => {
        if (ret.code === 200) {
        }
      }
    );

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("main_enter", MainEnter);
    };
  }, [authState.chatSocket?.connected]);

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
