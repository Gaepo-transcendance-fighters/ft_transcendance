import { Box } from "@mui/material";
import Image from "next/image";
import { useGame } from "@/context/GameContext";

const GamePaddle = ({ x, y }: { x: number; y: number }) => {
  const { gameState } = useGame();
  return (
    <Box
      component={"div"}
      sx={{
        position: "absolute",
        width: "20px",
        height: "80px",
        backgroundColor: "grey",
        transform: `translate(${x}px, ${y}px)`,
        transition: "transform 50ms linear",
        boxShadow: "inset 6px 30px 0px 0px rgba(0, 0, 0, 0.4)",
        zIndex: 3,
      }}
    >
      <Image
        src={
          gameState.mapType === 0
            ? "/map/paddle/map1.png"
            : gameState.mapType === 1
            ? "/map/paddle/map2.png"
            : "/map/paddle/map3.png"
        }
        alt="paddle"
        width={20}
        height={80}
        style={{
          filter: gameState.mapType === 1 ? "brightness(0.6)" : "",
          zIndex: 2,
        }}
      />
    </Box>
  );
};

export default GamePaddle;
