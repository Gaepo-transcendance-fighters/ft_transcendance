import { Button } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";

const GameStartButton = () => {
  const router = useRouter();

  const onClick = () => {
    router.push("./game");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "normal",
      }}
    >
      <Button
        onClick={onClick}
        variant="outlined"
        style={{
          padding: "40px 60px",
          borderRadius: "15px",
          border: "10px solid",
          backgroundColor: "white",
        }}
      >
        <Image
          src="/CrazyPong.png"
          alt="offline"
          width={250}
          height={150}
        ></Image>
      </Button>
    </div>
  );
};

export default GameStartButton;
