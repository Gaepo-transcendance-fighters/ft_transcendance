"use client";

import { Card, Typography, Stack, Tooltip } from "@mui/material";
import Image from "next/image";
import BlockProfile from "./BlockProfile";
import { main } from "@/font/color";
import { useEffect } from "react";
import { IBlock, IFriend } from "@/type/type";

const Block = ({ prop }: { prop: IBlock }) => {
  return (
    <>
      <Card sx={{ margin: 1, backgroundColor: main.main0 }}>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <Tooltip title={prop.blockedNickname} arrow>
            <Typography
              margin={1}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {prop.blockedNickname}
            </Typography>
          </Tooltip>
          <Stack direction={"row"} alignItems={"center"}>
            <BlockProfile prop={prop} />
          </Stack>
        </Stack>
      </Card>
    </>
  );
};

export default Block;
