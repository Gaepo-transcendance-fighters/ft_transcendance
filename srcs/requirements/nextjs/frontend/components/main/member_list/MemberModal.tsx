"use client";

import {
  Modal,
  Box,
  Card,
  Stack,
  Typography,
  Menu,
  CardContent,
  Button,
  MenuItem,
} from "@mui/material";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IFriend } from "../friend_list/FriendList";
import { IChatDmEnter, IMember } from "@/type/type";
import { useFriend } from "@/context/FriendContext";
import { useRoom } from "@/context/RoomContext";
import { socket } from "@/app/page";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  height: 500,
  bgcolor: "#65d9f9",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const loginOn = <Image src="/logon1.png" alt="online" width={10} height={10} />;
const loginOff = (
  <Image src="/logoff.png" alt="offline" width={10} height={10} />
);

export default function MemberModal({
  setOpenModal,
  openModal,
  person,
}: {
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  openModal: boolean;
  person: IMember;
}) {
  // console.log("MemberModal : ", person);
  const { friendState } = useFriend();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [curFriend, setCurFriend] = useState<IFriend | null>(null);
  const { roomState, roomDispatch } = useRoom();

  useEffect(() => {
    setCurFriend({
      friendNickname: person.nickname!,
      isOnline: true,
    });
    // friendState.friendList.map((friend) => {
    //   friend.friendNickname === person.nickname ? setCurFriend(friend) : null;
    // });
  }, []);

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    socket.on("check_dm", (payload: IChatDmEnter) => {});
    socket.on("create_dm", () => {});
    return () => {
      socket.off("check_dm", () => {});
      socket.off("create_dm", () => {});
    };
  }, []);

  const sendDM = () => {
    socket.emit(
      "check_dm",
      { targetNickname: person.nickname, targetIdx: person.userIdx },
      (res: number) => {
        if (res === 200) return;
        else if (res !== 200) {
        }
      }
    );
  };

  return (
    <Modal open={openModal} onClose={handleCloseModal}>
      <Box sx={modalStyle} borderRadius={"10px"}>
        <Card
          sx={{
            backgroundColor: "#48a0ed",
            width: "100wv",
            display: "flex",
            padding: 2,
          }}
        >
          <Box
            sx={{
              borderRadius: "70%",
              width: "max-content",
              overflow: "hidden",
            }}
            mx={5}
          >
            <Image
              src="https://dummyimage.com/100x100/1f0c1f/edeeff.png&text=user+img"
              alt="user img"
              width={100}
              height={100}
            />
          </Box>
          <Stack
            sx={{
              width: "15vw",
            }}
            spacing={1}
          >
            <Typography
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              닉네임: {curFriend?.friendNickname}
            </Typography>
            <Typography>
              상태: {curFriend?.isOnline ? loginOn : loginOff}
            </Typography>
            <Stack direction={"row"} spacing={2}>
              <Button
                type="button"
                sx={{ minWidth: "max-content" }}
                variant="contained"
              >
                친선전
              </Button>
              <Button
                type="button"
                sx={{ minWidth: "max-content" }}
                variant="contained"
                onClick={sendDM}
              >
                DM
              </Button>
              <Button
                type="button"
                sx={{ minWidth: "max-content" }}
                variant="contained"
                onClick={handleOpenMenu}
              >
                더보기
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                MenuListProps={{ sx: { py: 0 } }}
              >
                <Stack sx={{ backgroundColor: "#48a0ed" }}>
                  <MenuItem>Add</MenuItem>
                  <MenuItem>Delete</MenuItem>
                  <MenuItem>Block</MenuItem>
                </Stack>
              </Menu>
            </Stack>
          </Stack>
        </Card>
        <br />
        <Card sx={{ backgroundColor: "#3478c5" }}>
          <CardContent sx={{ paddingBottom: 0 }}>
            <Typography>전적</Typography>
          </CardContent>
          <Stack direction={"row"}>
            <Card
              sx={{
                margin: 1,
                marginRight: 0,
                width: "30%",
                height: "max-content",
              }}
            >
              <CardContent
                sx={{
                  backgroundColor: "#48a0ed",
                  height: "100%",
                  "&:last-child": { paddingBottom: "16px" },
                }}
              >
                <Typography margin={1} minWidth={"max-content"}>
                  랭크(포인트)
                </Typography>
                <Typography margin={1}>승률</Typography>
              </CardContent>
            </Card>
            <Card
              sx={{
                margin: 1,
                width: "70%",
                height: "max-content",
              }}
            >
              <CardContent
                sx={{
                  backgroundColor: "#48a0ed",
                  height: "100%",
                  "&:last-child": { paddingBottom: "16px" },
                }}
              >
                <Typography margin={1}>3000</Typography>
                <Typography margin={1}>0%</Typography>
              </CardContent>
            </Card>
          </Stack>
        </Card>
        <br />
        <Card
          sx={{
            backgroundColor: "#3478c5",
            height: "170px",
          }}
        >
          <CardContent sx={{ paddingBottom: 0 }}>
            <Typography>전적 기록</Typography>
          </CardContent>
          <Stack direction={"row"}>
            <Card
              sx={{
                margin: 1,
                width: "100%",
                height: "120px",
                backgroundColor: "#48a0ed",
                overflow: "scroll",
              }}
            >
              <Card
                sx={{
                  backgroundColor: "#86d8f7",
                  margin: 1,
                }}
              >
                <Stack direction={"row"}>
                  <CardContent
                    sx={{ "&:last-child": { paddingBottom: "16px" } }}
                  >
                    <Typography>WIN</Typography>
                  </CardContent>
                  <CardContent
                    sx={{ "&:last-child": { paddingBottom: "16px" } }}
                  >
                    <Typography>hoslim VS jujeon</Typography>
                  </CardContent>
                  <CardContent
                    sx={{ "&:last-child": { paddingBottom: "16px" } }}
                  >
                    <Typography>5 : 3</Typography>
                  </CardContent>
                </Stack>
              </Card>
            </Card>
          </Stack>
        </Card>
      </Box>
    </Modal>
  );
}
