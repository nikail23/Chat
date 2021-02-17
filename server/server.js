class User {
    constructor(name, password) {
        this.name = name;
        this.password = password;
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
        new User(
            'nikail23',
            'thvjkjdbx'
        )
    ]

    _messages = [
        new Message(
            0,
            'Всем привет!',
            new Date(),
            'nikail23',
            false
        )
    ];

    getUsers() {
        return this._users;
    }

    getMessages() {
        return this._messages;
    }

    addUser(name, password) {
        const user = new User(name, password);
        this._users.push(user);
        return true;
    }

    checkUser(name, password) {
        let result = false;
        this._users.forEach(user => {
            if (user.name === name && user.password === password) {
                result = true;
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

    addMessage(authorId, text, datetime) {
        const message = new Message(authorId, text, datetime);
        this._messages.push(message);
    }

    deleteMessage(id) {
        this._messages.splice(id, 1);
    }
}

const chatModel = new ChatModel();

const express = require("express");
const app = express();
const cors = require('cors');
const multer  = require('multer');
const upload = multer();

app.use(cors());
app.use(express.urlencoded({extended: true})); 
app.use(express.json());  

app.get("/users", function(request, response){
    response.json(chatModel.getUsers());
});

app.get("/messages", function(request, response){
    response.json(chatModel.getMessages());
    console.log('hello!');
});

app.post("/users/:id", function(request, response) {
    response.send("Вы пытаетесь добавить пользователя!");
});

app.post("/messages/:id", function(request, response) {
    response.send("Вы пытаетесь добавить сообщение!");
});

app.delete("/messages/:id", function(request, response) {
    response.send("Вы пытаетесь удалить сообщение!");
});

app.delete("/messages/:id", function(request, response) {
    response.send("Вы пытаетесь удалить сообщение!");
});

app.post("/auth/login", upload.none(), function(request, response) {
    if (!request.body) 
        return response.sendStatus(400);
    const name = request.body.name;
    const password = request.body.password;
    if (chatModel.checkUser(name, password)) {
        response.statusCode = 200;
        response.statusMessage = 'OK';
        response.send()
    } else {
        response.statusCode = 400;
        response.statusMessage = 'Bad login or password';
        response.send();
    }
});

app.post("/auth/register", upload.none(), function(request, response) {
    if (!request.body) 
        return response.sendStatus(400);
    const name = request.body.name;
    const password = request.body.password;
    if (!chatModel.checkUser(name) && chatModel.addUser(name, password)) {
        response.statusCode = 200;
        response.statusMessage = 'OK';
        response.send()
    } else {
        response.statusCode = 400;
        response.statusMessage = 'User with such name already registered!';
        response.send();
    }
});

app.post("/auth/logout", upload.none(), function(request, response) {
    if (!request.body) 
        return response.sendStatus(400);
    const name = request.body.name;
    console.log(name);
    if (chatModel.checkUser(name) && chatModel.deleteUser(name)) {
        console.log(chatModel._users);
        response.statusCode = 200;
        response.statusMessage = 'OK';
        response.send()
    } else {
        console.log(chatModel._users);
        response.statusCode = 400;
        response.statusMessage = 'User not online!';
        response.send();
    }
});

app.listen(3000);