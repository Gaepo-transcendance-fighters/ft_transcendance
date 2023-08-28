"use client";

import { Card, Typography, Stack, Tooltip } from "@mui/material";
import Image from "next/image";
import FriendProfile from "./FriendProfile";
import { main } from "@/font/color";

const loginOn = <Image src="/logon1.png" alt="online" width={10} height={10} />;

const loginOff = (
  <Image src="/logoff.png" alt="offline" width={10} height={10} />
);

interface IUserProp {
  friendNickname: string;
  isOnline: boolean;
  targetNickname?: string;
  targetIdx?: number;
}

const Friend = ({ prop }: { prop: IUserProp }) => {
  return (
    <>
      <Card sx={{ margin: 1, backgroundColor: main.main0 }}>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <Tooltip
            title={
              !prop.targetNickname ? prop.friendNickname : prop.targetNickname
            }
            arrow
          >
            <Typography
              margin={1}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {!prop.targetNickname ? prop.friendNickname : prop.targetNickname}
            </Typography>
          </Tooltip>
          <Stack direction={"row"} alignItems={"center"}>
            {prop.isOnline ? loginOn : loginOff}
            <FriendProfile prop={prop} />
          </Stack>
        </Stack>
      </Card>
    </>
  );
};

export default Friend;
