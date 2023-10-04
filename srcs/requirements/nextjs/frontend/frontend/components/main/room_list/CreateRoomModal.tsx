"use client";

import {
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
  KeyboardEvent,
} from "react";
import { Box, Button, Card, Stack, TextField, Typography } from "@mui/material";
import "@/components/main/room_list/RoomList.css";
import Modal from "@mui/material/Modal";
import { useRoom } from "@/context/RoomContext";
import { IChatRoom, Mode, Permission, ReturnMsgDto } from "@/type/RoomType";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import RoomEnter from "@/external_functions/RoomEnter";

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
  const { authState } = useAuth();

  const handleClose = () => {
    setValue("");
    setOpen(false);
  };

  useEffect(() => {
    if (!authState.chatSocket) return;
    const ChatCreateRoom = (data: IChatRoom) => {
      if (!authState.chatSocket) return;
      roomDispatch({ type: "ADD_ROOM", value: data });
      if (data.owner !== userState.nickname) return;
      RoomEnter(data, roomState, userState, roomDispatch, authState.chatSocket);
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
    authState.chatSocket.on("BR_chat_create_room", ChatCreateRoom);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("BR_chat_create_room", ChatCreateRoom);
    };
  }, [userState.userIdx, roomState.currentRoom]);

  const OnClick = () => {
    if (!authState.chatSocket) return;
    authState.chatSocket.emit(
      "BR_chat_create_room",
      { password: value },
      (ret: ReturnMsgDto) => {
        // if (ret === 200)
      }
    );
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter") {
      if (!authState.chatSocket) return;
      authState.chatSocket.emit(
        "BR_chat_create_room",
        { password: value },
        (ret: ReturnMsgDto) => {
          // if (ret === 200)
        }
      );
    }
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
                <Typography>방 제목: GF CHANNEL</Typography>
                {/* <Typography>방 제목: {userState.nickname}'s</Typography> */}
              </Stack>
              <Stack margin={1}>
                <Typography>비밀번호 :</Typography>
                <TextField
                  sx={{ backgroundColor: "#ffffff" }}
                  value={value}
                  type="password"
                  autoComplete="false"
                  onChange={(e) => setValue(e.currentTarget.value)}
                  autoFocus={true}
                  onKeyDown={onKeyDown}
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
