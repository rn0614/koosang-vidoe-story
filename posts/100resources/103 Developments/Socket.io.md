---
title: Socket.io
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: Socket.io를 통한 변경적용
tags:
  - Front/React/Library
date: 2024/09/22 00:00:00
last_modified_at: 2024/09/22 00:00:00
---
## 개요
socket.io 와 express 를 사용하여 임시로 socket.io 서버를 만들 수 있다.
이렇게 만든 소스를 통해서 

```js
const express = require("express");
const http = require("http");
const { Server: SocketIOServer } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Socket.IO 서버 설정
let io;
const rooms = {};

// Socket.IO 초기화
io = new SocketIOServer(server, {
  path: "/socket", // 소켓 경로 설정
  cors: {
    origin: "*", // CORS 허용 (필요에 따라 설정)
    methods: ["GET", "POST"],
  },
});


// 소켓 연결 처리
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // 방 목록 요청 처리
  socket.on("getRoomList", () => {
    const roomList = Object.keys(rooms);
    socket.emit("roomList", roomList);
  });

  // 방에 참가
  socket.on("joinRoom", ({ chatId }) => {
    socket.join(chatId);

    // 해당 방에 아무도 없으면 방장으로 설정
    if (!rooms[chatId]) {
      rooms[chatId] = {
        owner: socket.id,
        users: new Set([socket.id]),
        elements: [],
      };
      socket.emit("setOwner", true); // 클라이언트에 방장임을 알림
    } else {
      rooms[chatId].users.add(socket.id);
      socket.emit("setOwner", false); // 클라이언트에 방장이 아님을 알림
      socket.emit("initializeDrawing", rooms[chatId].elements);
    }
    console.log(`User ${socket.id} joined room ${chatId}`);
  });

  socket.emit("initializeDrawing", () => {
    console.log("initializeDrawing emit");
  });
  // 드로잉 초기화
  socket.on("initializeDrawing", () => {
    console.log("initializeDrawing on");
    socket.emit("initializeDrawing", rooms[chatId].elements);
  });

  // 메시지 전송
  socket.on("chatMessage", ({ chatId, message }) => {
    io.to(chatId).emit("chatMessage", message);
  });

  // 방장이 그린 요소를 브로드캐스트
  socket.on("drawingUpdate", ({ chatId, elements }) => {
    if (rooms[chatId]?.owner === socket.id) {
      rooms[chatId].elements = elements;
      socket.to(chatId).emit("drawingUpdate", elements);
    }
  });

  // 유저가 나갔을 때 처리
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);

    // 방에서 나가고 방이 빈 경우 폐기
    Object.keys(rooms).forEach((chatId) => {
      rooms[chatId]?.users.delete(socket.id);

      if (rooms[chatId]?.users.size === 0) {
        console.log(`Deleting empty room ${chatId}`);
        delete rooms[chatId];
      }
    });
  });
});

// Express 기본 라우트 설정
app.get("/", (req, res) => {
  res.send("Socket.IO chat server is running");
});

// 서버 실행
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

```