"use client";

import {
  Card,
  CardContent,
  Modal,
  Box,
  Typography,
  Button,
} from "@mui/material";
import { createPortal } from "react-dom";
import { main } from "@/type/type";
import { useRouter } from "next/navigation";
import { gameSocket } from "@/app/page";
import { useGame } from "@/context/GameContext";

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

const Modals = ({
  isShowing,
  hide,
  message,
  routing,
}: {
  isShowing: boolean;
  hide?: () => void;
  message: string;
  routing?: string;
  from?: string;
}) => {
  const router = useRouter();
  const { gameState } = useGame();
  return isShowing
    ? createPortal(
        <Modal open={isShowing} onClose={hide}>
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
                <Typography fontSize="20px">안내메세지</Typography>
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
                <Typography>{message}</Typography>
              </CardContent>
              {routing && (
                <CardContent>
                  <Button
                    onClick={() => {
                      gameSocket.emit("game_queue_quit", gameState.aPlayer.id);
                      gameSocket.disconnect();
                      router.replace(routing);
                    }}
                  >
                    도망가기
                  </Button>
                  <Button onClick={hide}>게임하기</Button>
                </CardContent>
              )}
            </Card>
          </Box>
        </Modal>,
        document.body
      )
    : null;
};

export default Modals;
