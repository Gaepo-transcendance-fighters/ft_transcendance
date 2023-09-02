"use client";

import { Button, Card, CardContent, Stack, Typography } from "@mui/material";

import { useRouter } from "next/navigation";
import { main } from "@/type/type";
import { useEffect, useState } from "react";
import PingPong from "@/components/game/ingame/PingPong";
import { useGame } from "@/context/GameContext";
import useModal from "@/hooks/useModal";
import Modals from "@/components/public/Modals";
import { gameSocket } from "../page";

const GamePlaying = () => {
  const router = useRouter();
  const [client, setClient] = useState<boolean>(false);
  const { gameState, gameDispatch } = useGame();
  const { isShowing, toggle } = useModal();
  const { isShowing: isShowing2, toggle: toggle2 } = useModal();
  const [openModal, setOpenModal] = useState<boolean>(false);

  const backToMain = () => {
    gameDispatch({ type: "SCORE_RESET" });
    gameSocket.emit("game_queue_quit", gameState.aPlayer.id);
    gameSocket.disconnect();
    router.replace("/");
  };

  useEffect(() => {
    setClient(true);
    const preventGoBack = (e: PopStateEvent) => {
      e.preventDefault();
      toggle();
    };

    const preventRefresh = (e: KeyboardEvent) => {
      e.preventDefault();
      if (
        e.key === "F5" ||
        ((e.ctrlKey === true || e.metaKey === true) && e.key === "r")
      ) {
        console.log("새로고침");
        toggle2();
        return false;
      }
    };

    const preventRefreshButton = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      router.replace("/?from=game");
    };

    history.pushState(null, "", location.href);
    addEventListener("popstate", preventGoBack);
    addEventListener("keydown", preventRefresh);
    addEventListener("beforeunload", preventRefreshButton);

    //탈주시
    // gameSocket.on("game_queue_quit", (res: number) => {
    //   console.log("상대가 나감", res);
    //   gameDispatch({ type: "A_SCORE", value: 5 });
    //   gameDispatch({ type: "B_SCORE", value: 0 });
    //   gameSocket.emit("game_get_score", {
    //     userIdx1: gameState.aPlayer.id,
    //     userScore1: 5,
    //     userIdx2: gameState.bPlayer.id,
    //     userScore2: 0,
    //     issueDate: Date.now(),
    //     gameStatus: "game_quit",
    //     winner: gameState.aPlayer.id,
    //   });
    //   setOpenModal(true);
    //   setTimeout(() => {
    //     router.replace("./gameresult");
    //   }, 2000);
    // });
    return () => {
      removeEventListener("popstate", preventGoBack);
      removeEventListener("keydown", preventRefresh);
      removeEventListener("beforeunload", preventRefreshButton);
    };
  }, []);

  if (!client) return <></>;

  return (
    <>
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
                fontSize: "3rem",
                border: "2px solid black",
              }}
            >
              <Typography sx={{ fontSize: "3rem" }}>
                {gameState.aScore} : {gameState.bScore}
              </Typography>
            </Card>
          </CardContent>

          <CardContent sx={{ mx: "auto" }}>
            <Card
              style={{
                width: "max-content",
                height: "max-content",
                border: "2px solid black",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                backgroundColor: main.main3,
              }}
            >
              <Card
                style={{
                  width: "max-content",
                  padding: "20px",
                  margin: "30px",
                  height: "15%",
                  border: "2px solid black",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                }}
              >
                Player 1
              </Card>

              <PingPong />

              <Card
                style={{
                  width: "max-content",
                  padding: "20px",
                  margin: "30px",
                  height: "15%",
                  border: "2px solid black",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                }}
              >
                Player 2
              </Card>
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
            <Card
              style={{
                width: "20%",
                height: "max-content",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid black",
                backgroundColor: "#05BEFF",
              }}
            >
              <Typography>
                Mode:{" "}
                {gameState.gameMode === 0
                  ? "Friend"
                  : gameState.gameMode === 1
                  ? "Normal"
                  : "Rank"}
                <br />
                Speed:{" "}
                {gameState.ballSpeedOption === 2
                  ? "Slow"
                  : gameState.ballSpeedOption === 3
                  ? "Normal"
                  : "Fast"}
                <br />
                Map: {gameState.mapType}
              </Typography>
            </Card>
            <Modals
              isShowing={isShowing}
              hide={toggle}
              message="뒤로가기 멈춰!"
              routing="/?from=game"
            />
            <Button onClick={() => setOpenModal(true)}>탈주시</Button>
            <Modals
              isShowing={openModal}
              message="상대방이 탈주했습니다. 결과페이지로 이동합니다"
            />
            <Modals
              isShowing={isShowing2}
              hide={toggle2}
              message="새로고침 멈춰!"
              routing="/?from=game"
            />
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
                width: "10%",
                height: "40%",
                border: "2px solid red",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                backgroundColor: "#FB5C12",
              }}
              onClick={backToMain}
            >
              도망가기
            </Button>
          </CardContent>
        </Stack>
      </Card>
    </>
  );
};
export default GamePlaying;
