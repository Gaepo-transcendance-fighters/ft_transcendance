"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "@/components/main/room_list/RoomList.css";
import MemberList from "../member_list/MemberList";
import CreateRoomButton from "./CreateRoomButton";
import Room from "./Room";
import { useRoom } from "@/context/RoomContext";
import { IChatRoom } from "@/type/RoomType";

export default function Rooms({
  currentRoomList,
  channelType,
}: {
  currentRoomList: IChatRoom[];
  channelType: boolean;
}) {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );
  const { roomState } = useRoom();

  useEffect(() => {
    const container = document.getElementById("portal");
    setPortalContainer(container);

    return () => {
      setPortalContainer(null);
    };
  }, []);

  return (
    <>
      <div className={!roomState.isOpen ? "list" : "roomclicked"}>
        <CreateRoomButton channelType={channelType} />
        {currentRoomList?.map((room, idx) => {
          return <Room key={idx} room={room} idx={idx} />;
        })}
      </div>
      {roomState.isOpen &&
        portalContainer &&
        createPortal(<MemberList />, portalContainer)}
    </>
  );
}
