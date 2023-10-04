"use client";

import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { main } from "@/type/type";
import { useEffect, useState } from "react";
import PingPong from "@/components/game/ingame/PingPong";
import { useGame } from "@/context/GameContext";
import useModal from "@/hooks/useModal";
import Modals from "@/components/public/Modals";
import { useAuth } from "@/context/AuthContext";

const myNickname = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  width: "100px",
  padding: "20px",
  margin: "30px",
  height: "15%",
  border: "2px solid black",
  background: "orange",
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
};

const otherNickname = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  width: "100px",
  padding: "20px",
  margin: "30px",
  height: "15%",
  border: "2px solid black",
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
};

const GamePlaying = () => {
  const router = useRouter();
  const { authState } = useAuth();
  const [client, setClient] = useState<boolean>(false);
  const { gameState, gameDispatch } = useGame();
  const { isShowing, toggle } = useModal();
  const { isShowing: isShowing2, toggle: toggle2 } = useModal();
  const [openModal, setOpenModal] = useState<boolean>(false);

  useEffect(() => {
    if (!authState.gameSocket) return;
    if (authState.gameSocket?.connected)
      console.log(`[game playing page]🥳 게임 소켓 연결 상태 Good!`);
    else console.log(`[game playing page]🥺 게임 소켓 연결 BAD...`);
    setClient(true);
    const preventGoBack = (e: PopStateEvent) => {
      e.preventDefault();
      history.go(1);
      // toggle();
    };

    const preventRefresh = (e: KeyboardEvent) => {
      e.preventDefault();
      if (
        e.key === "F5" ||
        ((e.ctrlKey === true || e.metaKey === true) && e.key === "r")
      ) {
        console.log("새로고침");
        history.go(1);
        // toggle2();
        return false;
      }
    };

    const preventRefreshButton = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      authState.gameSocket?.disconnect();
      e.returnValue = "";
      router.replace("/home?from=game");
    };

    history.pushState(null, "", location.href);
    addEventListener("popstate", preventGoBack);
    addEventListener("keydown", preventRefresh);
    addEventListener("beforeunload", preventRefreshButton);

    authState.gameSocket.on("game_force_quit", () => {
      setOpenModal(true);
      setTimeout(() => {
        authState.gameSocket!.disconnect();
        setOpenModal(false);
        router.replace("/home?from=game");
      }, 3000);
    });

    return () => {
      if (!authState.gameSocket) return;
      authState.gameSocket.off("game_force_quit");
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
            sx={{
              ".MuiCardContent-root": {
                p: 0,
              },
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

          <CardContent
            sx={{
              p: 0,
              mx: "auto",
            }}
          >
            <Card
              style={{
                width: "max-content",
                height: "max-content",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                boxShadow: "none",
                backgroundColor: "transparent",
              }}
            >
              <Card
                style={
                  gameState.aPlayer.id === authState.userInfo.id
                    ? myNickname
                    : otherNickname
                }
              >
                <Typography>{gameState.aPlayer.nick}</Typography>
              </Card>
              <PingPong />

              <Card
                style={
                  gameState.bPlayer.id === authState.userInfo.id
                    ? myNickname
                    : otherNickname
                }
              >
                <Typography>{gameState.bPlayer.nick}</Typography>
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
              sx={{ px: "30px" }}
              style={{
                width: "20%",
                height: "max-content",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid black",
                backgroundColor: main.main3,
                color: "white",
                wordSpacing: "1rem",
              }}
            >
              <Typography sx={{ paddingRight: "5%" }}>
                Mode:{" "}
                {gameState.gameMode === 0
                  ? "Friend"
                  : gameState.gameMode === 1
                  ? "Normal"
                  : "Rank"}
              </Typography>
              <Typography sx={{ paddingRight: "5%" }}>
                Speed:{" "}
                {gameState.ballSpeedOption === 2
                  ? "Slow"
                  : gameState.ballSpeedOption === 3
                  ? "Normal"
                  : "Fast"}
              </Typography>
              <Typography>Map: {gameState.mapType}</Typography>
            </Card>
            <Modals
              isShowing={isShowing}
              hide={toggle}
              message="뒤로가기 멈춰!"
              routing="/home?from=game"
            />
            <Modals
              isShowing={openModal}
              message="네트워크 상태가 좋지 않습니다. 무효 처리 후 홈으로 넘어갑니다. 😢"
            />
            <Modals
              isShowing={isShowing2}
              hide={toggle2}
              message="새로고침 멈춰!"
              routing="/home?from=game"
            />
          </CardContent>
        </Stack>
      </Card>
    </>
  );
};
export default GamePlaying;
