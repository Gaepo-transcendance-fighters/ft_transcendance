"use client";

import { ThemeProvider } from "@emotion/react";
import {
  Button,
  Card,
  CardContent,
  Stack,
  createTheme,
  Typography,
} from "@mui/material";

const font = createTheme({
  typography: {
    fontFamily: "neodgm",
  },
});
import { useRouter } from "next/navigation";
import { main } from "@/type/type";
import { useGame } from "@/context/GameContext";
import { useEffect } from "react";
import { resetGameContextData } from "@/context/GameContext";

const GameResult = () => {
  const { state, dispatch } = useGame();

  const router = useRouter();

  const BackToMain = () => {
    dispatch({ type: "SCORE_RESET", value: resetGameContextData() });
    router.push("/");
  };

  useEffect(() => {}, []);

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
              <Typography sx={{ fontSize: "3rem" }}>Result</Typography>
            </Card>
          </CardContent>

          <CardContent>
            <Card
              sx={{ display: "flex", gap: "10%", flexDirection: "row" }}
              style={{
                width: "100%",
                height: "65vh",
                border: "2px solid black",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: main.main3,
              }}
            >
              <Card
                style={{
                  width: "35%",
                  height: "70%",
                  border: "2px solid black",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  fontSize: "2rem",
                  backgroundColor: "#49EC62",
                }}
              >
                <Stack
                  sx={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    gap: "8vh",
                    flexDirection: "column",
                  }}
                >
                  <Card
                  //   닉네임 클릭시, 프로필 모달 띄우는 파트
                  //   onClick={}
                  >
                    <Typography sx={{ fontSize: "2rem" }}>
                      MY NICK NAME
                    </Typography>
                  </Card>
                  <Card>
                    <Typography sx={{ fontSize: "2rem" }}>
                      {state.aScore}
                    </Typography>
                  </Card>
                  <Card
                    sx={{ minWidth: "max-content" }}
                    style={{
                      width: "80%",
                      height: "70%",
                      border: "2px solid black",
                      fontSize: "1.5rem",
                      backgroundColor: "White",
                    }}
                  >
                    <Stack
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "center",
                      }}
                    >
                      <Typography sx={{ fontSize: "2rem" }}>
                        Win Rate: 70%
                      </Typography>
                    </Stack>
                    <Stack
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "center",
                      }}
                    >
                      <Typography sx={{ fontSize: "2rem" }}>100W 0L</Typography>
                    </Stack>
                  </Card>
                </Stack>
              </Card>
              <Card
                style={{
                  width: "35%",
                  height: "70%",
                  border: "2px solid black",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  fontSize: "2rem",
                  backgroundColor: "#FF6364",
                }}
              >
                <Stack
                  sx={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    gap: "8vh",
                    flexDirection: "column",
                  }}
                >
                  <Card
                  //   닉네임 클릭시, 프로필 모달 띄우는 파트
                  //   onClick={}
                  >
                    <Typography sx={{ fontSize: "2rem" }}>
                      O_NICK NAME
                    </Typography>
                  </Card>
                  <Card>
                    <Typography sx={{ fontSize: "2rem" }}>
                      {state.bScore}
                    </Typography>
                  </Card>
                  <Card
                    sx={{ minWidth: "max-content" }}
                    style={{
                      width: "80%",
                      height: "70%",
                      border: "2px solid black",
                      fontSize: "1.5rem",
                      backgroundColor: "White",
                    }}
                  >
                    <Stack
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "center",
                      }}
                    >
                      <Typography sx={{ fontSize: "2rem" }}>
                        Win Rate: 70%
                      </Typography>
                    </Stack>
                    <Stack
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "center",
                      }}
                    >
                      <Typography sx={{ fontSize: "2rem" }}>100W 0L</Typography>
                    </Stack>
                  </Card>
                </Stack>
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
            <Button
              style={{
                width: "30%",
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
              메인화면으로 돌아가기
            </Button>
          </CardContent>
        </Stack>
      </Card>
    </ThemeProvider>
  );
};
export default GameResult;
