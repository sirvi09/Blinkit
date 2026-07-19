import { io } from "socket.io-client";

console.log("socket.js loaded");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Socket Connected:", socket.id);
});

export default socket;