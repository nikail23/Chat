/* eslint-disable no-empty */
/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */

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

class FilterConfig {
  constructor(author, dateFrom, dateTo, text) {
    this.author = author;
    this.dateFrom = dateFrom;
    this.dateTo = dateTo;
    this.text = text;
  }
}

class MessagesView {
  constructor(containerId) {
    this.containerId = containerId;
  }

  display(messages, currentUser) {
    // eslint-disable-next-line no-undef
    const container = document.getElementById(this.containerId);
    let messagesHTML = '';
    messages.forEach((message) => {
      const formatDate = `${(`0${message.createdAt.getDate()}`).slice(-2)}/${(`0${message.createdAt.getMonth() + 1}`).slice(-2)}/${message.createdAt.getFullYear()} ${(`0${message.createdAt.getHours()}`).slice(-2)}:${(`0${message.createdAt.getMinutes()}`).slice(-2)}:${(`0${message.createdAt.getSeconds()}`).slice(-2)}`;
      const infoString = `${message.isPersonal ? `Personal message to ${message.to}` : 'Common message'} from ${message.author},<br/> at ${formatDate}`;
      if (message.author === currentUser.name) {
        messagesHTML
          += `<div class="sentMessage" id="${message.id}">
          <textarea name="text" cols="30" rows="2" disabled>${message.text}</textarea>
          <img class="imgMes1 delete" src="https://icon-library.com/images/deleted-icon/deleted-icon-18.jpg"/>
          <img class="imgMes1 edit" src="https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/OOjs_UI_icon_edit-ltr-progressive.svg/1024px-OOjs_UI_icon_edit-ltr-progressive.svg.png"/>
        </div>  
        <div class="info info2">${infoString}</div> `;
      } else {
        messagesHTML
          += `<div class="comeMessage" id="${message.id}">
          <textarea name="text" cols="30" rows="2" disabled>${message.text}</textarea>
          </div>  
        <div class="info info1">${infoString}</div>`;
      }
    });
    container.innerHTML = messagesHTML;
  }
}

class User {
  constructor(name, avatar) {
    this.name = name;
    this.avatar = avatar;
  }
}

class ActiveUsersView {
  constructor(containerId) {
    this.containerId = containerId;
  }

  display(users, activeUser) {
    // eslint-disable-next-line no-undef
    const container = document.getElementById(this.containerId);
    let html = '';
    users.forEach((user) => {
      if (user.name !== activeUser.name) {
        html += `<div class="user">
        <img src="${user.avatar}" alt="">
        <span>${user.name}</span>
        </div>`;
      }
    });
    container.innerHTML = html;
  }
}

class HeaderView {
  constructor(avatarId, currentUserNameId) {
    this.avatarId = avatarId;
    this.currentUserNameId = currentUserNameId;
  }

  display(avatar, name) {
    // eslint-disable-next-line no-undef
    const avatarContainer = document.getElementById(this.avatarId);
    avatarContainer.innerHTML = `<img src='${avatar}' alt='avatar'> </img>`;
    // eslint-disable-next-line no-undef
    const nameContaner = document.getElementById(this.currentUserNameId);
    nameContaner.innerHTML = name;
  }
}

class HelpBoxView {
  constructor(helpBoxId) {
    this.helpBoxId = helpBoxId;
  }

  display(to) {
    // eslint-disable-next-line no-undef
    const helpBox = document.getElementById(this.helpBoxId);
    helpBox.innerHTML = `[to: ${to}]`;
  }
}

class FiltersView {
  constructor(filtersBoxId) {
    this.filtersBoxId = filtersBoxId;
  }

  display(filterConfig) {
    const filtersBox = document.getElementById(this.filtersBoxId);
    const authorFilterBox = filtersBox.children[0];
    const dateFromFilterBox = filtersBox.children[1];
    const dateToFilterBox = filtersBox.children[2];
    const textFilterBox = filtersBox.children[3];

    if (filterConfig.author) {
      authorFilterBox.value = filterConfig.author;
    }

    if (filterConfig.dateFrom) {
      dateFromFilterBox.value = filterConfig.dateFrom;
    }

    if (filterConfig.dateTo) {
      dateToFilterBox.value = filterConfig.dateTo;
    }

    if (filterConfig.text) {
      textFilterBox.value = filterConfig.text;
    }
  }
}

class ChatApiService {
  constructor(address) {
    this._socket = io(address);

    this._messages = [];

    this._activeUsers = [];
    this._currentUser = null;
  }

  setCurrentUser(user) {
    this._currentUser = user;
  }

  getCurrentUser() {
    return this._currentUser;
  }

  async getMessages(skip, top, filter, currentUserName) {
    const socket = this._socket;
    socket.emit('messages', skip, top, filter, currentUserName);
    return new Promise(function (resolve, reject) {
      socket.on("messages", function (messages) {
        this._messages = messages;
        resolve(messages);
      });
    });
  }

