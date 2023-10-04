import Image from "next/image";

const GameBall = ({ x, y }: { x: number; y: number }) => {
  return (
    <Image
      src="/gif/waterBallon.gif"
      alt="pingpong ball"
      width={80}
      height={80}
      style={{
        position: "absolute",
        transform: `translate(${x}px, ${y}px)`,
        // transition: "transform 50ms linear",
        zIndex: 3,
      }}
    />
  );
};

export default GameBall;
