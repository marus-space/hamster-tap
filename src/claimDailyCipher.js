const { fetchData } = require('./api');
const { getRandomInRange } = require('./getRandomInRange');
const { formatTime } = require('./formatTime');

const decodeDailyCipher = (cipher) => {
  let encoded = cipher.slice(0, 3) + cipher.slice(4);

  let decoded = Buffer.from(encoded, 'base64').toString('utf8');

  return decoded;
};

const claimDailyCipher = async () => {
  try {
    const { dailyCipher } = await fetchData({ url: 'config' });

    if (dailyCipher) {
      const { isClaimed, bonusCoins, cipher, remainSeconds } = dailyCipher;

      if (!isClaimed) {
        const data = {
          cipher: decodeDailyCipher(cipher),
        };

        const responseData = await fetchData({ url: 'claim-daily-cipher', data });

        console.log(`Ежедневный шифр успешно разгадан! Поздравляем с обретением ${bonusCoins.toLocaleString('ru-RU')} монет`);

        console.log('POST /claim-daily-cipher response data: ', JSON.stringify(responseData, null, '\t'));
        
        // TODO: Получать remainSeconds из ответа на POST /claim-daily-cipher вместо рекурсивного вызова claimDailyCipher
        await claimDailyCipher();
      } else {
        const timeout = getRandomInRange(remainSeconds * 1000, (remainSeconds + 60 ** 2) * 1000);

        console.log(`Сегодняшний шифр разгадан, разгадаем следующий через ${formatTime(timeout)}...`);

        setTimeout(async () => await claimDailyCipher(), timeout);
      }
    }
  } catch (error) {
    console.error('\nОшибка при решении ежедневного шифра:', error);
  }
};

module.exports = { claimDailyCipher };
