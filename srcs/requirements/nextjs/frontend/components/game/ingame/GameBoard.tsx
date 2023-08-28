import { Card } from "@mui/material";

const GameBoard = () => {
  return (
    <Card
      style={{
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
