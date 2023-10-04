"use client";

import "@/components/main/room_list/RoomList.css";
import { useRoom } from "@/context/RoomContext";
import { IChatRoom, ReturnMsgDto } from "@/type/RoomType";
import { Box, Button, Card, Stack, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "400px",
  bgcolor: "#67dcfb",
  borderRadius: "10px",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function EditRoomModal({
  prop,
  showAlert,
  setShowAlert,
}: {
  prop: () => void;
  showAlert: boolean;
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { roomState, roomDispatch } = useRoom();
  const [value, setValue] = useState("");
  const { userState } = useUser();
  const { authState } = useAuth();
  const payload = {
    channelIdx: roomState.currentRoom?.channelIdx,
    userIdx: userState.userIdx, // [번경필요]나중에 나의 userIdx 로 변경필요
    changePassword: value,
  };

  const handleClose = () => {
    if (!authState.chatSocket) return;
    prop();
    authState.chatSocket.emit(
      "BR_chat_room_password",
      payload,
      (ret: ReturnMsgDto) => {
        if (ret.code === 200) {
          console.log("pw changing success");
        } else {
          setShowAlert(true);
        }
      }
    );
  };

  useEffect(() => {
    if (!authState.chatSocket) return;
    const roomSettingHandler = (channels: IChatRoom[]) => {
      const targetChannelIdx = roomState.currentRoom?.channelIdx;
      const targetChannel: IChatRoom | undefined = channels.find(
        (channel) => channel.channelIdx === targetChannelIdx
      );
      if (targetChannel) {
        roomDispatch({ type: "SET_NON_DM_ROOMS", value: channels });
        roomDispatch({ type: "SET_CUR_ROOM", value: targetChannel });
      } else {
        console.log("error ocurrued!");
      }
    };
    authState.chatSocket.on("BR_chat_room_password", roomSettingHandler);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("BR_chat_room_password", roomSettingHandler);
    };
  });

  return (
    <>
      <Box sx={style}>
        <Card sx={{ margin: 1, backgroundColor: "#50aef8" }}>
          <Box margin={1}>
            <Typography>방 정보 변경하기</Typography>
          </Box>
          <Card sx={{ margin: 1, backgroundColor: "#3b85d8" }}>
            <Stack margin={1}>
              <Typography>
                {"방 제목: " + roomState.currentRoom?.owner + "'s room"}
              </Typography>
            </Stack>
            <Stack margin={1}>
              <Typography>비밀번호 :</Typography>
              <TextField
                sx={{ backgroundColor: "#ffffff" }}
                value={value}
                autoComplete="false"
                onChange={(e) => setValue(e.currentTarget.value)}
              />
            </Stack>
          </Card>
          <Stack margin={1}>
            <Typography fontSize={"small"}>**주의사항</Typography>
            <Typography fontSize={"small"}>
              비밀번호를 새로 등록할 수 있습니다.
            </Typography>
            <Typography fontSize={"small"}>
              비밀번호를 등록하지 않으면 공개방이 됩니다.
            </Typography>
            <Button
              variant="contained"
              sx={{ margin: "auto" }}
              onClick={handleClose}
            >
              업데이트
            </Button>
          </Stack>
        </Card>
      </Box>
    </>
  );
}
