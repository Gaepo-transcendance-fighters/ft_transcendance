"use client";

import { useState, Dispatch, SetStateAction, useEffect } from "react";
import { Box, Button, Card, Stack, TextField, Typography } from "@mui/material";
import "@/components/main/room_list/RoomList.css";
import Modal from "@mui/material/Modal";
import { useRoom } from "@/context/RoomContext";
import { IChatRoom, Mode, Permission } from "@/type/type";
import { socket } from "@/app/page";
import { useUser } from "@/context/UserContext";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "400px",
  bgcolor: "#67DBFB",
  borderRadius: "10px",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function CreateRoomModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [value, setValue] = useState("");
  const { roomState, roomDispatch } = useRoom();
  const { userState } = useUser();

  const handleClose = () => {
    setValue("");
    setOpen(false);
  };


  
  useEffect(() => {
    const ChatCreateRoom = (data: IChatRoom) => {
      roomDispatch({ type: "ADD_ROOM", value: data });
      if (data.owner !== userState.nickname)
        return ;
      if (
        roomState.currentRoom &&
        roomState.currentRoom.mode !== Mode.PRIVATE
      ) {
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
      roomDispatch({ type: "SET_CUR_ROOM", value: data });
      roomDispatch({ type: "SET_IS_OPEN", value: true });
      roomDispatch({
        type: "SET_CUR_MEM",
        value: [
          {
            userIdx: userState.userIdx,
            nickname: userState.nickname,
            imgUri: userState.imgUri,
            permission: Permission.OWNER,
          },
        ],
      });
      setValue("");
      setOpen(false);
    };
    socket.on("BR_chat_create_room", ChatCreateRoom);

    return () => {
      socket.off("BR_chat_create_room", ChatCreateRoom);
    };
  }, [userState.userIdx, roomState.currentRoom]);

  const OnClick = () => {
    socket.emit(
      "BR_chat_create_room",
      JSON.stringify({ password: value }),
      (ret: number) => {
        // if (ret === 200)
      }
    );
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="create-room-modal"
        aria-describedby="create-non-dm-room-modal"
      >
        <Box sx={style}>
          <Card sx={{ margin: 1, backgroundColor: "#55B7EB" }}>
            <Box margin={1}>
              <Typography>방 생성 하기</Typography>
            </Box>
            <Card sx={{ margin: 1, backgroundColor: "#4292DA" }}>
              <Stack margin={1}>
                <Typography>방 제목: {userState.nickname}'s</Typography>
              </Stack>
              <Stack margin={1}>
                <Typography>비밀번호 :</Typography>
                <TextField
                  sx={{ backgroundColor: "#ffffff" }}
                  value={value}
                  type="password"
                  autoComplete="false"
                  onChange={(e) => setValue(e.currentTarget.value)}
                />
              </Stack>
            </Card>
            <Stack margin={1}>
              <Typography fontSize={"small"}>**주의사항</Typography>
              <Typography fontSize={"small"}>
                비밀번호를 입력하지 않으면 다른 사용자에게 공개됩니다.
              </Typography>
              <Typography fontSize={"small"}>
                추후 설정으로 비밀번호를 바꾸거나 추가할수도 있습니다.
              </Typography>
              <Button
                variant="contained"
                sx={{ margin: "auto" }}
                onClick={OnClick}
              >
                방 생성
              </Button>
            </Stack>
          </Card>
        </Box>
      </Modal>
    </>
  );
}
