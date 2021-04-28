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

    getMessages(top, skip, currentUser) {
        let messagesBuffer = this._messages.slice();

        function compareDates(message1, message2) {
            return message1.createdAt - message2.createdAt;
        }
        messagesBuffer.sort(compareDates);

        console.log(messagesBuffer);

        if (currentUser) {
            for (let i = 0; i < messagesBuffer.length; i++) {
                if (messagesBuffer[i].isPersonal && messagesBuffer[i].to !== currentUser && messagesBuffer[i].author !== currentUser) {
                    messagesBuffer.splice(i, 1);
                    i--;
                }
            }
        }

        messagesBuffer = messagesBuffer.slice(skip, top + skip);

        console.log(messagesBuffer);

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
        console.log(this._messages[id]);
        this._messages[id].text = text;
        console.log(this._messages[id]);
    }

    addMessage(message) {
        const newMessage = new Message(undefined, message.text, undefined, message.author, message.isPersonal, message.to);
        if (this._messages.length !== 0) {
            newMessage.id = String(Number(this._messages[this._messages.length - 1].id) + 1);
        } else {
            newMessage.id = 0;
        }
        newMessage.createdAt = new Date();
        console.log(newMessage);
        this._messages.push(newMessage);
        return newMessage;
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

const cors = require('cors');
const multer = require('multer');
const upload = multer();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

// GraphQL

const graphqlHTTP = require('express-graphql').graphqlHTTP;
const {
    buildSchema
} = require("graphql");
const schema = buildSchema(`
    type Query {
        messages(top: Int, skip: Int, text: String, author: String, dateFrom: String, dateTo: String, currentUserName: String): [Message]
        users: [User]
    }
    type Mutation {
        addMessage(text: String, author: String, isPersonal: Boolean, to: String): Message
        editMessage(id: Int, text: String): Message
        deleteMessage(id: Int): Message
        logOut(currentUserName: String): User
    }
    type Message {
        id: Int
        text: String
        createdAt: String
        author: String
        isPersonal: Boolean
        to: String
    }
    type User {
        id: Int
        name: String
        password: String
        isActive: Boolean
        token: String
    }
    type Filter {
        text: String
        dateFrom: String
        dateTo: String
        author: String
    }
    input FilterInput {
        text: String
        dateFrom: String
        dateTo: String
        author: String
    }
`);

const getMessages = function (args) {
    if (args) {
        const top = args.top;
        const skip = args.skip;
        const currentUserName = args.currentUserName;
        return chatModel.getMessages(top, skip, currentUserName).map((value) => {
            return {
                id: value.id,
                text: value.text,
                author: value.author,
                createdAt: value.createdAt.toString(),
                isPersonal: value.isPersonal,
                to: value.to,
            };
        });
    }
}

const addMessage = function (args) {
    if (args) {
        const text = args.text;
        const author = args.author;
        const isPersonal = args.isPersonal;
        const to = args.to;
        chatModel.addMessage(new Message(undefined, text, undefined, author, isPersonal, to));
        return args.message;
    }
}

const editMessage = function (args) {
    return chatModel.editMessage(args.id, args.text);
}

const deleteMessage = function (args) {
    return chatModel.deleteMessage(args.id);
}

const getUsers = function () {
    return chatModel.getUsers();
}

const logOut = function (args) {
    if (args.currentUser) {
        chatModel.setUserActive(chatModel.getUserIdByName(currentUser), false);
        return true;
    }
    return false;
}

var root = {
    messages: getMessages,
    users: getUsers,
    addMessage: addMessage,
    editMessage: editMessage,
    deleteMessage: deleteMessage,
    logOut: logOut
};

app.use(cors({
    origin: '*'
}));

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(cookieParser());

app.post("/auth/login", upload.none(), function (request, response) {
    const name = request.body.name;
    const password = request.body.password;
    if (chatModel.checkUser(name, password)) {
        const token = jwt.sign({
            name: name,
            id: chatModel.getUserIdByName(name)
        }, jwtSecretWord, {
            expiresIn: 60 * 60
        });
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

app.listen(3000, function () {
    console.log('listening on *:3000');
});