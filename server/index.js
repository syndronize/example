const httpServer = require("http").createServer();
const fs = require('fs');
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:8080",
  },
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  next();
});

io.on("connection", (socket) => {
  // fetch existing users
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username,
    });
  }
  socket.emit("users", users);



  // notify existing users
  socket.broadcast.emit("user connected", {
    userID: socket.id,
    username: socket.username,
  });

  // bagaimana jika ada file yang dikirim
  socket.on("private message", (message) => {

    // Check if the message contains a file
    if (message.content && message.content.name && message.content.content) {
      console.log("File message received:", message.content.name);
      socket.broadcast.emit("file message", {
        userID: socket.id,
        username: socket.username,
        file: message.content,
      });
      console.log("File message sent:", message.content.name);
    } else {

      socket.broadcast.emit("private message", {
        userID: socket.id,
        username: socket.username,
        message: message,
      });
      // console.log("Text message sent:", message);
    }
  });


  socket.on("file message", (message) => {
    // add fallback
    console.log(message.image);
    console.log(__dirname + "/../public/" + message.name);
    fs.writeFile(
      __dirname + "/../public/" + message.name,
      message.image,
      { encoding: "base64" },
      function (err) {
        console.log("File created");
      }
    );


    socket.broadcast.emit("file message", {
      userID: socket.id,
      username: socket.username,
      file: message.image,
    });
    console.log("File message sent yyy:", message);
  });

  // notify users upon disconnection
  socket.on("disconnect", () => {
    socket.broadcast.emit("user disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () =>
  console.log(`server listening at http://localhost:${PORT}`)
);
