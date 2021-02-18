/* eslint-disable no-else-return */
/* eslint-disable no-undef */

class User {
  constructor(name, avatar) {
    this.name = name;
    this.avatar = avatar;
  }
}

class ChatApiService {
  constructor(address) {
    this.address = address;
  }

  async sendLoginRequest(login, password) {
    const formdata = new FormData();
    formdata.append('name', login);
    formdata.append('password', password);

    const requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow',
    };

    const loginResult = await fetch(`${this.address}/auth/login`, requestOptions)
      .then((response) => response)
      .catch((error) => console.log('error', error));

    if (loginResult.status === 200) {
      return true;
    } else {
      return false;
    }
  }
}

const chatApi = new ChatApiService('http://localhost:3000');

const loginButton = document.getElementById('loginButton');
loginButton.addEventListener('click', async () => {
  const loginInput = document.getElementById('login');
  const passwordInput = document.getElementById('password');

  const login = loginInput.value;
  const password = passwordInput.value;

  const result = await chatApi.sendLoginRequest(login, password);

  if (result) {
    sessionStorage.setItem('currentUser', JSON.stringify(new User(login, 'https://image.flaticon.com/icons/png/512/194/194938.png')));
    document.location.href = './main.html';
  } else {
    loginInput.value = '';
    loginInput.placeholder = 'login or password are incorrect';
    passwordInput.value = '';
  }
});
