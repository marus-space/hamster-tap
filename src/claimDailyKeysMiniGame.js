const { fetchData } = require('./api');
const { formatTime } = require('./formatTime');
const { getRandomInRange } = require('./getRandomInRange');

const getKeysMiniGameConfig = async () => {
  try {
    const { dailyKeysMiniGame } = await fetchData({ url: 'config' });

    console.log('\ngetKeysMiniGameConfig dailyKeysMiniGame', JSON.stringify(dailyKeysMiniGame, null, '\t')); // Отладка

    if (dailyKeysMiniGame) {
      return dailyKeysMiniGame;
    } else {
      console.error('\nОшибка при получении параметров сегодняшней мини-игры с ключами');
    }
  } catch (error) {
    console.error('\nОшибка при получении параметров сегодняшней мини-игры с ключами: ', error);
  }
};

const getAccountInfo = async () => {
  try {
    const { accountInfo } = await fetchData({
      customBaseUrl: 'https://api.hamsterkombatgame.io/auth',
      url: 'account-info',
    });

    console.log('\ngetAccountInfo accountInfo', JSON.stringify(accountInfo, null, '\t')); // Отладка

    if (accountInfo) {
      return accountInfo;
    } else {
      console.error('\nНе удалось получить информацию об аккаунте');
    }
  } catch (error) {
    console.error('\nНе удалось получить информацию об аккаунте', error);
  }
};

const startKeysMiniGame = async () => {
  try {
    const { dailyKeysMiniGame } = await fetchData({ url: 'start-keys-minigame' });

    console.log('\nstartKeysMiniGame dailyKeysMiniGame', JSON.stringify(dailyKeysMiniGame, null, '\t')); // Отладка

    const { remainSecondsToGuess } = dailyKeysMiniGame;

    if (typeof remainSecondsToGuess === 'number' && remainSecondsToGuess > 0) {
      return remainSecondsToGuess;
    } else {
      console.error('\nНе удалось начать мини-игру с ключами');
    }
  } catch (error) {
    console.error('\nНе удалось начать мини-игру с ключами', error);
  }
};

const getKeysMiniGameCipher = async () => {
  try {
    const { telegramUserIds } = await getAccountInfo();

    if (Array.isArray(telegramUserIds)) {
      const cipher = '0' + getRandomInRange(100000000, 999999999) + '|' + telegramUserIds[0];

      console.log('\ngetKeysMiniGameCipher cipher', cipher); // Отладка
      
      const base64Cipher = btoa(cipher);

      return base64Cipher;
    } else {
      console.error('\nНе удалось создать шифр для мини игры с ключами');
    }
  } catch (error) {
    console.error('\nНе удалось создать шифр для мини игры с ключами', error);
  }
};

const endCaseMiniGame = async (data) => {
  try {
    const { dailyKeysMiniGame } = await fetchData({ url: 'claim-daily-keys-minigame', data });

    console.log('\nendCaseMiniGame dailyKeysMiniGame', JSON.stringify(dailyKeysMiniGame, null, '\t')); // Отладка

    const { isClaimed, bonusKeys } = dailyKeysMiniGame;

    if (isClaimed || bonusKeys) {
      console.log(`\nСегодняшняя мини-игра с ключами пройдена, заработано ключей: ${bonusKeys}`);

      return dailyKeysMiniGame;
    } else {
      console.error('\nНе удалось завершить мини-игру с ключами');
    }
  } catch (error) {
    console.error('\nНе удалось завершить мини-игру с ключами', error);
  }
};

const claimDailyKeysMiniGame = async () => {
  try {
    const { isClaimed, remainSeconds, remainSecondsToNextAttempt } = await getKeysMiniGameConfig();

    if (isClaimed) {
      const nextGameTimeout = getRandomInRange(remainSeconds * 1000, (remainSeconds + 60 ** 2) * 1000);

      console.log(`\nСегодняшняя мини-игра с ключами уже пройдена, следующая игра через ${formatTime(nextGameTimeout)}...`);

      return setTimeout(async () => await claimDailyKeysMiniGame(), nextGameTimeout);
    }

    if (remainSecondsToNextAttempt > 0) {
      const nextAttemptTimeout = getRandomInRange(remainSecondsToNextAttempt * 1000, (remainSecondsToNextAttempt + 60) * 1000);
      
      console.log(`\nПопытка пройти мини-игру с ключами отложена на ${formatTime(nextAttemptTimeout)}...`);

      return setTimeout(async () => await claimDailyKeysMiniGame(), nextAttemptTimeout);
    }

    const remainSecondsToGuess = await startKeysMiniGame();

    const endGameTimeout = getRandomInRange(
      remainSecondsToGuess * 0.5 * 1000,
      remainSecondsToGuess * 0.75 * 1000,
    );

    console.log('\nclaimDailyKeysMiniGame endGameTimeout', endGameTimeout); // Отладка

    const data = {
      cipher: await getKeysMiniGameCipher(),
    };

    console.log('\nclaimDailyKeysMiniGame data', JSON.stringify(data, null, '\t')); // Отладка

    setTimeout(async () => {
      const { remainSeconds } = await endCaseMiniGame(data);

      const nextGameTimeout = getRandomInRange(remainSeconds * 1000, (remainSeconds + 60 ** 2) * 1000);

      console.log(`\nCледующая мини-игра с ключами через ${formatTime(nextGameTimeout)}...`);

      return setTimeout(async () => await claimDailyKeysMiniGame(), nextGameTimeout);
    }, endGameTimeout);
  } catch (error) {
    console.error('\nНе удалось пройти мини-игру с ключами', error);
  }
};

module.exports = { claimDailyKeysMiniGame };
