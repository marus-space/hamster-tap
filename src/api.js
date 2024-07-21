let baseUrl;
let authorizationHeader;

const initialize = (config) => {
  baseUrl = 'https://api.hamsterkombatgame.io/clicker';
  authorizationHeader = config.authorizationHeader;
};

const fetchData = async ({ url, method, data }) => {
  
  return await fetch(`${baseUrl}/${url}`, {
    method: method ?? 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Authorization': authorizationHeader,
    },
    body: data ? JSON.stringify(data) : undefined,
  }).then((response) => response.json());
};

module.exports = { initialize, fetchData };
