"use client";

import "@/components/main/room_list/RoomList.css";
import "@/components/main/member_list/MemberList.css";
import "@/components/main/room_list/ProtectedModal.css";

export default function Title({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return <div className={title}>{text}</div>;
}
