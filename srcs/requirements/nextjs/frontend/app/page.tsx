"use client";

import Layout from "@/components/public/Layout";
import { io } from "socket.io-client";

const userId =
  typeof window !== "undefined" ? localStorage.getItem("idx") : null;
export const socket = io("http://localhost:4000/chat", {
  // haryu's server
  // export const socket = io("http://paulryu9309.ddns.net:4000/chat", {
  query: { userId: userId },
});

const Page = () => {
  console.log(socket.id);
  return (
    <>
      <Layout></Layout>
    </>
  );
};

export default Page;
