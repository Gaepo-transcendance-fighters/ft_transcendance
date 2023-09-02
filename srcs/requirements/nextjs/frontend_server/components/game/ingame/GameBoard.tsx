import { Card } from "@mui/material";
import { useGame } from "@/context/GameContext";

const GameBoard = () => {
  const { gameState } = useGame();
  return (
    <Card
      style={{
        backgroundImage: `url("/map/${
          gameState.mapType === 0
            ? "map1"
            : gameState.mapType === 1
            ? "map2"
            : "map3"
        }.png")`,
        backgroundRepeat: "repeat",
        position: "relative",
        minWidth: "1000px",
        minHeight: "500px",
        border: "2px solid black",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      <div
        style={{
          borderLeftWidth: "3px",
          borderLeftStyle: "dashed",
          borderLeftColor: "grey",
          height: "500px",
        }}
      ></div>
    </Card>
  );
};

export default GameBoard;
