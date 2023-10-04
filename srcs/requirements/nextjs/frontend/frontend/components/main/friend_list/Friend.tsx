"use client";

import { Card, Typography, Stack, Tooltip } from "@mui/material";
import Image from "next/image";
import FriendProfile from "./FriendProfile";
import { main } from "@/font/color";
import { useEffect } from "react";
import { IFriend, IOnlineStatus } from "@/type/type";

const loginOn = (
  <Image src="/status/logon.png" alt="online" width={10} height={10} />
);

const loginOff = (
  <Image src="/status/logoff.png" alt="offline" width={10} height={10} />
);

const playing = (
  <Image src="/status/gameplaying.png" alt="playing" width={10} height={10} />
);

const Friend = ({ prop }: { prop: IFriend }) => {
  return (
    <>
      <Card sx={{ margin: 1, backgroundColor: main.main0 }}>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <Tooltip title={prop.friendNickname} arrow>
            <Typography
              margin={1}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {prop.friendNickname}
            </Typography>
          </Tooltip>
          <Stack direction={"row"} alignItems={"center"}>
            {prop.isOnline === IOnlineStatus.ONLINE || prop.isOnline === IOnlineStatus.GAMEING ? loginOn : loginOff}
            <FriendProfile prop={prop as IFriend} />
          </Stack>
        </Stack>
      </Card>
    </>
  );
};

export default Friend;
