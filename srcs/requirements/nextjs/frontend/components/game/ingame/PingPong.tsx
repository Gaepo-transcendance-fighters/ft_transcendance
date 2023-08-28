"use client";

import GameBoard from "./GameBoard";
import GamePaddle from "./GamePaddle";
import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import GameBall from "./GameBall";
import { useGame, resetGameContextData } from "@/context/GameContext";

interface ICor {
  x: number;
  y: number;
}

interface IPaddle extends ICor {}

interface IBall extends ICor {}

const startDirection: ICor[] = [
  { x: 1, y: 1 },
  { x: 1, y: 2 },
  { x: 2, y: 1 },
  { x: -1, y: 1 },
  { x: -1, y: 2 },
  { x: -2, y: 1 },
];

const PingPong = () => {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const requireAnimationRef = useRef(0);

  const [ready, setReady] = useState(false);
  const [myPaddle, setMyPaddle] = useState<IPaddle>({ x: -470, y: 0 });
  const [enemyPaddle, setEnemyPaddle] = useState<IPaddle>({ x: 470, y: 0 });
  const [ball, setBall] = useState<IBall>({ x: 0, y: 0 });
  const [direction, setDirection] = useState({ x: 1, y: 1 });
  const [ballStandard, setBallStandard] = useState(0);
  const [paddleStandard, setPaddleStandard] = useState(0);

  const handlePaddle = useCallback(
    (e: KeyboardEvent) => {
      const now = new Date().getTime();
      if (now >= paddleStandard + state.latency) {
        if (e.code === "ArrowUp") {
          setMyPaddle((prev) => {
            const newY = prev.y - 20;
            if (newY < -200) {
              return prev;
            }
            return { ...prev, y: newY };
          });
        } else if (e.code === "ArrowDown") {
          setMyPaddle((prev) => {
            const newY = prev.y + 20;
            if (newY > 200) {
              return prev;
            }
            return { ...prev, y: newY };
          });
        }
        const newPaddleStandard = new Date().getTime();
        setPaddleStandard(newPaddleStandard);
      }
    },
    [myPaddle.y, state.latency]
  );

  const randomDirection = () => {
    const randomNumber = Math.floor(Math.random() * 6);
    const newDirection = startDirection[randomNumber];
    setDirection((prev) => {
      return { ...prev, x: newDirection.x, y: newDirection.y };
    });
  };

  const resetBall = () => {
    setBall((prev) => {
      return { ...prev, x: 0, y: 0 };
    });
  };

  const resetDerection = () => {
    setDirection((prev) => {
      return { ...prev, x: 1, y: 1 };
    });
  };

  const gameStart = () => {
    setTimeout(() => {
      randomDirection();
      const now = new Date().getTime();
      setBallStandard(now);
      setPaddleStandard(now);
      setReady(true);
    }, 2000 + state.latency);
  };

  const ballMove = useCallback(() => {
    const now = new Date().getTime();

    if (now >= ballStandard + state.latency) {
      const newLocation = {
        x: ball.x + direction.x * state.ballSpeedOption,
        y: ball.y + direction.y * state.ballSpeedOption,
      };

      if (
        newLocation.x > myPaddle.x &&
        newLocation.x < myPaddle.x + 20 &&
        newLocation.y > myPaddle.y - 20 &&
        newLocation.y < myPaddle.y + 20
      )
        setDirection((prev) => ({ x: -prev.x, y: 1 }));
      else if (
        newLocation.x > enemyPaddle.x - 20 &&
        newLocation.x < enemyPaddle.x &&
        newLocation.y > enemyPaddle.y - 20 &&
        newLocation.y < enemyPaddle.y + 20
      )
        setDirection((prev) => ({ x: -prev.x, y: 1 }));
      else if (
        newLocation.x > myPaddle.x &&
        newLocation.x < myPaddle.x + 20 &&
        newLocation.y > myPaddle.y - 50 &&
        newLocation.y < myPaddle.y + 50
      )
        setDirection((prev) => ({ x: -prev.x, y: 2 }));
      else if (
        newLocation.x > enemyPaddle.x - 20 &&
        newLocation.x < enemyPaddle.x &&
        newLocation.y > enemyPaddle.y - 50 &&
        newLocation.y < enemyPaddle.y + 50
      )
        setDirection((prev) => ({ x: -prev.x, y: 2 }));

      if (newLocation.y <= -250 || newLocation.y >= 250)
        setDirection((prev) => ({ x: prev.x, y: -prev.y }));

      if (newLocation.x <= -500) {
        dispatch({ type: "B_SCORE", value: state.bScore });
        resetBall();
        resetDerection();
        setReady(false);
        return;
      }
      if (newLocation.x > 500) {
        dispatch({ type: "A_SCORE", value: state.aScore });
        resetBall();
        resetDerection();
        setReady(false);
        return;
      }
      setBall(newLocation);

      const newBallStandard = new Date().getTime();
      setBallStandard(newBallStandard);
    }
    requireAnimationRef.current = requestAnimationFrame(ballMove);
  }, [ball]);

  useEffect(() => {});

  useEffect(() => {
    if (state.aScore === 5 || state.bScore === 5) {
      dispatch({ type: "GAME_RESET", value: resetGameContextData() });
      router.push("/gameresult");
    }
  }, [state.aScore, state.bScore]);

  useEffect(() => {
    dispatch({ type: "SET_LATENCY", value: 12 });
    if (!ready) return gameStart();

    window.addEventListener("keydown", handlePaddle);

    requireAnimationRef.current = requestAnimationFrame(ballMove);

    return () => {
      window.removeEventListener("keydown", handlePaddle);
      cancelAnimationFrame(requireAnimationRef.current);
    };
  }, [handlePaddle, ballMove, ready]);

  return (
    <>
      <GameBoard />
      <GamePaddle x={myPaddle.x} y={myPaddle.y} />
      <GamePaddle x={enemyPaddle.x} y={enemyPaddle.y} />
      <GameBall x={ball.x} y={ball.y} />
    </>
  );
};

export default PingPong;
