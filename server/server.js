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

    getMessages(top = 0, skip = 10, dateFrom, dateTo, text, author, currentUser) {
        let messagesBuffer = this._messages.slice();

        if (author) {
            for (let i = 0; i < messagesBuffer.length; i++) {
                if (messagesBuffer[i].author.indexOf(author) === -1) {
                    messagesBuffer.splice(i, 1);
                    i--;
                }
            }
        }

        if (dateFrom) {
            for (let i = 0; i < messagesBuffer.length; i++) {
                if (messagesBuffer[i].createdAt < dateFrom) {
                    messagesBuffer.splice(i, 1);
                    i--;
                }
            }
        }

        if (dateTo) {
            for (let i = 0; i < messagesBuffer.length; i++) {
                if (messagesBuffer[i].createdAt > dateTo) {
                    messagesBuffer.splice(i, 1);
                    i--;
                }
            }
        }

        if (text) {
            for (let i = 0; i < messagesBuffer.length; i++) {
                if (messagesBuffer[i].text.indexOf(text) === -1) {
                    messagesBuffer.splice(i, 1);
                    i--;
                }
            }
        }

        function compareDates(message1, message2) {
            return message1.createdAt - message2.createdAt;
        }
        messagesBuffer.sort(compareDates);

        if (currentUser) {
            for (let i = 0; i < messagesBuffer.length; i++) {
                if (messagesBuffer[i].isPersonal && messagesBuffer[i].to !== currentUser && messagesBuffer[i].author !== currentUser ) {
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

const chatModel = new ChatModel();

const express = require("express");
const app = express();
const cors = require('cors');
const multer = require('multer');
const upload = multer();

app.use(cors());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

app.get("/users", function (request, response) {
    response.status(200).json(chatModel.getUsers());
});

app.get("/messages", function (request, response) {
    const top = request.query.top;
    const skip = request.query.skip;
    const dateFromString = request.query.dateFrom;
    const dateToString = request.query.dateTo;
    let dateTo;
    let dateFrom;
    if (dateFromString) {
        dateFrom = new Date(dateFromString);
    }
    if (dateToString) {
        dateTo = new Date(dateToString);
    }
    const text = request.query.text;
    const author = request.query.author;
    const currentUser = request.get('currentUser');
    response.status(200).json(chatModel.getMessages(top, skip, dateFrom, dateTo, text, author, currentUser));
});

app.post("/messages", function (request, response) {
    if (!request.body) {
        return response.status(400).send();
    }
    const message = new Message();
    message.author = request.body.author;
    message.text = request.body.text;
    message.isPersonal = request.body.isPersonal;
    message.to = request.body.to;
    chatModel.addMessage(message);

    response.status(200).send();
});

app.delete("/messages/:id", function (request, response) {
    const id = request.params.id;
    if (id > -1) {
        chatModel.deleteMessage(id);
        response.status(200).send();
    }
    response.status(400).send();
});

app.put("/messages/:id", function (request, response) {
    const id = request.params.id;
    if (id > -1) {
        const text = request.body.text;
        chatModel.editMessage(id, text);
        response.status(200).send();
    }
    response.status(400).send();
});

app.post("/auth/login", upload.none(), function (request, response) {
    if (!request.body)
        return response.sendStatus(400);
    const name = request.body.name;
    const password = request.body.password;
    if (chatModel.checkUser(name, password)) {
        response.status(200).send();
    } else {
        response.status(404).send();
    }
});

app.post("/auth/register", upload.none(), function (request, response) {
    if (!request.body)
        return response.sendStatus(400);
    const name = request.body.name;
    const password = request.body.password;
    if (!chatModel.checkUser(name) && chatModel.addUser(name, password)) {
        response.status(200).send();
    } else {
        response.status(400).send();
    }
});

app.post("/auth/logout", upload.none(), function (request, response) {
    if (!request.body)
        return response.sendStatus(400);
    const name = request.body.name;
    console.log(name);
    if (chatModel.checkUser(name) && chatModel.deleteUser(name)) {
        response.status(200).send();
    } else {
        response.status(400).send();
    }
});

app.listen(3000);