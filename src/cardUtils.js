const { fetchData } = require('./api');

const buyCard = async (card) => {
  const data = {
    timestamp: Math.floor(Date.now() / 1000),
    upgradeId: card.id,
  };

  try {
    const { clickerUser: { balanceCoins } } = await fetchData({ url: 'buy-upgrade', data });
    console.log(`
      \nКуплена выгодная карточка: «${card.name}» за ${card.price.toLocaleString()}\
      \nБаланс: ${Math.floor(balanceCoins).toLocaleString()}\
    `);
  } catch (error) {
    console.error('\nОшибка при покупке карточки:', error);
  }
};

const buyCardWithCooldown = async (card) => {
  if (card.cooldownSeconds) {
    setTimeout(async () => {
      console.log(`\nПокупка карточки «${card.name}» отложена на ${card.cooldownSeconds} секунд...`);
      await buyCard(card);
    }, card.cooldownSeconds * 1000);
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
          `\nТОП-${unavailableCardsArray.length} самых выгодных недоступных карточек дешевле ${Math.floor(maxPrice).toLocaleString()}: \n`,
          JSON.stringify(unavailableCardsArray.map(({ name, section, price, profitPerHourDelta, condition }) => ({
            'Наименование': name,
            'Раздел': section,
            'Цена': price.toLocaleString(),
            'Стоимость 1 монеты в час': (price / profitPerHourDelta).toFixed(2).toLocaleString(),
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
        `\nТОП-${availableCardsArray.length} самых выгодных доступных карточек дешевле ${Math.floor(maxPrice).toLocaleString()}: \n`,
        JSON.stringify(availableCardsArray.map(({ name, section, price, profitPerHourDelta }) => ({
          'Наименование': name,
          'Раздел': section,
          'Цена': price.toLocaleString(),
          'Стоимость 1 монеты в час': (price / profitPerHourDelta).toFixed(2).toLocaleString(),
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
