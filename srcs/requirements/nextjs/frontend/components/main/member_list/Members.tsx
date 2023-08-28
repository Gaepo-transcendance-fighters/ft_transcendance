"use client";

import Member from "./Member";
import "@/components/main/member_list/MemberList.css";
import { useRoom } from "@/context/RoomContext";
import { IMember, Mode } from "@/type/type";
import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";

export default function Members() {
  const { roomState } = useRoom();
  const { userState } = useUser();
  const [mem1, setMem1] = useState<IMember>({
    userIdx: roomState.currentDmRoomMemberList?.userIdx1,
    nickname: roomState.currentDmRoomMemberList?.userNickname1,
    imgUri: userState.imgUri,
  });
  const [mem2, setMem2] = useState<IMember>({
    userIdx: roomState.currentDmRoomMemberList?.userIdx2,
    nickname: roomState.currentDmRoomMemberList?.userNickname2,
    imgUri: roomState.currentDmRoomMemberList?.imgUri,
  });

  useEffect(() => {
    setMem1({
      userIdx: roomState.currentDmRoomMemberList?.userIdx1,
      nickname: roomState.currentDmRoomMemberList?.userNickname1,
      imgUri: userState.imgUri,
    });
    setMem2({
      userIdx: roomState.currentDmRoomMemberList?.userIdx2,
      nickname: roomState.currentDmRoomMemberList?.userNickname2,
      imgUri: roomState.currentDmRoomMemberList?.imgUri,
    });
  }, [roomState.currentRoom]);

  return (
    <div className="memlist">
      <div>
        {roomState.currentRoom?.mode === Mode.PRIVATE ? (
          <>
            <div>
              <Member person={mem1} />
            </div>
            <div>
              <Member person={mem2} />
            </div>
          </>
        ) : (
          roomState.currentRoomMemberList.map((person, idx) => (
            <div key={idx}>
              <Member idx={idx} person={person} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
