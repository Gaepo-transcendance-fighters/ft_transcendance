import { Card } from "@mui/material";
import { useGame } from "@/context/GameContext";
import zIndex from "@mui/material/styles/zIndex";

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
        padding: 0,
        backgroundRepeat: "repeat",
        backgroundSize: "100px 100px",
        position: "relative",
        minWidth: "1000px",
        maxWidth: "1000px",
        minHeight: "500px",
        border: "1px solid black",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        boxShadow: "inset 0px 15px 20px 0px rgba(0, 0, 0, 0.4)",
      }}
      sx={{ zIndex: 2 }}
    >
      <div
        style={{
          borderLeftWidth: "3px",
          borderLeftStyle: "dashed",
          borderLeftColor: "black",
          height: "500px",
        }}
      ></div>
    </Card>
  );
};

export default GameBoard;
