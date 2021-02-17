/* eslint-disable no-empty */
/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
class ChatApiService {
  constructor(address) {
    this._address = address;

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

  async getMessages(skip, top, filter) {
    const myHeaders = new Headers();

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    let request = `${this._address}/messages`;
    let isFirst = false;

    if (skip !== undefined) {
      request += `skip=${skip}`;
      isFirst = true;
    }

    if (top !== undefined) {
      if (isFirst) {
        request += `&top=${top}`;
      } else {
        isFirst = true;
        request += `top=${top}`;
      }
    }

    if (filter !== undefined && filter !== null) {
      if (filter.dateTo !== undefined) {
        if (isFirst) {
          const year = filter.dateTo.getFullYear();
          const month = (`0${filter.dateTo.getMonth() + 1}`).slice(-2);
          const day = (`0${filter.dateTo.getDate()}`).slice(-2);
          request += `&dateTo=${year}${month}${day}`;
        } else {
          isFirst = true;
          const year = filter.dateTo.getFullYear();
          const month = (`0${filter.dateTo.getMonth() + 1}`).slice(-2);
          const day = (`0${filter.dateTo.getDate()}`).slice(-2);
          request += `dateTo=${year}${month}${day}`;
        }
      }
      if (filter.dateFrom !== undefined) {
        if (isFirst) {
          const year = filter.dateFrom.getFullYear();
          const month = (`0${filter.dateFrom.getMonth() + 1}`).slice(-2);
          const day = (`0${filter.dateFrom.getDate()}`).slice(-2);
          request += `dateFrom=${year}${month}${day}`;
        } else {
          isFirst = true;
          const year = filter.dateFrom.getFullYear();
          const month = (`0${filter.dateFrom.getMonth() + 1}`).slice(-2);
          const day = (`0${filter.dateFrom.getDate()}`).slice(-2);
          request += `&dateFrom=${year}${month}${day}`;
        }
      }
      if (filter.author !== undefined && filter.author !== '') {
        if (isFirst) {
          request += `&author=${filter.author}`;
        } else {
          isFirst = true;
          request += `author=${filter.author}`;
        }
      }
      if (filter.text !== undefined && filter.text !== '') {
        if (isFirst) {
          request += `&text=${filter.text}`;
        } else {
          isFirst = true;
          request += `text=${filter.text}`;
        }
      }
    }

    const messages = await fetch(request, requestOptions)
      .then((response) => response.json())
      .then((result) => result)
      .catch((error) => console.log('error', error));

    this._messages = messages;

    return messages;
  }

  _getMessage(id) {
    function checkId(element) {
      if (element.id === id) {
        return true;
      }
      return false;
    }
    return this._messages.find(checkId);
  }

  async addMessage(text, isPersonal, to) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    let raw;
    if (isPersonal === false) {
      raw = `{\n    "text": "${text}",\n    "isPersonal": ${isPersonal}\n}`;
    } else {
      raw = `{\n    "text": "${text}",\n    "isPersonal": ${isPersonal},\n    "to":"${to}"\n}`;
    }

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    const result = await fetch(`${this._address}/messages`, requestOptions)
      .then((response) => response.text())
      .then((result) => result)
      .catch((error) => console.log('error', error));

    return result;
  }

  async editMessage(id, text) {
    const message = this._getMessage(id);

    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    let raw;
    if (message.isPersonal === false) {
      raw = `{\n    "text": "${text}",\n    "isPersonal": ${message.isPersonal}\n}`;
    } else {
      raw = `{\n    "text": "${text}",\n    "isPersonal": ${message.isPersonal},\n    "to":"${message.to}"\n}`;
    }

    const requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    await fetch(`${this._address}/messages/${id}`, requestOptions)
      .then((response) => {
        if (response.statusText !== 'OK') {
          document.location.href = `../error.html?errorCode=${response.status}&errorDescription=${response.statusText}`;
        }
      })
      .catch((error) => console.log('error', error));
  }

  async deleteMesssage(id) {
    const myHeaders = new Headers();

    const requestOptions = {
      method: 'DELETE',
      headers: myHeaders,
      redirect: 'follow',
    };

    await fetch(`${this._address}/messages/${id}`, requestOptions)
      .then((response) => {
        if (response.statusText !== 'OK') {
          document.location.href = `../error.html?errorCode=${response.status}&errorDescription=${response.statusText}`;
        }
      })
      .then((result) => console.log(result))
      .catch((error) => console.log('error', error));
  }

  async logOut() {
    const myHeaders = new Headers();
    myHeaders.append('Content-Length', 0);

    const formdata = new FormData();
    formdata.append('name', chatController.chatApi._currentUser);

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
      body: formdata
    };

