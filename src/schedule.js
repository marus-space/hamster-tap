const { getInitialInfo, addTaps, getCoinsPerHour } = require('./tapUtils');
const { buyCardWithCooldown, getMostProfitableCards } = require('./cardUtils');
const { getRandomInRange } = require('./getRandomInRange');
const { formatTime } = require('./formatTime');

const generateTaps = async (config) => {
  const { maxPriceCoefficient, cardsCount, quantityPriority, showUnavailableCards } = config.autoBuySettings;

  const { availableTaps, earnPerTap } = await getInitialInfo();

  if (availableTaps && earnPerTap) {
    const clickerUser = await addTaps(Math.floor(availableTaps / earnPerTap));

    if (clickerUser) {
      const cardsArray = await getMostProfitableCards({
        maxPrice: maxPriceCoefficient * clickerUser.balanceCoins,
        cardsCount: cardsCount,
        quantityPriority: quantityPriority,
        showUnavailableCards: showUnavailableCards,
      });

      for (const card of cardsArray) {
        await buyCardWithCooldown(card);
      }

      getCoinsPerHour(clickerUser);

      return [clickerUser.maxTaps, clickerUser.tapsRecoverPerSec];
    }

    return [null, null];
  }

  return [null, null];
};

const scheduleNextTap = async (config) => {
  const [maxTaps, tapsRecoverPerSec] = await generateTaps(config);

  if (maxTaps && tapsRecoverPerSec) {
    const timeout = Math.floor(getRandomInRange(maxTaps / 10 * 1000, maxTaps * 1000) / tapsRecoverPerSec);

    console.log(`\nТапаем в следующий раз через рандомные ${formatTime(timeout)}...`);

    setTimeout(() => scheduleNextTap(config), timeout);
  } else {
    console.error(`\nНе удалось загрузить данные, повторная попытка произойдёт через ${formatTime(1000)}...`);
    setTimeout(() => scheduleNextTap(config), 1000);
  }
};

module.exports = { scheduleNextTap };
