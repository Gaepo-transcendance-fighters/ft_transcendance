"use client";

import {
  Button,
  Box,
  Modal,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import useModal from "@/hooks/useModal";
import Modals from "@/components/public/Modals";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 300,
  height: 150,
  bgcolor: "#65d9f9",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

import { useRouter } from "next/navigation";
import { main } from "@/type/type";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { ReturnMsgDto } from "@/type/RoomType";
import secureLocalStorage from "react-secure-storage";

enum SpeedOption {
  speed1,
  speed2,
  speed3,
}

enum MapOption {
  map1,
  map2,
  map3,
}

enum GameType {
  FRIEND,
  NORMAL,
  RANK,
}

interface IGameQueueSuccess {
  dbKey: number;
  userNicknameFirst: string;
  userIdxFirst: number;
  userNicknameSecond: string;
  userIdxSecond: number;
  successDate: Date;
  gameType: GameType; // friend, normal, rank
  speed: SpeedOption; // normal, fast, faster
  mapNumber: MapOption; // 0, 1, 2
}

interface IGameSetting {
  roomId: string;
  gameType: GameType; // friend, normal, rank
  speed: SpeedOption; // normal, fast, faster
  mapNumber: MapOption; // 0, 1, 2
}

const Inwaiting = () => {
  const router = useRouter();
  const [client, setClient] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const { gameState, gameDispatch } = useGame();
  const { authState, authDispatch } = useAuth();
  const { isShowing, toggle } = useModal();

  const BackToMain = () => {
    if (!authState.gameSocket) return;
    //게임 소켓 - 게임 큐 취소
    authState.gameSocket.emit(
      "game_queue_quit",
      { userIdx: parseInt(secureLocalStorage.getItem("idx") as string) },
      (res: ReturnMsgDto) => {
        if (res.code === 200) {
          console.log("game_queue_quit");
          authState.gameSocket!.disconnect();
          router.replace("/home?from=game");
        }
      }
    );
  };

  const preventGoBack = (e: PopStateEvent) => {
    e.preventDefault();
    toggle();
  };

  useEffect(() => {
    if (!authState.gameSocket) return;
    if (authState.gameSocket?.connected)
      console.log(`[inwaiting page]🥳 게임 소켓 연결 상태 Good!`)
    else
      console.log(`[inwaiting page]🥺 게임 소켓 연결 BAD...`)
    console.log("waiting");
    setClient(true);

    //게임 소켓 - 이벤트 등록
    authState.gameSocket.on("game_queue_quit", (msg) => {
      console.log("Duplicate connect")
      router.replace("/home?from=game")
      alert(msg)
    });

    authState.gameSocket.on("game_start", () => {
      setTimeout(() => {
        router.replace("/gameplaying");
      }, 2000);
    });

    authState.gameSocket.on(
      "game_ping",
      ({ serverTime }: { serverTime: number }) => {
        const now = new Date().getTime();
        authState.gameSocket!.emit("game_ping_receive", {
          userIdx: parseInt(secureLocalStorage.getItem("idx") as string),
          serverTime: serverTime,
          clientTime: now,
        });
      }
    );

    authState.gameSocket.on("game_queue_success", (data: IGameQueueSuccess) => {
      authState.gameSocket!.emit(
        "game_queue_success",
        { userIdx: parseInt(secureLocalStorage.getItem("idx") as string) },
        () => {
          console.log("game_queue_success");
          gameDispatch({
            type: "SET_ROOM_ID",
            value: data.dbKey,
          });
          gameDispatch({
            type: "A_PLAYER",
            value: { nick: data.userNicknameFirst, id: data.userIdxFirst },
          });
          gameDispatch({
            type: "B_PLAYER",
            value: { nick: data.userNicknameSecond, id: data.userIdxSecond },
          });
          gameDispatch({
            type: "SET_BALL_SPEED_OPTION",
            value: data.speed,
          });
          gameDispatch({
            type: "SET_MAP_TYPE",
            value: data.mapNumber,
          });
          gameDispatch({
            type: "SET_GAME_MODE",
            value: data.gameType,
          });
          setOpenModal(true);
        }
      );
    });

    //큐 대기 중 페이지 탈주 방지
    history.pushState(null, "", location.href);
    window.addEventListener("popstate", preventGoBack);

    return () => {
      if (!authState.gameSocket) return;
      window.removeEventListener("popstate", preventGoBack);
      authState.gameSocket.off("game_queue_quit");
      authState.gameSocket.off("game_ping");
      authState.gameSocket.off("game_start");
      authState.gameSocket.off("game_queue_success");
    };
  }, []);

  if (!client) return <></>;

  return (
    <Card sx={{ display: "flex" }}>
      <Stack
        sx={{
          width: "100%",
          height: "100vh",
          backgroundImage: `url("/background.png")`,
          padding: 0,
          margin: 0,
        }}
      >
        <CardContent
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Card
            style={{
              width: "40%",
              height: "10vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid black",
            }}
          >
            <Typography sx={{ fontSize: "2rem" }}>Select Game Mode</Typography>
          </Card>
        </CardContent>
        <CardContent
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Card
            style={{
              width: "60%",
              height: "65vh",
              border: "2px solid black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: main.main3,
            }}
          >
            <Stack
              style={{
                justifyContent: "center",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Image
                src="/gif/gogoo1.gif"
                alt="pingpong waiting"
                width={200}
                height={180}
              />
              <Typography sx={{ fontSize: "3rem" }}>
                Waiting for queue
              </Typography>
            </Stack>
            <Modals
              isShowing={isShowing}
              hide={toggle}
              message={`뒤로 가면 큐가 취소됩니다. 그래도 뒤로 가시겠습니까?`}
              routing="/home?from=game"
            />
            <Modal open={openModal}>
              <Box sx={modalStyle} borderRadius={"10px"}>
                <Card
                  style={{
                    width: "100%",
                    height: "20%",
                    backgroundColor: main.main4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* 상단 안내메세지 */}
                  <CardContent
                    style={{
                      width: "100%",
                      height: "20%",
                      backgroundColor: main.main4,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {/* 상단 안내메세지 */}
                    <CardContent
                      style={{
                        width: "100%",
                        height: "20%",
                        backgroundColor: main.main4,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Typography>매칭되었습니다</Typography>
                    </CardContent>
                  </CardContent>
                </Card>
                <Card
                  style={{
                    width: "100%",
                    height: "90%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <CardContent
                    style={{
                      width: "100%",
                      height: "40%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography>잠시후 게임화면으로 이동합니다.</Typography>
                  </CardContent>
                </Card>
              </Box>
            </Modal>
          </Card>
        </CardContent>

        <CardContent
          style={{
            width: "100%",
            height: "30vh",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            style={{
              minWidth: "max-content",
              height: "50%",
              border: "2px solid black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              backgroundColor: "White",
            }}
            onClick={BackToMain}
          >
            Back to Main
          </Button>
        </CardContent>
      </Stack>
    </Card>
  );
};

export default Inwaiting;
