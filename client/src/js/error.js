/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
function findGetParameter(parameterName) {
  let result = null;
  let tmp = [];
  const items = location.search.substr(1).split('&');
  for (let index = 0; index < items.length; index++) {
    tmp = items[index].split('=');
    if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
  }
  return result;
}

const errorCode = findGetParameter('errorCode');
const errorDescription = findGetParameter('errorDescription');

document.getElementById('errorCode').innerText = errorCode;
document.getElementById('errorDescription').innerText = errorDescription;
