"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { Stack } from "@mui/material";

//물풍선이 터지는 효과

const WaterBomb = ({
  up,
  down,
}: {
  up: JSX.Element[];
  down: JSX.Element[];
}) => {
  const [upImage, setUpImage] = useState(up);
  const [downImage, setDownImage] = useState(down);

  const handleAnimationUpEnd = (index: number) => {
    setUpImage((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnimationDownEnd = (index: number) => {
    setDownImage((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    setUpImage(up);
    setDownImage(down);
  }, [up, down]);

  return (
    <>
      {upImage.map((image, id) => (
        <div
          style={{
            margin: 0,
            padding: 0,
          }}
          key={id + 100}
          className={styles.moveAndFadeUp}
          onAnimationEnd={() => handleAnimationUpEnd(id + 100)}
        >
          {image}
        </div>
      ))}

      {downImage.map((image, id) => (
        <div
          style={{
            margin: 0,
            padding: 0,
          }}
          key={id}
          className={styles.moveAndFadeDown}
          onAnimationEnd={() => handleAnimationDownEnd(id)}
        >
          {image}
        </div>
      ))}
    </>
  );
};

export default WaterBomb;
