const express = require("express");
const app = express()
const http = require("http");
const cors = require("cors");
app.use(cors());

const { Server } = require("socket.io")
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

//User Management
const users = [];
const alert = {
    room: "",
    author: "Alert!",
    message: "",
    time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes()
};

//Funtions
function getAlert(notif) {
    alert.message = notif;
    return alert;
}
function userJoin(id, username, room) {
    const user = { id, username, room };
    users.push(user);
    return user;
}
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}
function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

//Connection
io.on("connection", (socket) => {
    //On Launch, Start
    console.log(`User Connected: ${socket.id}`);

    //Join Room
    socket.on("join_room", (data) => {
        const user = userJoin(socket.id, data.username, data.room);
        socket.join(user.room);
        //Alerts
        socket.broadcast.to(user.room).emit('receive_message', getAlert(`${user.username} joined room ${user.room}`));
        console.log(`User with ID: ${socket.id} joined room: ${user.room}`);
        
        //Current users
        io.to(user.room).emit('get_users_room', getRoomUsers(user.room));
    });
2
    //Send Message
    socket.on("send_message", (message) => {
        io.to(message.room).emit("receive_message", message);
        console.log(message)
    });

    //Leave Room
    socket.on("leave_room", (data) => {
        const user = userLeave(socket.id);
        if (user) {
            //Alerts
            io.to(user.room).emit('receive_message', getAlert(`${user.username} left room ${user.room}`));
            //Current users
            io.to(user.room).emit('get_users_room', getRoomUsers(user.room));
            socket.leave(user.room);
            console.log(`User with ID: ${socket.id} left room: ${user.room}`);
        }
    });

    //Refresh Tab, Quit
    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});

server.listen(3001, () => {
    console.log("SERVER RUNNING")
});

