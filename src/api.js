let baseUrl;
let authorizationHeader;

const initialize = (config) => {
  baseUrl = 'https://api.hamsterkombatgame.io/clicker';
  authorizationHeader = config.authorizationHeader;
};

const fetchData = async ({ customBaseUrl, url, method, data }) => (
  await fetch(`${customBaseUrl ?? baseUrl}/${url}`, {
    method: method ?? 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Authorization': authorizationHeader,
      'Accept': '*/*',
      'Accept-Language': 'en-RU,en;q=0.9,ru-RU;q=0.8,ru;q=0.7,en-GB;q=0.6,en-US;q=0.5',
      'Priority': 'u=1, i',
      'Sec-Ch-Ua': '\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"',
      'Sec-Ch-Ua-Mobile': '?1',
      'Sec-Ch-ua-Platform': '\"Android\"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'Referer': 'https://hamsterkombatgame.io/',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    body: data ? JSON.stringify(data) : undefined,
  }).then((response) => response.json())
);

module.exports = { initialize, fetchData };
