// utils/socket.ts
import { io } from 'socket.io-client';

const socket = io('https://gigo-tracker.onrender.com');
export default socket;
