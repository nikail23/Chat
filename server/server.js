class User {
    constructor(name) {
        this.name = name;
    }
}

class Message {
    constructor(authorId, text, datetime) {
        this.author = author;
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