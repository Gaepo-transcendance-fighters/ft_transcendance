"use client";
import { ThemeProvider } from "@emotion/react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Modal,
  createTheme,
  Typography,
} from "@mui/material";

import { useRouter } from "next/navigation";
import { main } from "@/type/type";
import { useEffect, useState } from "react";
import PingPong from "@/components/game/ingame/PingPong";
import { resetGameContextData, useGame } from "@/context/GameContext";

const font = createTheme({
  typography: {
    fontFamily: "neodgm",
  },
});
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

const GamePlaying = () => {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [openModal, setOpenModal] = useState<boolean>(false);

  const ClickNomalGame = () => {
    router.push("./optionselect");
  };

  const BackToMain = () => {
    router.push("/");
    dispatch({ type: "SCORE_RESET", value: resetGameContextData() });
  };

  const handleOpenModal_redir = () => {
    setOpenModal(true);
    setTimeout(() => {
      router.push("./gameresult");
    }, 2000);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    dispatch({ type: "SCORE_RESET", value: resetGameContextData() });
  }, []);

  return (
    <ThemeProvider theme={font}>
      <Card sx={{ display: "flex" }}>
        <Stack
          sx={{
            width: "100%",
            height: "100vh",
            backgroundColor: main.main1,
            padding: 0,
            margin: 0,
          }}
        >
          <Button
            onClick={() => {
              return router.push("./gameresult");
            }}
          >
            결과창보기
          </Button>
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
                {state.aScore} : {state.bScore}
              </Typography>
            </Card>
          </CardContent>

          <CardContent sx={{ transform: "translateX(3%)" }}>
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
              {/* <Pong /> */}
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
                height: "5vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid black",
                backgroundColor: "#05BEFF",
              }}
            >
              Mode: {state.gameMode} || Speed: {state.ballSpeedOption} || Map:{" "}
              {state.mapType}
            </Card>
            <Button variant="contained" onClick={handleOpenModal_redir}>
              상대방 탈주시
            </Button>
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
                    안내메세지
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
                    상대방이탈주했습니다. 결과페이지로 이동합니다
                  </CardContent>
                </Card>
              </Box>
            </Modal>
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
              onClick={BackToMain}
            >
              도망가기
            </Button>
          </CardContent>
        </Stack>
      </Card>
    </ThemeProvider>
  );
};
export default GamePlaying;