    await fetch(`${this._address}/auth/logout`, requestOptions)
      .then((response) => response.text())
      .then((result) => result)
      .catch((error) => console.log('error', error));
  }

  async getUsers() {
    const myHeaders = new Headers();

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    const users = await fetch(`${this._address}/users`, requestOptions)
      .then((response) => response.json())
      .then((result) => result)
      .catch((error) => console.log('error', error));

    return users;
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

// CONTROLLER

class ChatController {
  constructor() {
    this.chatApi = new ChatApiService('http://localhost:3000');

    this.currentTop = 10;
    this.currentSkip = 0;
    this.currentFilter = null;
    this.currentSelectedUser = 'All';

    this.messagesView = new MessagesView('messages');
    this.activeUsersView = new ActiveUsersView('userList');
    this.helpBoxView = new HelpBoxView('helpBox');
    this.filtersView = new FiltersView('filters');
    this.headerView = new HeaderView('avatar', 'currentUser');

    this.showHelpBox(this.currentSelectedUser);
    this.loadCurrentUser();

    this.showActiveUsers();
    this.showMessages(this.currentSkip, this.currentTop, this.currentFilter);
    this.startShortPolling();
  }

  startShortPolling() {
    this.dataUpdateInterval = setInterval(() => {
      this.showMessages(this.currentSkip, this.currentTop, this.currentFilter);
    }, 2000);

    this.usersUpdateInterval = setInterval(() => {
      this.showActiveUsers();
    }, 10000);
  }

  endShortPolling() {
    clearInterval(this.dataUpdateInterval);
    clearInterval(this.usersUpdateInterval);
  }

  async addMessage(text, isPersonal, to) {
    const result = await this.chatApi.addMessage(text, isPersonal, to);
    if (result != null) {
      console.log(result);
      await this.showMessages();
    }
  }

  async editMessage(id, text) {
    if (this.chatApi.editMessage(id, text)) {
      await this.showMessages();
    }
  }

  async removeMessage(id) {
    if (this.chatApi.deleteMesssage(id)) {
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
    const messages = await this.chatApi.getMessages(this.currentSkip, this.currentTop, this.currentFilter);
    if (messages !== undefined && messages !== null && messages !== 'query params invalid') {
      this._getValidMessages(messages);
      const sortedMessages = this._sortMessages(messages, skip, top, filter);
      this.messagesView.display(sortedMessages, this.chatApi.getCurrentUser());
      addDeleteEventToAllMessages();
      addEditEventToAllMessages();
    } else {
      this.messagesView.display([], this.chatApi.getCurrentUser());
    }
  }

  async showActiveUsers() {
    const users = await this.chatApi.getUsers();
    if (users !== null) {
      this.activeUsersView.display(users, this.chatApi.getCurrentUser());
      addSelectUserEvent();
    }
  }

  setCurrentUser(name, avatar) {
    this.chatApi.setCurrentUser(new User(name, avatar));
    this.headerView.display(this.chatApi.getCurrentUser().avatar, this.chatApi.getCurrentUser().name);
  }

  showHelpBox(to) {
    this.helpBoxView.display(to);
  }

  showFilters(filterConfig) {
    this.filtersView.display(filterConfig);
  }

  loadCurrentUser() {
    const currentUserStorageText = sessionStorage.getItem('currentUser');
    if (currentUserStorageText) {
      const currentUser = JSON.parse(currentUserStorageText);
      this.setCurrentUser(currentUser.name, currentUser.avatar);
    } else {
      document.location.href = '../error.html?errorCode=405&errorDescription=Unathorised';
    }
  }

  async logOut() {
    await this.chatApi.logOut();
    document.location.href = './login.html';
  }
}

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
      chatController.endShortPolling();

      const messageContainer = button.parentNode;
      chatController.removeMessage(messageContainer.id);

      chatController.startShortPolling();
    });
  });
}

function addEditEventToAllMessages() {
  const editMessageButtons = document.getElementsByClassName('edit');
  Array.prototype.slice.call(editMessageButtons).forEach((button) => {
    button.addEventListener('click', (event) => {
      chatController.endShortPolling();

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
            chatController.startShortPolling();
            break;
          case 27:
            messageInput.value = messageText;
            messageContainer.appendChild(deleteButton);
            messageContainer.appendChild(editButton);
            messageContainer.classList.remove('editMessage');
            messageInput.setAttribute('disabled', true);
            chatController.startShortPolling();
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
    chatController.endShortPolling();

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

    chatController.startShortPolling();
  });

  filterCancelButton.addEventListener('click', (event) => {
    chatController.endShortPolling();

    const filtersBox = document.getElementById('filters');
    filtersBox.children[0].value = null;
    filtersBox.children[1].value = null;
    filtersBox.children[2].value = null;
    filtersBox.children[3].value = null;

    chatController.currentFilter = null;
    chatController.showMessages(chatController.currentSkip, chatController.currentTop, chatController.currentFilter);

    chatController.startShortPolling();
  });
}

function addSendButtonEvent() {
  const messageInput = document.getElementById('sendButton');
  messageInput.addEventListener('click', (event) => {
    chatController.endShortPolling();

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

    chatController.startShortPolling();
  });
}

function addLogOutEvent() {
  const logOutButton = document.getElementById('logOut');
  logOutButton.addEventListener('click', () => {
    chatController.endShortPolling();
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
