const { fetchData } = require('./api');

const getInitialInfo = async () => {
  try {
    const { clickerUser } = await fetchData({ url: 'sync'});

    const {
      balanceCoins,
      level,
      availableTaps,
      maxTaps,
      earnPerTap,
    } = clickerUser;

    console.log(
      `\nТекущий статус на ${new Date().toLocaleString('ru-RU')}\
      \nБаланс: ${Math.floor(balanceCoins).toLocaleString('ru-RU')}\
      \nУровень: ${level}\
      \nТекущая энергия: ${availableTaps.toLocaleString('ru-RU')}\
      \nМаксимальная энергия: ${maxTaps.toLocaleString('ru-RU')}\
      \nТратится энергии за один тап: ${earnPerTap}`
    );

    return clickerUser;
  } catch (error) {
    console.error('\nОшибка при получении текущего статуса:', error);
    return null;
  }
};

const addTaps = async (count) => {
  const data = {
    count,
    availableTaps: 0,
    timestamp: Math.floor(Date.now() / 1000),
  };

  try {
    console.log(`\nДобавляем вот столько тапов: ${count.toLocaleString('ru-RU')}`);

    const { clickerUser } = await fetchData({ url: 'tap', data });

    const {
      balanceCoins,
      level,
      availableTaps,
      maxTaps,
      earnPerTap,
    } = clickerUser;

    console.log(
      `\nСтатус после добавления тапов на ${new Date().toLocaleString('ru-RU')}\
      \nБаланс: ${Math.floor(balanceCoins).toLocaleString('ru-RU')}\
      \nУровень: ${level}\
      \nТекущая энергия: ${availableTaps.toLocaleString('ru-RU')}\
      \nМаксимальная энергия: ${maxTaps.toLocaleString('ru-RU')}\
      \nТратится энергии за один тап: ${earnPerTap}`
    );

    if (availableTaps === maxTaps) {
      console.log(`\nУровень повышен, добавляем ещё вот столько тапов: ${availableTaps.toLocaleString('ru-RU')}`);
      return await addTaps(Math.floor(availableTaps / earnPerTap));
    }

    return clickerUser;
  } catch (tapError) {
    console.error('\nОшибка при добавлении тапов:', tapError);
    return null;
  }
};

const getCoinsPerHour = (clickerUser) => {
  const {
    tapsRecoverPerSec,
    earnPassivePerHour,
  } = clickerUser;

  const counsPerHour = Math.floor(3600 * tapsRecoverPerSec + earnPassivePerHour);

  console.log(`\nТекущий майнинг в час: ${counsPerHour.toLocaleString('ru-RU')}`)
};

module.exports = { getInitialInfo, addTaps, getCoinsPerHour };
