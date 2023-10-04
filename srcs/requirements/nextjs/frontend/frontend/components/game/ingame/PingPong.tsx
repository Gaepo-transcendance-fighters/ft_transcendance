"use client";

import GameBoard from "./GameBoard";
import GamePaddle from "./GamePaddle";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Image from "next/image";
import GameBall from "./GameBall";
import { Stack } from "@mui/material";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ReturnMsgDto } from "@/type/RoomType";
import WaterBomb from "./WaterBomb";
import secureLocalStorage from "react-secure-storage";

enum EGameStatus {
  ONGOING,
  END,
  JUDGE,
}

interface IGameProps {
  ballX: number;
  ballY: number;
  paddle1: number; // 현재 위치
  paddle2: number; // 현재 위치
  serverTime: number; // ms 단위로, ping check 용 targetFrame: number, // 가변 프레임을 생각하고 집어넣음
  cntPerFrame: number; // 1 - 60 까지 계속 반복됨
}

interface IGameEnd {
  userIdx1: number;
  userScore1: number;
  userIdx2: number;
  userScore2: number;
  issueDate: number;
  gameStatus: EGameStatus; // 게임 속행, 게임 종료, 연결문제 판정승, 0, 1, 2
  winnerIdx: number | null;
}

const win = (
  <Image
    style={{ position: "absolute", zIndex: 7 }}
    src="/win.png"
    width="400"
    height="200"
    alt="win"
    key="win"
  />
);

const lose = (
  <Image
    style={{ position: "absolute", zIndex: 7 }}
    src="/lose.png"
    width="400"
    height="200"
    alt="lose"
    key="lose"
  />
);

const water_end_up_up = (
  <Image
    style={{
      margin: 0,
      padding: 0,
    }}
    src="/water_up.png"
    width="50"
    height="50"
    alt="water end"
    key="water_end_up_up"
  />
);

const water_end_down_up = (
  <Image
    style={{
      transform: "rotate(180deg)",
      margin: 0,
      padding: 0,
    }}
    src="/water_up.png"
    width="50"
    height="50"
    alt="water end"
    key="water_end_down_up"
  />
);

const water_up = (
  <Image
    style={{
      margin: 0,
      padding: 0,
    }}
    src="/water.png"
    width="50"
    height="50"
    alt="water"
    key="water_up"
  />
);

const water_end_up_down = (
  <Image
    src="/water_up.png"
    width="50"
    height="50"
    alt="water end"
    key="water_end_up_up"
  />
);

const water_end_down_down = (
  <Image
    style={{
      transform: "rotate(180deg)",
    }}
    src="/water_up.png"
    width="50"
    height="50"
    alt="water end"
    key="water_end_down_up"
  />
);

const water_down = (
  <Image
    style={{
      margin: 0,
      padding: 0,
    }}
    src="/water.png"
    width="50"
    height="50"
    alt="water"
    key="water_up"
  />
);

const images_up = [water_end_up_up, water_up, water_end_down_up];
const images_down = [water_end_up_down, water_down, water_end_down_down];

