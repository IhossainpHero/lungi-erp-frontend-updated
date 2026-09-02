// src/lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const getSocketUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  // NEXT_PUBLIC_API_URL এ "/api" থাকে, socket.io এর জন্য base URL লাগবে (সেটা বাদ দিয়ে)
  return process.env.NEXT_PUBLIC_SOCKET_URL || apiUrl.replace(/\/api\/?$/, "");
};

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(getSocketUrl(), {
      transports: ["websocket"],
      autoConnect: false,
    });
  }
  return socket;
};
