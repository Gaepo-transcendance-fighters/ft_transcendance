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
import { IChatRoom, ReturnMsgDto } from "@/type/RoomType";
import { IMember } from "@/type/RoomType";
import { useFriend } from "@/context/FriendContext";
import RoomEnter from "@/external_functions/RoomEnter";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import MemberGameButton from "../InviteGame/MemberGameButton";
import {
  FriendReqData,
  IBlock,
  IChatBlock,
  friendProfileModalStyle,
} from "@/type/type";
import { useRoom } from "@/context/RoomContext";
import { useAuth } from "@/context/AuthContext";
import MemberGameLog from "./MemberGameLog";
import { IGameRecord, IGameUserInfo } from "@/type/GameType";
import secureLocalStorage from "react-secure-storage";

const server_domain = process.env.NEXT_PUBLIC_SERVER_URL_4000;

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
  const { roomState, roomDispatch } = useRoom();
  const { userState } = useUser();
  const { friendState, friendDispatch } = useFriend();
  const { authState } = useAuth();
  const [gameRecordData, setGameRecordData] = useState<IGameRecord[]>([]);
  const [gameUserInfo, setGameUserInfo] = useState<IGameUserInfo | null>(null);
  const [winningRate, setWinningRate] = useState<number>(0);

  const handleCloseModal = () => {
    setGameUserInfo(null);
    setGameRecordData([]);
    setWinningRate(0);
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
      myIdx: userState.userIdx,
      targetNickname: person.nickname!,
      targetIdx: person.userIdx!,
    };
    await axios({
      method: "post",
      url: `${server_domain}/users/follow`,
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
        friendDispatch({ type: "SET_IS_FRIEND", value: true });
      })
      .catch((err) => {
        console.log(err);
      });
    handleCloseMenu();
    handleCloseModal();
  };

  const deleteFriend = async () => {
    const friendReqData: FriendReqData = {
      myIdx: userState.userIdx,
      targetNickname: person.nickname!,
      targetIdx: person.userIdx!,
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

  useEffect(() => {
    if (!authState.chatSocket) return;
    if (!person.userIdx === secureLocalStorage.getItem("idx")) {
      handleCloseMenu();
      handleCloseModal();
      return;
    }
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
          blockedNickname: person.nickname!,
          blockedUserIdx: person.userIdx!,
        },
      });
      friendDispatch({ type: "SET_IS_FRIEND", value: false });
      friendDispatch({ type: "SET_FRIENDLIST", value: data.friendList });
      friendDispatch({ type: "SET_BLOCKLIST", value: blockList });
      handleCloseMenu();
      handleCloseModal();
    };
    authState.chatSocket.on("chat_block", ChatBlock);

    return () => {
      if (!authState.chatSocket) return;
      authState.chatSocket.off("chat_block", ChatBlock);
    };
  }, [person]);

  useEffect(() => {
    if (friendState.friendList.length) {
      friendState.friendList.find(
        (friend) => friend.friendNickname === person.nickname
      )
        ? friendDispatch({ type: "SET_IS_FRIEND", value: true })
        : friendDispatch({ type: "SET_IS_FRIEND", value: false });
    }
  }, [friendState.isFriend, friendState.friendList]);

  useEffect(() => {
    if (!authState.chatSocket) return;
    const ChatGetDmRoomList = (payload?: IChatRoom[]) => {
      payload ? roomDispatch({ type: "SET_DM_ROOMS", value: payload }) : null;
      handleCloseModal();
      roomDispatch({ type: "SET_NEW_DM_ROOM_ALERT", value: true });
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
      (element) => element.targetNickname === person.nickname
    );
    if (existingRoom) {
      // 이미 dm 방이 존재. 그럼 기존 방 리디렉션
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
            console.log(ret.msg);
            return;
          }
        }
      );
    } else {
      // 방이 존재하지 않는다. 그럼 새로운 방만들기
      authState.chatSocket.emit(
        "create_dm",
        { targetNickname: person.nickname, targetIdx: person.userIdx },
        (ret: ReturnMsgDto) => {
          if (ret.code === 200) {
            console.log(ret.msg);
          } else if (ret.code !== 200) {
            console.log(ret.msg);
          }
        }
      );
    }
  };

  const blockFriend = () => {
    if (!authState.chatSocket) return;
    authState.chatSocket.emit(
      "chat_block",
      {
        targetNickname: person.nickname,
        targetIdx: person.userIdx,
      },
      (ret: ReturnMsgDto) => {}
    );
  };

  useEffect(() => {
    if (gameUserInfo) {
      gameUserInfo.win + gameUserInfo.lose === 0
        ? setWinningRate(0)
        : setWinningRate(
            Math.floor(
              (gameUserInfo.win / (gameUserInfo.win + gameUserInfo.lose)) * 100
            )
          );
    }
  }, [gameRecordData, gameUserInfo]);

  const RankImgSelect = (data: IGameUserInfo | null) => {
    if (!data) return "./rank/exp_medal_bronze.png";
    if (data) {
      if (data.rankpoint < 3000) return "./rank/exp_medal_bronze.png";
      else if (data.rankpoint >= 3000 && data.rankpoint < 3100)
        return "./rank/exp_medal_silver.png";
      else if (data.rankpoint >= 3100) return "./rank/exp_medal_gold.png";
    }
  };

  const RankSrc = RankImgSelect(gameUserInfo);

  useEffect(() => {
    let found = roomState.currentRoomMemberList.find((mem) => {
      return mem.userIdx === person.userIdx;
    });
    if (!found || roomState.currentRoomMemberList.length === 1) {
      handleCloseModal();
    }
  }, [roomState.currentRoomMemberList]);
  return (
    <Modal open={openModal} onClose={handleCloseModal}>
      <Box sx={friendProfileModalStyle} borderRadius={"10px"}>
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
              src={`${server_domain}/img/${person.userIdx}.png`}
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
              닉네임: {person.nickname}
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
                  {!friendState.blockList.find(
                    (block) => block.blockedUserIdx === person.userIdx
                  ) ? (
                    <>
                      {!friendState.friendList.find(
                        (friend) => friend.friendIdx === person.userIdx
                      ) && <MenuItem onClick={addFriend}>Add</MenuItem>}
                      {friendState.friendList.find(
                        (friend) => friend.friendIdx === person.userIdx
                      ) && <MenuItem onClick={deleteFriend}>Delete</MenuItem>}
                    </>
                  ) : null}

                  <MenuItem onClick={blockFriend}>
                    {friendState.blockList.find(
                      (block) => block.blockedUserIdx === person.userIdx
                    ) === undefined
                      ? "Block"
                      : "UnBlock"}
                  </MenuItem>
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
                <img
                  src={RankSrc}
                  style={{
                    width: "50px",
                    height: "50px",
                    display: "block",
                    margin: "0 auto",
                  }}
                ></img>
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
                <Typography margin={1}>
                  랭크(포인트) : {gameUserInfo ? gameUserInfo.rankpoint : 0}
                </Typography>
                <Typography margin={1}>승률 : {winningRate}%</Typography>
              </CardContent>
            </Card>
          </Stack>
        </Card>
        <br />
        <Card
          sx={{
            backgroundColor: "#3478c5",
            height: "50%",
          }}
        >
          <CardContent sx={{ paddingBottom: 0 }}>
            <Typography>전적 기록</Typography>
          </CardContent>
          <Stack direction={"row"} sx={{ height: "400px" }}>
            <Card
              sx={{
                margin: 1,
                width: "100%",
                height: "72%",
                backgroundColor: "#48a0ed",
                overflowY: "scroll",
              }}
            >
              <Card
                sx={{
                  backgroundColor: "#86d8f7",
                  margin: 1,
                }}
              >
                <MemberGameLog
                  person={person}
                  setGameRecordData={setGameRecordData}
                  gameRecordData={gameRecordData}
                  setGameUserInfo={setGameUserInfo}
                />
              </Card>
            </Card>
          </Stack>
        </Card>
      </Box>
    </Modal>
  );
}
