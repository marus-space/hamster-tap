const { fetchData } = require('./api');
const { getRandomInRange } = require('./getRandomInRange');
const { formatTime } = require('./formatTime');

const decodeDailyCipher = (cipher) => {
  let encoded = cipher.slice(0, 3) + cipher.slice(4);

  let decoded = Buffer.from(encoded, 'base64').toString('utf8');

  return decoded;
};

const claimDailyCipher = async () => {
  let remainSeconds = 0;
  
  try {
    const { dailyCipher } = await fetchData({ url: 'config' });

    if (dailyCipher) {
      const { isClaimed, bonusCoins, cipher } = dailyCipher;
      remainSeconds = dailyCipher.remainSeconds;

      if (!isClaimed) {
        const data = {
          cipher: decodeDailyCipher(cipher),
        };

        const { dailyCipher: updatedDailyCipher } = await fetchData({ url: 'claim-daily-cipher', data });

        if (updatedDailyCipher) {
          if (updatedDailyCipher.isClaimed) {
            console.log(`
              \nЕжедневный шифр успешно разгадан! Сегодняшнее слово: ${data.cipher}\
              \nПоздравляем с обретением ${bonusCoins.toLocaleString('ru-RU')} монет\
            `);

            remainSeconds = updatedDailyCipher.remainSeconds;
          }
        }
      }
    }
  } catch (error) {
    console.error('\nОшибка при решении ежедневного шифра:', error);
  } finally {
    const timeout = getRandomInRange(remainSeconds * 1000, (remainSeconds + 60 ** 2) * 1000);

    console.log(`\nСегодняшний шифр разгадан, разгадаем следующий через ${formatTime(timeout)}...`);

    setTimeout(async () => await claimDailyCipher(), timeout);
  }
};

module.exports = { claimDailyCipher };
