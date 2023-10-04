"use client";

import { ToggleButton, Card, Typography, Box, Stack } from "@mui/material";
import Friend from "./Friend";
import Block from "./Block";
import { useCallback, useEffect, useState } from "react";
import { main } from "@/font/color";
import { useFriend } from "@/context/FriendContext";
import { useAuth } from "@/context/AuthContext";
import { user_status } from "@/type/type";

const unselectedButton = {
  backgroundColor: main.main1,
  color: "white",
  "&:hover": {
    backgroundColor: main.main1,
  },
  "&.Mui-selected, &.Mui-selected:hover": {
    backgroundColor: main.main1,
  },
  borderRadius: "10px",
  py: 0,
  px: 2,
  flex: 1,
};

const selectedButton = {
  backgroundColor: main.main5,
  color: "white",
  "&:hover": {
    backgroundColor: main.main5,
  },
  "&.Mui-selected, &.Mui-selected:hover": {
    backgroundColor: main.main5,
  },
  borderRadius: "10px",
  py: 0,
  px: 2,
  flex: 1,
};

const FriendList = () => {
  const [select, setSelect] = useState<boolean>(false);
  const { friendState, friendDispatch } = useFriend();
  const [client, setClient] = useState(false);
  const { authState } = useAuth();

  useEffect(() => {
    setClient(true);
  }, [select]);

  const updateFriendStatus = useCallback((data: user_status) => {
    if (friendState.friendList.length === 0) return;
    const friendList = friendState.friendList.map((friend) => {
      if (friend.friendIdx === data.userIdx) {
        return { ...friend, isOnline: data.isOnline };
      } else {
        return friend;
      }
    });
    friendDispatch({ type: "SET_FRIENDLIST", value: friendList });
  }, [friendState.friendList, friendDispatch]);

  useEffect(() => {
    if (authState.chatSocket)
      authState.chatSocket.on("BR_main_enter", updateFriendStatus);

    return () => {
      if (authState.chatSocket)
        authState.chatSocket.off("BR_main_enter", updateFriendStatus);
    };
  }, [updateFriendStatus]);

  if (!client) return <></>;

  return (
    <Card
      sx={{
        height: "57vh",
        borderRadius: "10px",
        margin: 1,
        backgroundColor: main.main2,
      }}
    >
      <Stack sx={{ padding: "16px" }}>
        <Box
          sx={{
            backgroundColor: main.main5,
            borderRadius: "10px",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <Typography
            color={"#ffffff"}
            align="center"
            sx={{
              width: "100%",
              fontSize: "21px",
              verticalAlign: "middle",
              margin: 0,
              padding: 0,
            }}
          >
            {!select ? "Friend List" : "Block List"}
          </Typography>
        </Box>
        <Stack
          direction={"row"}
          sx={{ marginTop: 1, height: "max-content", display: "flex" }}
          spacing={2}
        >
          <ToggleButton
            value="show"
            onClick={() => setSelect(false)}
            sx={!select ? selectedButton : unselectedButton}
          >
            Friend
          </ToggleButton>

          <ToggleButton
            value="show"
            onClick={() => setSelect(true)}
            sx={select ? selectedButton : unselectedButton}
          >
            Block
          </ToggleButton>
        </Stack>
        <Card
          sx={{
            my: "7px",
            backgroundColor: main.main5,
            overflow: "overlay",
            height: "43vh",
            padding: "10px",
            borderRadius: "10px",
          }}
        >
          {!select && 
            friendState.friendList.map((user, idx) => (
              <Friend key={idx} prop={user} />
          ))}
          {select &&
            friendState.blockList.map((user, idx) => (
              <Block key={idx} prop={user} />
          ))}
        </Card>
      </Stack>
    </Card>
  );
};

export default FriendList;
