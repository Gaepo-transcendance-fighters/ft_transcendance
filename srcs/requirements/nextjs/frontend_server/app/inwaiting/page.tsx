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
import { gameSocket } from "../page";
import { useAuth } from "@/context/AuthContext";

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
  GameRoomId: string;
  userNicknameFirst: string;
  userIdxFirst: number;
  userNicknameSecond: string;
  userIdxSecond: number;
  successDate: Date;
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
  const [gameFirstReady, setGameFirstReady] = useState<boolean>(false);
  const [gameSecondReady, setGameSecondReady] = useState<boolean>(false);

  const BackToMain = () => {
    gameSocket.emit("game_queue_quit", authState.id, () => {
      console.log("game_queue_quit");
    });
    router.replace("/?from=game");
  };

  const handleOpenModal_redir = useCallback(() => {
    console.log("game_queue_start");
    console.log(authState.id);
    console.log("first", gameFirstReady, "second", gameSecondReady);

    if (gameFirstReady && gameSecondReady) {
      gameSocket.emit(
        "game_ready_second_answer",
        {
          userIdx: authState.id,
          serverDateTime: gameState.serverDateTime,
          clientDateTime: Date.now(),
        },
        () => console.log("game_ready_second_answer")
      );
    }
  }, [gameFirstReady, gameSecondReady]);

  useEffect(() => {
    setClient(true);
    const preventGoBack = (e: PopStateEvent) => {
      e.preventDefault();
      toggle();
    };

    history.pushState(null, "", location.href);
    window.addEventListener("popstate", preventGoBack);

    if (gameState.gameMode !== GameType.FRIEND) {
      gameSocket.on("game_queue_success", () => {});
      gameSocket.on("game_queue_quit", () => {});
    }

    gameSocket.on("game_ready_first", (gameSetting: IGameSetting) => {
      console.log("game_ready_first");
      gameDispatch({ type: "SET_GAME_MODE", value: gameSetting.gameType });
      gameDispatch({
        type: "SET_BALL_SPEED_OPTION",
        value: gameSetting.speed,
      });
      gameDispatch({
        type: "SET_MAP_TYPE",
        value: gameSetting.mapNumber,
      });
      setGameFirstReady(true);
    });
    gameSocket.on(
      "game_ready_second",
      ({
        roomId,
        serverDateTime,
      }: {
        roomId: string;
        serverDateTime: number;
      }) => {
        console.log("game_ready_second");
        gameDispatch({
          type: "SET_ROOM_ID",
          value: roomId,
        });
        console.log("roomid", roomId, "room", gameState.roomId);
        gameDispatch({
          type: "SET_SERVER_DATE_TIME",
          value: serverDateTime,
        });
        setGameSecondReady(true);
      }
    );
    gameSocket.on("game_ready_second_answer", () => {});
    gameSocket.on(
      "game_ready_final",
      ({
        userNicknameFirst,
        userIdxFirst,
        firstLatency,
        userNicknameSecond,
        userIdxSecond,
        secondLatency,
      }: {
        userNicknameFirst: string;
        userIdxFirst: number;
        firstLatency: number;
        userNicknameSecond: string;
        userIdxSecond: number;
        secondLatency: number;
      }) => {
        console.log("game_ready_final");
        if (authState.id === userIdxFirst) {
          gameDispatch({
            type: "A_PLAYER",
            value: { nick: userNicknameFirst, id: userIdxFirst },
          });
          gameDispatch({
            type: "B_PLAYER",
            value: { nick: userNicknameSecond, id: userIdxSecond },
          });
        } else if (authState.id === userIdxSecond) {
          gameDispatch({
            type: "A_PLAYER",
            value: { nick: userNicknameFirst, id: userIdxFirst },
          });
          gameDispatch({
            type: "B_PLAYER",
            value: { nick: userNicknameSecond, id: userIdxSecond },
          });
        }
        const latency = firstLatency - secondLatency;
        gameDispatch({
          type: "SET_LATENCY",
          value: latency < 0 ? -latency : latency,
        });
      }
    );
    gameSocket.on(
      "game_start",
      ({
        animationStartDate,
        ballDegreeX,
        ballDegreeY,
        ballNextPosX,
        ballNextPosY,
        ballExpectedEventDate,
      }: {
        animationStartDate: number;
        ballDegreeX: number;
        ballDegreeY: number;
        ballNextPosX: number;
        ballNextPosY: number;
        ballExpectedEventDate: number;
      }) => {
        console.log("game_start");
        gameDispatch({
          type: "SET_SERVER_DATE_TIME",
          value: animationStartDate,
        });
        gameDispatch({
          type: "SET_DEGREE",
          value: { x: ballDegreeX, y: ballDegreeY },
        });
        setOpenModal(true);
        setTimeout(() => {
          router.replace("./gameplaying");
        }, 2000);
      }
    );

    return () => {
      window.removeEventListener("popstate", preventGoBack);
      gameSocket.off("game_queue_success");
      gameSocket.off("game_queue_quit");
      gameSocket.off("game_ready_first");
      gameSocket.off("game_ready_second");
      gameSocket.off("game_ready_second_answer");
      gameSocket.off("game_ready_final");
      gameSocket.off("game_start");
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
            <Typography sx={{ fontSize: "3rem" }}>
              상대방을 기다리고있습니다...
            </Typography>
            <Button variant="contained" onClick={handleOpenModal_redir}>
              큐가잡힌경우
            </Button>
            <Modals
              isShowing={isShowing}
              hide={toggle}
              message={`뒤로 가면 큐가 취소됩니다. 그래도 뒤로 가시겠습니까?`}
              routing="/?from=game"
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
                      매칭되었습니다
                    </CardContent>
                  </CardContent>
                </Card>
                {gameState.gameMode == GameType.RANK ? (
                  <>
                    {" "}
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
                        잠시후 게임화면으로 이동합니다.
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <>
                    {" "}
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
                        잠시후 옵션 선택으로 이동합니다.
                      </CardContent>
                    </Card>
                  </>
                )}
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
            취소하고 메인으로가기
          </Button>
        </CardContent>
      </Stack>
    </Card>
  );
};

export default Inwaiting;
