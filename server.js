const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let users = {}; 

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

io.on('connection', (socket) => {
    socket.on('login', (data) => {
        users[socket.id] = { ...data, id: socket.id }; 
        io.emit('user list', Object.values(users));
        // ✅ 加入上線通知
        io.emit('chat message', { user: "系統", text: `✨ ${data.name} 來到聊天室了 (Hecke!)`, color: "#F57C00" });
    });

    socket.on('update user', (data) => {
        if (users[socket.id]) {
            users[socket.id] = { ...users[socket.id], ...data };
            io.emit('user list', Object.values(users));
        }
    });

    socket.on('chat message', (data) => {
        io.emit('chat message', data);
    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            // ✅ 加入下線通知
            io.emit('chat message', { user: "系統", text: `💤 ${users[socket.id].name} 回去窩裡睡覺了...`, color: "#9E9E9E" });
            delete users[socket.id];
        }
        io.emit('user list', Object.values(users));
    });
});

http.listen(3000, () => console.log('✅ 哈姆伺服器已就緒'));