  async addMessage(text, isPersonal, to) {
    const socket = this._socket;
    socket.emit('addMessage', new Message(undefined, text, undefined, this._currentUser.name, isPersonal, to));
    return new Promise(function (resolve, reject) {
      socket.on("addMessage", function (result) {
        resolve(result);
      });
    });
  }

  async editMessage(id, text) {
    const socket = this._socket;
    socket.emit('editMessage', id, text);
    return new Promise(function (resolve, reject) {
      socket.on("editMessage", function (result) {
        resolve(result);
      });
    });
  }

  async deleteMesssage(id) {
    const socket = this._socket;
    socket.emit('deleteMessage', id);
    return new Promise(function (resolve, reject) {
      socket.on("deleteMessage", function (result) {
        resolve(result);
      });
    });
  }

  async logOut() {
    const socket = this._socket;
    socket.emit('logOut', this._currentUser.name);
  }

  async getUsers() {
    const socket = this._socket;
    socket.emit('users', this._currentUser.name);
    return new Promise(function (resolve, reject) {
      socket.on("users", function (users) {
        this._activeUsers = users;
        resolve(users);
      });
    });
  }
}

class ChatController {
  constructor() {
    this.currentTop = 10;
    this.currentSkip = 0;
    this.currentFilter = null;
    this.currentSelectedUser = 'All';

    this.showHelpBox(this.currentSelectedUser);
    this.loadCurrentUser();

    this.showActiveUsers();
    this.showMessages(this.currentSkip, this.currentTop, this.currentFilter);
  }

  async addMessage(text, isPersonal, to) {
    const result = await chatApi.addMessage(text, isPersonal, to);
    if (result) {
      await this.showMessages();
    }
  }

  async editMessage(id, text) {
    if (chatApi.editMessage(id, text)) {
      await this.showMessages();
    }
  }

  async removeMessage(id) {
    if (chatApi.deleteMesssage(id)) {
      await this.showMessages();
    }
  }

  _getValidMessages(messages) {
    messages.forEach((message) => {
      message.createdAt = new Date(message.createdAt);
    });
  }

  _sortMessages(messages, skip, top, filterConfig) {
    const messagesBuffer = messages.slice();

    function compareDates(message1, message2) {
      return message1.createdAt - message2.createdAt;
    }
    messagesBuffer.sort(compareDates);

    return messagesBuffer;
  }

  async showMessages(skip, top, filter) {
    const messages = await chatApi.getMessages(this.currentSkip, this.currentTop, this.currentFilter);
    if (messages && messages !== 'query params invalid') {
      this._getValidMessages(messages);
      const sortedMessages = this._sortMessages(messages, skip, top, filter);
      messagesView.display(sortedMessages, chatApi.getCurrentUser());
      addDeleteEventToAllMessages();
      addEditEventToAllMessages();
    } else {
      messagesView.display([], chatApi.getCurrentUser());
    }
  }

  async showActiveUsers() {
    const users = await chatApi.getUsers();
    if (users) {
      activeUsersView.display(users, chatApi.getCurrentUser());
      addSelectUserEvent();
    }
  }

  setCurrentUser(name, avatar) {
    chatApi.setCurrentUser(new User(name, avatar));
    headerView.display(chatApi.getCurrentUser().avatar, chatApi.getCurrentUser().name);
  }

  showHelpBox(to) {
    helpBoxView.display(to);
  }

  showFilters(filterConfig) {
    filtersView.display(filterConfig);
  }

  loadCurrentUser() {
    const currentUserStorageText = sessionStorage.getItem('currentUser');
    if (currentUserStorageText) {
      const currentUser = JSON.parse(currentUserStorageText);
      this.setCurrentUser(currentUser.name, currentUser.avatar);
    } else {
      document.location.href = './login.html';
    }
  }

  async logOut() {
    await chatApi.logOut();
    document.location.href = './login.html';
  }
}

const messagesView = new MessagesView('messages');
const activeUsersView = new ActiveUsersView('userList');
const helpBoxView = new HelpBoxView('helpBox');
const filtersView = new FiltersView('filters');
const headerView = new HeaderView('avatar', 'currentUser');

const chatApi = new ChatApiService('ws://127.0.0.1:3000');

const chatController = new ChatController();

function addSelectUserEvent() {
  const activeUsers = document.getElementsByClassName('user');
  Array.prototype.slice.call(activeUsers).forEach((user) => {
    user.addEventListener('click', (event) => {
      const oldSelectedUser = chatController.currentSelectedUser;
      chatController.currentSelectedUser = user.children[1].innerText;
      if (oldSelectedUser === chatController.currentSelectedUser) {
        chatController.currentSelectedUser = 'All';
      }
      chatController.showHelpBox(chatController.currentSelectedUser);
    });
  });
}

