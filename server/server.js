class User {
    constructor(name) {
        this.name = name;
    }
}

class Message {
    constructor(authorId, text, datetime) {
        this.authorId = authorId;
        this.text = text;
        this.datetime = datetime;
    }
}

class ChatModel {
    _users = [
        new User(
            'Илья'
        )
    ]

    _messages = [
        new Message(
            0,
            'Всем привет!',
            new Date()
        )
    ];

    getUsers() {
        return this._users;
    }

    getMessages() {
        return this._messages;
    }

    addUser(name) {
        const user = new User(name);
        this._users.push(user);
    }

    deleteUser(id) {
        this._users.splice(id, 1);
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
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/users", function(request, response){
    response.json(chatModel.getUsers());
});

app.get("/messages", function(request, response){
    response.json(chatModel.getMessages());
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

app.listen(8000);