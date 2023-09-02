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
import { IChatDmEnter, IChatRoom, ReturnMsgDto } from "@/type/RoomType";
import { IMember } from "@/type/RoomType";
import { useFriend } from "@/context/FriendContext";
import { socket } from "@/app/page";
import RoomEnter from "@/external_functions/RoomEnter";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import MemberGameButton from "../InviteGame/MemberGameButton";
import { FriendReqData } from "@/type/type";
import { useRoom } from "@/context/RoomContext";

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

const loginOn = (
  <Image src="/status/logon.png" alt="online" width={10} height={10} />
);

const loginOff = (
  <Image src="/status/logoff.png" alt="offline" width={10} height={10} />
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [curFriend, setCurFriend] = useState<IFriend | null>(null);
  const { roomState, roomDispatch } = useRoom();
  const { userState } = useUser();
  const { friendState, friendDispatch } = useFriend();
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    setCurFriend({
      friendNickname: person.nickname!,
      friendIdx: person.userIdx!,
      isOnline: true,
    });
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

  const addFriend = async () => {
    const friendReqData: FriendReqData = {
      userIdx: userState.userIdx,
      targetNickname: person.nickname!,
      targetIdx: person.userIdx!,
    };
    await axios({
      method: "post",
      url: "http://paulryu9309.ddns.net:4000/users/follow",
      data: friendReqData,
    })
      .then((res) => {
        friendDispatch({ type: "SET_FRIENDLIST", value: res.data.result });
      })
      .catch((err) => {
        console.log(err);
      });
    handleCloseMenu();
    handleCloseModal();
  };

  const deleteFriend = async () => {
    const friendReqData: FriendReqData = {
      userIdx: userState.userIdx,
      targetNickname: person.nickname!,
      targetIdx: person.userIdx!,
    };

    await axios({
      method: "delete",
      url: "http://paulryu9309.ddns.net:4000/users/unfollow",
      data: JSON.stringify(friendReqData),
    })
      .then((res) => {
        console.log(res.data);
        friendDispatch({ type: "SET_FRIENDLIST", value: res.data });
      })
      .catch((err) => {
        console.log(err);
      });
    handleCloseModal();
  };

  useEffect(() => {
    friendState.friendList.find(
      (friend) => friend.friendNickname === person.nickname
    )
      ? setIsFriend(true)
      : setIsFriend(false);
  }, [isFriend]);

  useEffect(() => {
    const ChatGetDmRoomList = (payload?: IChatRoom[]) => {
      payload ? roomDispatch({ type: "SET_DM_ROOMS", value: payload }) : null;
      handleCloseModal();
      roomDispatch({ type: "SET_NEW_DM_ROOM_ALERT", value: true });
    };

    socket.on("create_dm", ChatGetDmRoomList);
    return () => {
      socket.off("create_dm", ChatGetDmRoomList);
    };
  }, []);

  const sendDM = () => {
    const existingRoom = roomState.dmRooms.find(
      (element) => element.targetNickname === person.nickname
    );
    if (existingRoom) {
      // 이미 dm 방이 존재. 그럼 기존 방 리디렉션
      socket.emit(
        "chat_get_DM",
        {
          channelIdx: existingRoom.channelIdx,
        },
        (ret: ReturnMsgDto) => {
          if (ret.code === 200) {
            RoomEnter(existingRoom, roomState, userState, roomDispatch);
            handleCloseModal();
          } else {
            console.log(ret.msg);
            return;
          }
        }
      );
    } else {
      // 방이 존재하지 않는다. 그럼 새로운 방만들기
      socket.emit(
        "create_DM",
        {
          targetNickname: person.nickname,
          targetIdx: person.userIdx,
        },
        (ret: ReturnMsgDto) => {
          if (ret.code === 200) {
            console.log(ret.msg);
          } else {
            console.log(ret.msg);
            return;
          }
        }
      );
    }
    socket.emit(
      "create_dm",
      { targetNickname: person.nickname, targetIdx: person.userIdx },
      (res: ReturnMsgDto) => {
        if (res.code === 200) {
        } else if (res.code !== 200) {
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
              src={person.imgUri!}
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
              <MemberGameButton prop={person} />
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
                  {!isFriend && <MenuItem onClick={addFriend}>Add</MenuItem>}
                  {isFriend && (
                    <MenuItem onClick={deleteFriend}>Delete</MenuItem>
                  )}
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
