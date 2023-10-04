"use client";

import {
  Box,
  Button,
  Card,
  Menu,
  MenuItem,
  Modal,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { useRoom } from "@/context/RoomContext";
import {
  IBlock,
  IChatBlock,
  IFriendData,
  IOnlineStatus,
  blockProfileModalStyle,
  main,
} from "@/type/type";
import { IChatRoom, ReturnMsgDto } from "@/type/RoomType";
import { useFriend } from "@/context/FriendContext";
import { useAuth } from "@/context/AuthContext";

const server_domain = process.env.NEXT_PUBLIC_SERVER_URL_4000;

const BlockProfile = ({ prop }: { prop: IBlock }) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [friendData, setFriendData] = useState<IFriendData>({
    targetNickname: "",
    imgUri: "",
    rank: 0,
    win: 0,
    lose: 0,
    isOnline: IOnlineStatus.OFFLINE,
  });
  const { roomState, roomDispatch } = useRoom();
  const { authState } = useAuth();
  const { userState } = useUser();
  const { friendDispatch } = useFriend();

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // 서버에서 API 호출 무한루프가 돌아서 임시로 수정해놓았씁니다. // 이 2 개는 맨 아래랑 같은 동작같은데 ..? ws
  // useEffect(() => {
  //   const UserProfile = (data: IFriendData) => {
  //     setFriendData(data);
  //   };
  //   // emit까지 부분은 더보기 버튼을 눌렀을 때 진행되어야할듯.
  //   socket.on("user_profile", UserProfile);
  // });

  // useEffect(() => {
  //   const ReqData = {
  //     //값 변경 필요
  //     userIdx: userState.userIdx,
  //     targetNickname: prop.friendNickname,
  //     targetIdx: prop.friendIdx,
  //   };
  //   socket.emit("user_profile", ReqData);
  // }, []);

  // 서버에서 API 호출 무한루프가 돌아서 임시로 수정해놓았씁니다.
  // useEffect(() => {
  //   // emit까지 부분은 더보기 버튼을 눌렀을 때 진행되어야할듯.
  //   const UserProfile = (data: IFriendData) => {
  //     setFriendData(data);
  //   };
  //   socket.on("user_profile", UserProfile);

  //   return () => {
  //     socket.off("user_profile");
  //   };
  // }, []);

  useEffect(() => {
    if (!authState.chatSocket) return;
    const ChatGetDmRoomList = (payload?: IChatRoom[]) => {
      if (payload) {
        roomDispatch({ type: "SET_DM_ROOMS", value: payload });
        handleCloseModal();
        roomDispatch({ type: "SET_NEW_DM_ROOM_ALERT", value: true });
      }
    };

    authState.chatSocket.on("create_dm", ChatGetDmRoomList);
    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("create_dm", ChatGetDmRoomList);
    };
  }, []);

  const handleOpenNdataModal = () => {
    if (!authState.chatSocket) return;
    authState.chatSocket.emit(
      "user_profile",
      {
        userIdx: userState.userIdx,
        targetNickname: prop.blockedNickname,
        targetIdx: prop.blockedUserIdx,
      },
      () => {}
    );
    setOpenModal(true);
  };

  useEffect(() => {
    if (!authState.chatSocket) return;
    const ChatBlock = (data: IChatBlock) => {
      const blockList = data.blockInfo
        ? data.blockInfo.map((block: IBlock) => {
            return {
              blockedNickname: block.blockedNickname,
              blockedUserIdx: block.blockedUserIdx,
            };
          })
        : [];
      friendDispatch({ type: "SET_BLOCKLIST", value: blockList });
      friendDispatch({ type: "SET_IS_FRIEND", value: false });
      handleCloseMenu();
      handleCloseModal();
    };
    authState.chatSocket.on("chat_block", ChatBlock);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("chat_block", ChatBlock);
    };
  }, []);

  const blockFriend = () => {
    if (!authState.chatSocket) return;
    authState.chatSocket.emit(
      "chat_block",
      {
        targetNickname: prop.blockedNickname,
        targetIdx: prop.blockedUserIdx,
      },
      (ret: ReturnMsgDto) => {
        friendDispatch({ type: "SET_IS_FRIEND", value: false });
      }
    );
  };

  useEffect(() => {
    if (!authState.chatSocket) return;
    const userProfile = (data: IFriendData) => {
      setFriendData(data);
    };
    authState.chatSocket.on("user_profile", userProfile);
    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("user_profile");
    };
  }, [friendData]);

  // useEffect(() => {
  //   const find = friendState.blockList.find((block) =>
  //     block.targetIdx === idx
  //   );
  // }, [openModal]);

  return (
    <>
      <Button type="button" onClick={handleOpenNdataModal}>
        <Typography>더보기</Typography>
      </Button>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={blockProfileModalStyle} borderRadius={"10px"}>
          <Card
            sx={{
              backgroundColor: main.main7,
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
                src={`${server_domain}/img/${prop.blockedUserIdx}.png`}
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
              paddingTop={1.5}
            >
              <Typography
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontSize: "23px",
                }}
              >
                닉네임: {friendData?.targetNickname}
              </Typography>
              <Stack direction={"row"} spacing={2}>
                <Button
                  type="button"
                  sx={{ minWidth: "max-content" }}
                  variant="contained"
                  onClick={blockFriend}
                >
                  UnBlock
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Box>
      </Modal>
    </>
  );
};

export default BlockProfile;
