const { fetchData } = require('./api');
const { getRandomInRange } = require('./getRandomInRange');
const { formatTime } = require('./formatTime');

const buyCard = async (card) => {
  const data = {
    timestamp: Math.floor(Date.now() / 1000),
    upgradeId: card.id,
  };

  try {
    const { clickerUser } = await fetchData({ url: 'buy-upgrade', data });

    if (clickerUser) {
      console.log(`
        \nКуплена выгодная карточка: «${card.name}» за ${card.price.toLocaleString('ru-RU')}\
        \nБаланс: ${Math.floor(clickerUser.balanceCoins).toLocaleString('ru-RU')}\
      `);
    }
  } catch (error) {
    console.error('\nОшибка при покупке карточки:', error);
  }
};

const buyCardWithCooldown = async (card) => {
  if (card.cooldownSeconds) {
    const timeout = getRandomInRange(card.cooldownSeconds * 1000, (card.cooldownSeconds + 60) * 1000);

    setTimeout(async () => {
      console.log(`\nПокупка карточки «${card.name}» отложена на ${formatTime(timeout)}...`);
      await buyCard(card);
    }, timeout);
  } else {
    await buyCard(card);
  }
};

const getMostProfitableCards = async ({ maxPrice, cardsCount, quantityPriority, showUnavailableCards }) => {
  try {
    const { upgradesForBuy } = await fetchData({ url: 'upgrades-for-buy' });

    if (showUnavailableCards) {
      const unavailableCardsArray = upgradesForBuy
        .filter(({ isAvailable, isExpired }) => !isAvailable && !isExpired)
        .sort((a, b) => b.profitPerHourDelta / b.price - a.profitPerHourDelta / a.price)
        .filter(({condition}) => condition._type === 'ByUpgrade')
        .slice(0, 5)
        .map(({ id, name, section, price, profitPerHourDelta, condition }) => ({ id, name, section, price, profitPerHourDelta, condition }));

      if (unavailableCardsArray.length) {
        console.warn(
          `\nТОП-${unavailableCardsArray.length} самых выгодных недоступных карточек дешевле ${Math.floor(maxPrice).toLocaleString('ru-RU')}: \n`,
          JSON.stringify(unavailableCardsArray.map(({ name, section, price, profitPerHourDelta, condition }) => ({
            'Наименование': name,
            'Раздел': section,
            'Цена': price.toLocaleString('ru-RU'),
            'Стоимость 1 монеты в час': (price / profitPerHourDelta).toFixed(2).toLocaleString('ru-RU'),
            'Условие': `Обновить карточку «${condition.upgradeId}» до уровня ${condition.level}`,
          })), null, '\t'),
        );
      }
    }

    const availableCardsArray = upgradesForBuy
      .filter(({ isAvailable, isExpired, price }) => isAvailable && !isExpired && (!quantityPriority || price < maxPrice))
      .sort((a, b) => b.profitPerHourDelta / b.price - a.profitPerHourDelta / a.price)
      .slice(0, cardsCount)
      .filter(({ price }) => quantityPriority || price < maxPrice)
      ?.map(({ id, name, section, price, profitPerHourDelta }) => ({ id, name, section, price, profitPerHourDelta }));

    if (availableCardsArray.length) {
      console.log(
        `\nТОП-${availableCardsArray.length} самых выгодных доступных карточек дешевле ${Math.floor(maxPrice).toLocaleString('ru-RU')}: \n`,
        JSON.stringify(availableCardsArray.map(({ name, section, price, profitPerHourDelta }) => ({
          'Наименование': name,
          'Раздел': section,
          'Цена': price.toLocaleString('ru-RU'),
          'Стоимость 1 монеты в час': (price / profitPerHourDelta).toFixed(2).toLocaleString('ru-RU'),
        })), null, '\t'),
      );
    }

    return availableCardsArray;
  } catch (error) {
    console.error('\nОшибка при получении карточек:', error);
    return [];
  }
};

module.exports = { buyCard, buyCardWithCooldown, getMostProfitableCards };
