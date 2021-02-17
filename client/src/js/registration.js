/* eslint-disable no-undef */
class ChatApiService {
  constructor(address) {
    this.address = address;
  }

  async sendRegisterRequest(login, password) {
    const formdata = new FormData();
    formdata.append('name', login);
    formdata.append('pass', password);

    const requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow',
    };

    const requestAddress = `${this.address}/auth/register`;
    console.log(requestAddress);

    const registerResult = await fetch(requestAddress, requestOptions)
      .then((response) => response.json())
      .then((result) => result)
      .catch((error) => console.log('error', error));

    return registerResult;
  }
}

const chatApi = new ChatApiService('https://jslabdb.datamola.com');

const registerButton = document.getElementById('register');
registerButton.addEventListener('click', async () => {
  const loginInput = document.getElementById('login');
  const passwordInput = document.getElementById('password');
  const repeatPasswordInput = document.getElementById('repeatPassword');

  const login = loginInput.value;
  const password = passwordInput.value;
  const repeatPassword = repeatPasswordInput.value;

  if (!login || login.length < 4) {
    loginInput.value = '';
    loginInput.placeholder = 'Size of login < 4!';
    return;
  }

  const checkLogin = new RegExp('[a-zA-Z0-9]+');
  if (login.match(checkLogin) === null) {
    loginInput.value = '';
    loginInput.placeholder = 'Login must consist of a-z, A-Z, 0-9.';
    return;
  }

  if (!password || password.length < 6) {
    passwordInput.value = '';
    passwordInput.placeholder = 'Size of password < 6!';
    return;
  }

  const checkPassword = new RegExp('[a-zA-Z0-9]+');
  if (password.match(checkPassword) === null) {
    passwordInput.value = '';
    passwordInput.placeholder = 'Password must consist of a-z, A-Z, 0-9.';
    return;
  }

  if (!repeatPassword) {
    repeatPasswordInput.value = '';
    repeatPasswordInput.placeholder = 'This field must not be empty.';
    return;
  }

  if (password !== repeatPassword) {
    repeatPasswordInput.value = '';
    repeatPasswordInput.placeholder = 'Not equals password.';
    return;
  }

  const result = await chatApi.sendRegisterRequest(login, password);

  if (result !== undefined && result.error) {
    loginInput.value = '';
    if (result.error.indexOf('E11000') !== -1) {
      loginInput.placeholder = 'User with current login already exists!';
    } else {
      loginInput.placeholder = result.error;
    }
    passwordInput.value = '';
    repeatPasswordInput.value = '';
  } else {
    document.location.href = './login.html';
  }
});
