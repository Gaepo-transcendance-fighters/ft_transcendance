"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
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
  FriendReqData,
  IBlock,
  IChatBlock,
  IFriend,
  IFriendData,
  IOnlineStatus,
  friendProfileModalStyle,
  main,
} from "@/type/type";
import { IChatRoom, ReturnMsgDto } from "@/type/RoomType";
import RoomEnter from "@/external_functions/RoomEnter";
import { useFriend } from "@/context/FriendContext";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import FriendGameLog from "./FriendGameLog";
import FriendGameButton from "../InviteGame/FriendGameButton";
import secureLocalStorage from "react-secure-storage";

const server_domain = process.env.NEXT_PUBLIC_SERVER_URL_4000;

const loginOn = (
  <Image src="/status/logon.png" alt="online" width={10} height={10} />
);

const loginOff = (
  <Image src="/status/logoff.png" alt="offline" width={10} height={10} />
);

const gamePlaying = (
  <Image
    src="/status/gameplaying.png"
    alt="gameplaying"
    width={10}
    height={10}
  />
);

const FriendProfile = ({ prop }: { prop: IFriend }) => {
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
  const { userState } = useUser();
  const { friendDispatch } = useFriend();
  const { authState } = useAuth();

  const RankSrc =
    friendData.rank < 3000
      ? "./rank/exp_medal_bronze.png"
      : friendData.rank >= 3000 && friendData.rank < 3100
      ? "./rank/exp_medal_silver.png"
      : "./rank/exp_medal_gold.png";

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

  const sendDM = () => {
    if (!authState.chatSocket) return;
    const existingRoom = roomState.dmRooms.find(
      (roomState) => roomState.targetNickname === prop.friendNickname
    );
    if (existingRoom) {
      authState.chatSocket.emit(
        "chat_get_DM",
        {
          channelIdx: existingRoom.channelIdx,
        },
        (ret: ReturnMsgDto) => {
          if (ret.code === 200) {
            RoomEnter(
              existingRoom,
              roomState,
              userState,
              roomDispatch,
              authState.chatSocket!
            );
            handleCloseModal();
          } else {
            return;
          }
        }
      );
    } else {
      // 방이 존재하지 않는다. 그럼 새로운 방만들기
      authState.chatSocket.emit(
        "create_dm",
        { targetNickname: prop.friendNickname, targetIdx: prop.friendIdx },
        (ret: ReturnMsgDto) => {
          if (ret.code === 200) {
          } else if (ret.code !== 200) {
          }
        }
      );
    }
  };

  const deleteFriend = async () => {
    const friendReqData: FriendReqData = {
      myIdx: userState.userIdx,
      targetNickname: prop.friendNickname,
      targetIdx: prop.friendIdx,
    };

    await axios({
      method: "delete",
      url: `${server_domain}/users/unfollow`,
      data: friendReqData,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          secureLocalStorage.getItem("token") as string
        }`,
      },
    })
      .then((res) => {
        friendDispatch({ type: "SET_FRIENDLIST", value: res.data.result });
        friendDispatch({ type: "SET_IS_FRIEND", value: false });
      })
      .catch((err) => {
        console.log(err);
      });
    handleCloseMenu();
    handleCloseModal();
  };

  const handleOpenNdataModal = () => {
    if (!authState.chatSocket) return;
    authState.chatSocket.emit(
      "user_profile",
      {
        userIdx: userState.userIdx,
        targetNickname: prop.friendNickname,
        targetIdx: prop.friendIdx,
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
      friendDispatch({
        type: "ADD_BLOCK",
        value: {
          blockedNickname: prop.friendNickname,
          blockedUserIdx: prop.friendIdx,
        },
      });
      friendDispatch({ type: "SET_BLOCKLIST", value: blockList });
      friendDispatch({ type: "SET_FRIENDLIST", value: data.friendList });
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
        targetNickname: prop.friendNickname,
        targetIdx: prop.friendIdx,
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

  return (
    <>
      <Button type="button" onClick={handleOpenNdataModal}>
        <Typography>더보기</Typography>
      </Button>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={friendProfileModalStyle} borderRadius={"10px"}>
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
                src={`${server_domain}/img/${prop.friendIdx}.png`}
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
                닉네임: {friendData?.targetNickname}
              </Typography>
              <Stack direction={"row"} spacing={2}>
                <FriendGameButton prop={prop as IFriend} />
                <Button
                  type="button"
                  sx={{ minWidth: "max-content" }}
                  variant="contained"
                  onClick={() => sendDM()}
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
                    <MenuItem onClick={deleteFriend}>Delete</MenuItem>
                    <MenuItem onClick={blockFriend}>Block</MenuItem>
                  </Stack>
                </Menu>
              </Stack>
            </Stack>
          </Card>
          <br />
          <Card sx={{ backgroundColor: main.main7 }}>
            <CardContent sx={{ paddingBottom: 0 }}>
              <Typography>전적</Typography>
            </CardContent>
            <Stack direction={"row"}>
              {/* 이미지 */}
              <Card
                sx={{
                  margin: 1,
                  marginRight: 0,
                  width: "30%",
                  // height: "90%",
                }}
              >
                <CardContent
                  sx={{
                    backgroundColor: main.main3,
                    height: "100%",
                    "&:last-child": { paddingBottom: "16px" },
                  }}
                >
                  <img
                    src={RankSrc}
                    style={{
                      width: "70%",
                      height: "70%",
                      display: "block",
                      margin: "0 auto",
                    }}
                  ></img>
                </CardContent>
              </Card>
              {/* !이미지 */}
              <Card
                sx={{
                  margin: 1,
                  width: "70%",
                  height: "60%",
                }}
              >
                <CardContent
                  sx={{
                    backgroundColor: main.main3,
                    height: "100%",
                    "&:last-child": { paddingBottom: "16px" },
                  }}
                >
                  <Typography margin={1}>
                    랭크(포인트) : {friendData.rank}{" "}
                  </Typography>
                  <Typography margin={1}>
                    승률 :{" "}
                    {friendData.win + friendData.lose === 0
                      ? 0
                      : Math.floor(
                          (friendData.win /
                            (friendData.win + friendData.lose)) *
                            100
                        )}
                    %
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Card>
          <br />

          <Card
            sx={{
              // backgroundColor: "RED",
              // backgroundColor: "#3478c5",
              backgroundColor: main.main3,
              height: "50%",
              width: "100%",
              overflowY: "scroll",
            }}
            id="logs"
          >
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Card
                sx={{ paddingBottom: 0 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "60%",
                  height: "30%",
                  backgroundColor: main.main7,
                  border: "2px solid black",
                }}
              >
                <Typography style={{ fontSize: "2rem" }}>전적 기록</Typography>
              </Card>
            </Box>
            <br />
            <Box
              sx={{
                listStyleType: "none",
                // overflowY: "scroll",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <FriendGameLog person={prop} />
            </Box>
          </Card>
        </Box>
      </Modal>
    </>
  );
};

export default FriendProfile;