function addLoadOtherMessagesButtonEvent() {
  const loadOtherMessagesButton = document.getElementById('loadMoreButton');
  loadOtherMessagesButton.addEventListener('click', (event) => {
    chatController.currentTop += 10;
    chatController.showMessages(chatController.currentSkip, chatController.currentTop, chatController.currentFilter);
  });
}

function addDeleteEventToAllMessages() {
  const deleteMessageButtons = document.getElementsByClassName('delete');
  Array.prototype.slice.call(deleteMessageButtons).forEach((button) => {
    button.addEventListener('click', (event) => {
      const messageContainer = button.parentNode;
      chatController.removeMessage(messageContainer.id);
    });
  });
}

function addEditEventToAllMessages() {
  const editMessageButtons = document.getElementsByClassName('edit');
  Array.prototype.slice.call(editMessageButtons).forEach((button) => {
    button.addEventListener('click', (event) => {
      const messageContainer = button.parentNode;
      const messageInput = messageContainer.children[0];
      messageInput.style = 'background-color: var(--first-bg-color);';
      const messageText = messageInput.value;

      const editButton = messageContainer.children[1];
      const deleteButton = messageContainer.children[2];

      messageContainer.removeChild(editButton);
      messageContainer.removeChild(deleteButton);
      messageContainer.classList.add('editMessage');
      messageInput.removeAttribute('disabled');

      messageInput.addEventListener('keydown', (event) => {
        switch (event.keyCode) {
          case 13:
            if (messageInput.value.length > 0) {
              chatController.editMessage(messageContainer.id, messageInput.value);
            }
            messageContainer.appendChild(deleteButton);
            messageContainer.appendChild(editButton);
            messageContainer.classList.remove('editMessage');
            messageInput.setAttribute('disabled', true);
            break;
          case 27:
            messageInput.value = messageText;
            messageContainer.appendChild(deleteButton);
            messageContainer.appendChild(editButton);
            messageContainer.classList.remove('editMessage');
            messageInput.setAttribute('disabled', true);
            break;
          default:
            break;
        }
      });
    });
  });
}

function addFilterEvent() {
  const filterSendButton = document.getElementById('filterSendButton');
  const filterCancelButton = document.getElementById('filterCancelButton');

  filterSendButton.addEventListener('click', (event) => {
    const filtersBox = document.getElementById('filters');
    const authorFilterBox = filtersBox.children[0];
    const dateFromFilterBox = filtersBox.children[1];
    const dateToFilterBox = filtersBox.children[2];
    const textFilterBox = filtersBox.children[3];

    const authorFilter = authorFilterBox.value;
    const dateFromFilterText = dateFromFilterBox.value;
    const dateToFilterText = dateToFilterBox.value;
    let dateFromFilter;
    let dateToFilter;

    if (dateFromFilterText !== '') {
      dateFromFilter = new Date(dateFromFilterText);
      dateFromFilter.setHours(0);
      dateFromFilter.setMinutes(0);
      dateFromFilter.setSeconds(0);
    }

    if (dateToFilterText !== '') {
      dateToFilter = new Date(dateToFilterText);
      dateToFilter.setHours(23);
      dateToFilter.setMinutes(59);
      dateToFilter.setSeconds(59);
    }

    const textFilter = textFilterBox.value;

    const filter = new FilterConfig(authorFilter, dateFromFilter, dateToFilter, textFilter);
    chatController.currentFilter = filter;

    chatController.showMessages(this.currentSkip, this.currentTop, this.currentFilter);
  });

  filterCancelButton.addEventListener('click', (event) => {
    const filtersBox = document.getElementById('filters');
    filtersBox.children[0].value = null;
    filtersBox.children[1].value = null;
    filtersBox.children[2].value = null;
    filtersBox.children[3].value = null;

    chatController.currentFilter = null;
    chatController.showMessages(chatController.currentSkip, chatController.currentTop, chatController.currentFilter);
  });
}

function addSendButtonEvent() {
  const messageInput = document.getElementById('sendButton');
  messageInput.addEventListener('click', (event) => {
    event.preventDefault();
    const textInput = document.getElementById('myInput');
    const messageText = textInput.value;
    if (messageText.length === 0) {
      return;
    }
    if (chatController.currentSelectedUser !== 'All') {
      chatController.addMessage(messageText, true, chatController.currentSelectedUser);
    } else {
      chatController.addMessage(messageText, false);
    }

    textInput.value = '';
    const messagesContainer = document.getElementById('messages');
    messagesContainer.scrollTo(0, document.body.scrollHeight);
  });
}

function addLogOutEvent() {
  const logOutButton = document.getElementById('logOut');
  logOutButton.addEventListener('click', () => {
    chatController.logOut();
  });
}

addLogOutEvent();
addFilterEvent();
addSelectUserEvent();
addLoadOtherMessagesButtonEvent();
addSendButtonEvent();
addDeleteEventToAllMessages();
addEditEventToAllMessages();