const PingPong = () => {
  const [isWin, setIsWin] = useState<boolean>(false);
  const [isFinish, setIsFinish] = useState<boolean>(false);
  const [client, setClient] = useState(false);
  const router = useRouter();
  const { gameState, gameDispatch } = useGame();
  const { authState } = useAuth();
  const [keyboard, setKeyboard] = useState(0);
  const [waterbombup, setWaterbombup] = useState<JSX.Element[]>([]);
  const [waterbombdown, setWaterbombdown] = useState<JSX.Element[]>([]);
  const [gameProps, setGameProps] = useState<IGameProps>({
    ballX: 0,
    ballY: 0,
    paddle1: 0,
    paddle2: 0,
    serverTime: 0,
    cntPerFrame: 0,
  });

  const upPaddle = (e: KeyboardEvent) => {
    e.preventDefault();
    if (e.code === "ArrowUp") {
      setKeyboard(0);
    } else if (e.code === "ArrowDown") {
      setKeyboard(0);
    }
  };

  const downPaddle = (e: KeyboardEvent) => {
    e.preventDefault();
    if (e.code === "ArrowUp") {
      setKeyboard(1);
    } else if (e.code === "ArrowDown") {
      setKeyboard(-1);
    }
  };

  useEffect(() => {
    if (!authState.gameSocket)
      return console.log("no connection to gamesocket");

    setClient(true);

    authState.gameSocket.on("game_start", (res) => {
      // console.log("game_start")
      setWaterbombup([]);
      setWaterbombdown([]);
    });

    authState.gameSocket.on(
      "game_ping",
      ({ serverTime }: { serverTime: number }) => {
        const now = new Date().getTime();
        authState.gameSocket!.emit(
          "game_ping_receive",
          {
            userIdx: parseInt(secureLocalStorage.getItem("idx") as string),
            serverTime: serverTime,
            clientTime: now,
          },
          (res: ReturnMsgDto) => {
            if (res.code === 200) {
              // console.log("good ping");
            } else if (res.code === 400) console.log("bad ping");
          }
        );
      }
    );

    // authState.gameSocket.emit("game_frame");
    authState.gameSocket.on("game_frame", (res: IGameProps) => {
      setGameProps(res);
      authState.gameSocket!.emit("game_move_paddle", {
        userIdx: parseInt(secureLocalStorage.getItem("idx") as string),
        paddle: keyboard,
        serverTime: gameProps.serverTime,
        clientTime: Date.now(),
        cntPerFrame: gameProps.cntPerFrame,
      });
    });

    authState.gameSocket.on(
      "game_move_paddle",
      ({ code, msg }: { code: number; msg: string }) => {
        if (code === 200) {
          console.log("success");
        }
      }
    );

    authState.gameSocket.on("game_pause_score", (data: IGameEnd) => {
      setWaterbombup(images_up);
      setWaterbombdown(images_down);
      console.log("on");
      if (
        data.gameStatus === EGameStatus.END ||
        data.gameStatus === EGameStatus.JUDGE
      ) {
        setIsFinish(true);
        gameDispatch({ type: "A_SCORE", value: data.userScore1 });
        gameDispatch({ type: "B_SCORE", value: data.userScore2 });
        if (
          data.userIdx1 ===
          parseInt(secureLocalStorage.getItem("idx") as string)
        ) {
          if (data.userScore1 > data.userScore2) {
            setIsWin(true);
          } else if (data.userScore1 < data.userScore2) {
            setIsWin(false);
          } else {
            if (data.userIdx1 === data.winnerIdx) setIsWin(true);
            else setIsWin(false);
          }
        } else {
          if (data.userScore1 > data.userScore2) {
            setIsWin(false);
          } else if (data.userScore1 < data.userScore2) {
            setIsWin(true);
          } else {
            if (data.userIdx2 === data.winnerIdx) setIsWin(true);
            else setIsWin(false);
          }
        }
        setTimeout(() => {
          setIsFinish(false);
          router.replace("/gameresult");
        }, 3000);
        // return;
      }
      authState.gameSocket!.emit(
        "game_pause_score",
        { userIdx: parseInt(secureLocalStorage.getItem("idx") as string) },
        (res: ReturnMsgDto) => {
          console.log("emit");
          if (res.code === 200) {
            gameDispatch({ type: "A_SCORE", value: data.userScore1 });
            gameDispatch({ type: "B_SCORE", value: data.userScore2 });
          }
        }
      );
    });

    window.addEventListener("keydown", downPaddle);
    window.addEventListener("keyup", upPaddle);

    return () => {
      if (!authState.gameSocket)
        return console.log("no connection to gamesocket");
      authState.gameSocket.off("game_start");
      authState.gameSocket.off("game_frame");
      authState.gameSocket.off("game_move_paddle");
      authState.gameSocket.off("game_pause_score");
      authState.gameSocket.off("game_ping");
      authState.gameSocket.off("game_ping_receive");

      window.removeEventListener("keydown", downPaddle);
      window.removeEventListener("keyup", upPaddle);
    };
  }, [keyboard, waterbombup, waterbombdown]);

  if (!client) return <></>;

  return (
    <>
      <div
        style={{
          padding: "49px",
          backgroundImage: `url("/map/wall/${
            gameState.mapType === 0
              ? "map1"
              : gameState.mapType === 1
              ? "map2"
              : "map3"
          }.png")`,
          backgroundRepeat: "repeat",
          backgroundSize: "50.2px 50.24px",
        }}
      >
        <GameBoard />
      </div>
      {isFinish && (isWin ? win : lose)}

      <Stack
        style={{
          padding: 0,
          margin: 0,
          zIndex: 4,
          transform: `translate(${gameProps.ballX}px, ${gameProps.ballY}px)`,
          position: "absolute",
        }}
      >
        <WaterBomb up={waterbombup} down={waterbombdown} />
      </Stack>
      <GamePaddle x={-470} y={gameProps.paddle1} />
      <GamePaddle x={470} y={gameProps.paddle2} />
      <GameBall x={gameProps.ballX} y={gameProps.ballY} />
    </>
  );
};

export default PingPong;
