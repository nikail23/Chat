class User {
    constructor(name, password) {
        this.name = name;
        this.password = password;
        this.isActive = false;
        this.token = null;
    }
}

class Message {
    constructor(id, text, createdAt, author, isPersonal, to) {
        this.id = id;
        this.text = text;
        this.createdAt = createdAt;
        this.author = author;
        this.isPersonal = isPersonal;
        this.to = to;
    }
}

class ChatModel {
    _users = [
        new User('nikail23', 'thvjkjdbx'),
        new User('user2', 'thvjkjdbx')
    ]
    _messages = [
        new Message('0', 'Hello!', new Date(), 'nikail23', false)
    ];

    setUserActive(id, active, token) {
        this._users[id].isActive = active;
        if (token) {
            this._users[id].token = token;
        }
    }

    getUsers() {
        let result = [];
        this._users.forEach(user => {
            if (user.isActive === true) {
                result.push(user);
            }
        });
        return result;
    }

    getMessages(top, skip, filter, currentUser) {
        let messagesBuffer = this._messages.slice();

        if (filter) {
            if (filter.author) {
                for (let i = 0; i < messagesBuffer.length; i++) {
                    if (messagesBuffer[i].author.indexOf(filter.author) === -1) {
                        messagesBuffer.splice(i, 1);
                        i--;
                    }
                }
            }

            if (filter.dateFrom) {
                for (let i = 0; i < messagesBuffer.length; i++) {
                    if (messagesBuffer[i].createdAt < filter.dateFrom) {
                        messagesBuffer.splice(i, 1);
                        i--;
                    }
                }
            }

            if (filter.dateTo) {
                for (let i = 0; i < messagesBuffer.length; i++) {
                    if (messagesBuffer[i].createdAt > filter.dateTo) {
                        messagesBuffer.splice(i, 1);
                        i--;
                    }
                }
            }

            if (filter.text) {
                for (let i = 0; i < messagesBuffer.length; i++) {
                    if (messagesBuffer[i].text.indexOf(filter.text) === -1) {
                        messagesBuffer.splice(i, 1);
                        i--;
                    }
                }
            }

            function compareDates(message1, message2) {
                return message1.createdAt - message2.createdAt;
            }
            messagesBuffer.sort(compareDates);
        }

        if (currentUser) {
            for (let i = 0; i < messagesBuffer.length; i++) {
                if (messagesBuffer[i].isPersonal && messagesBuffer[i].to !== currentUser && messagesBuffer[i].author !== currentUser) {
                    messagesBuffer.splice(i, 1);
                    i--;
                }
            }
        }

        messagesBuffer = messagesBuffer.slice(skip, top + skip);

        return messagesBuffer;
    }

    addUser(name, password) {
        const user = new User(name, password);
        this._users.push(user);
        return true;
    }

    getUserIdByName(name) {
        let result = -1;
        this._users.forEach((user, index) => {
            if (user.name === name) {
                result = index;
            }
        });
        return result;
    }

    checkUser(name, password) {
        let result = false;
        this._users.forEach(user => {
            const passwordCheck = bcrypt.compareSync(password, user.password);
            if (user.name === name && passwordCheck) {
                result = true;
            }
        });
        return result;
    }

    getUserOnlineState(name) {
        let result = false;
        this._users.forEach(user => {
            if (user.name === name) {
                result = user.isActive;
            }
        });
        return result;
    }

    checkUser(name) {
        let result = false;
        this._users.forEach(user => {
            if (user.name === name) {
                result = true;
            }
        });
        return result;
    }

    checkUserToken(token) {
        let result = false;
        this._users.forEach(user => {
            console.log(user);
            console.log(token);
            if (user.token === token) {
                result = true;
            }
        });
        return result;
    }

    deleteUser(name) {
        let index = -1;
        this._users.forEach(user => {
            if (user.name === name) {
                index = this._users.indexOf(user);
            }
        });
        if (index !== -1) {
            this._users.splice(index, 1);
            return true;
        } else {
            return false;
        }
    }

    editMessage(id, text) {
        this._messages[id].text = text;
    }

    addMessage(message) {
        if (this._messages.length !== 0) {
            message.id = String(Number(this._messages[this._messages.length - 1].id) + 1);
        } else {
            message.id = 0;
        }
        message.createdAt = new Date();
        this._messages.push(message);
    }

    deleteMessage(id) {
        this._messages.splice(id, 1);
        for (let index = 0; index < this._messages.length; index++) {
            const element = this._messages[index];
            element.id = index;
        }
    }
}

const jwtSecretWord = 'yermolovich';
const chatModel = new ChatModel();

const express = require("express");
const app = express();
app.set('port', process.env.PORT || 3000);
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*"
    }
});
const cors = require('cors');
const multer = require('multer');
const upload = multer();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(cookieParser());

io.on('connection', function (socket) {
    console.log(socket.handshake.headers);

    io.emit('users', chatModel.getUsers());

    socket.on('logOut', function (currentUser) {
        chatModel.setUserActive(chatModel.getUserIdByName(currentUser), false);
        io.emit('users', chatModel.getUsers());
    });

    socket.on('users', function (currentUser) {
        socket.emit('users', chatModel.getUsers(currentUser));
    });

    socket.on('messages', function (skip, top, filter, currentUserName) {
        socket.emit('messages', chatModel.getMessages(top, skip, filter, currentUserName));
    });

    socket.on('addMessage', function (message) {
        chatModel.addMessage(message);
        io.emit('messagesUpdateSelf');
    });

    socket.on('editMessage', function (id, text) {
        chatModel.editMessage(id, text);
        io.emit('messagesUpdateSelf');
    });

    socket.on('deleteMessage', function (id) {
        chatModel.deleteMessage(id);
        io.emit('messagesUpdateSelf');
    });
});

function checkAuthorisation(token) {
    const userName = jwt.verify(token, jwtSecretWord).name;
    if (userName) {
        return chatModel.getUserOnlineState(userName);
    }
    return false;
}

app.post("/auth/login", upload.none(), function (request, response) {
    const name = request.body.name;
    const password = request.body.password;
    if (chatModel.checkUser(name, password)) {
        const token = jwt.sign({
            name: name,
            id: chatModel.getUserIdByName(name)
        }, jwtSecretWord, {expiresIn: 60*60});
        chatModel.setUserActive(chatModel.getUserIdByName(name), true, token);
        response.cookie('token', token);
        response.status(200).end();
    } else {
        response.status(404).end();
    }
});

app.post("/auth/register", upload.none(), function (request, response) {
    const name = request.body.name;
    const password = request.body.password;
    if (!chatModel.checkUser(name)) {
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);
        chatModel.addUser(name, hashPassword)
        response.status(200).end();
    } else {
        response.status(400).end();
    }
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});