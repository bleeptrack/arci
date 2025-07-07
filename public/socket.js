import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

export const socket = io(window.location.origin + "/control");
