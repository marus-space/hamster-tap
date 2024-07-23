const { fetchData } = require('./api');
const { getRandomInRange } = require('./getRandomInRange');
const { formatTime } = require('./formatTime');

const filterByConditionType = (objects) => {
  const recursiveFilter = (obj) => {
    if ((obj._type && obj._type !== 'ByUpgrade') || obj.isExpired) {
      return null;
    }

    if (obj.condition) {
      const nestedResult = recursiveFilter(obj.condition);

      if (!nestedResult) {
        return null;
      }

      obj.condition = nestedResult;
    }

    return obj;
  };

  return objects
    .map(obj => recursiveFilter(obj))
    .filter(obj => obj !== null);
};

const getMostProfitableUnavailableUpgrades = async () => {
  try {
    const { upgradesForBuy } = await fetchData({ url: 'upgrades-for-buy' });

    const getUpgradeById = (upgradeId) => {
      let upgrade = upgradesForBuy.find(({ id }) => id === upgradeId);
      
      upgrade = {
        ...upgrade,
        condition: {
          ...upgrade.condition,
          ...(upgrade.condition?.upgradeId && getUpgradeById(upgrade.condition.upgradeId)),
        },
      };

      if (upgrade.isAvailable) {
        let { condition, ...otherParams } = upgrade;
        upgrade = otherParams;
      }
      
      const { name, section, level, price, isExpired, condition, profitPerHourDelta } = upgrade;

      return {
        currentLevel: level - 1,
        name,
        section,
        price,
        isExpired,
        passiveCoinPrice: (price / profitPerHourDelta).toFixed(2),
        profitPerHourDelta,
        condition,
      };
    };

    const unavailableCardsArray = upgradesForBuy
        .filter(({ isAvailable, isExpired }) => !isAvailable && !isExpired)
        .sort((a, b) => b.profitPerHourDelta / b.price - a.profitPerHourDelta / a.price)
        .filter(({condition}) => condition._type === 'ByUpgrade')
        .map(({ id }) => getUpgradeById(id));
    
    const filteredCards = filterByConditionType(unavailableCardsArray);
    
    console.log(JSON.stringify(filteredCards, null, '\t'));

  } catch (error) {
    console.error('\nОшибка при получении карточек:', error);

    return [];
  }
};

const getMostProfitableUpgrades = async ({
  maxPrice,
  cardsCount,
  quantityPriority,
  showUnavailableCards,
}) => {
  try {
    const { upgradesForBuy } = await fetchData({ url: 'upgrades-for-buy' });

    if (showUnavailableCards) {
      const unavailableCardsArray = upgradesForBuy
        .filter(({ isAvailable, isExpired }) => !isAvailable && !isExpired)
        .sort((a, b) => b.profitPerHourDelta / b.price - a.profitPerHourDelta / a.price)
        .filter(({condition}) => condition._type === 'ByUpgrade')
        .slice(0, 5)
        .map(({ id, name, section, price, profitPerHourDelta, condition }) => (
          { id, name, section, price, profitPerHourDelta, condition }
        ));

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
      .filter(({ isAvailable, isExpired, price }) => (
        isAvailable && !isExpired && (!quantityPriority || price < maxPrice
      )))
      .sort((a, b) => b.profitPerHourDelta / b.price - a.profitPerHourDelta / a.price)
      .slice(0, cardsCount)
      .filter(({ price }) => quantityPriority || price < maxPrice)
      ?.map(({ id, name, section, price, profitPerHourDelta, cooldownSeconds }) => (
        { id, name, section, price, profitPerHourDelta, cooldownSeconds }
      ));

    if (availableCardsArray.length) {
      console.log(
        `\nТОП-${availableCardsArray.length} самых выгодных доступных карточек дешевле ${Math.floor(maxPrice).toLocaleString('ru-RU')}: \n`,
        JSON.stringify(availableCardsArray.map(({ name, section, price, profitPerHourDelta, cooldownSeconds }) => ({
          'Наименование': name,
          'Раздел': section,
          'Цена': price.toLocaleString('ru-RU'),
          'Стоимость 1 монеты в час': (price / profitPerHourDelta).toFixed(2).toLocaleString('ru-RU'),
          ...(cooldownSeconds && { 'Время до покупки': formatTime(cooldownSeconds * 1000) } ),
        })), null, '\t'),
      );
    }

    return availableCardsArray;
  } catch (error) {
    console.error('\nОшибка при получении карточек:', error);

    return [];
  }
};

const buyUpgrade = async ({ id, name, price }) => {
  const data = {
    timestamp: Math.floor(Date.now() / 1000),
    upgradeId: id,
  };

  try {
    const { clickerUser } = await fetchData({ url: 'buy-upgrade', data });

    if (clickerUser) {
      const { balanceCoins } = clickerUser;

      console.log(`
        \nКуплена выгодная карточка «${name}» за ${price.toLocaleString('ru-RU')}\
        \nБаланс: ${Math.floor(balanceCoins).toLocaleString('ru-RU')}\
      `);
    } else {
      console.log(`\nНе удалось купить выгодную карточку «${name}» за ${price.toLocaleString('ru-RU')}`);
    }
  } catch (error) {
    console.error(`\nОшибка при покупке карточки «${name}»:`, error);
  }
};

const buyUpgradeWithCooldown = async (upgrade) => {
  if (upgrade.cooldownSeconds) {
    const timeout = getRandomInRange(upgrade.cooldownSeconds * 1000, (upgrade.cooldownSeconds + 60) * 1000);
    
    console.log(`\nПокупка карточки «${upgrade.name}» отложена на ${formatTime(timeout)}...`);

    setTimeout(async () => await buyUpgrade(upgrade), timeout);
  } else {
    await buyUpgrade(upgrade);
  }
};

const buyMostProfitableUpgrades = async ({
  maxPrice,
  cardsCount,
  quantityPriority,
  showUnavailableCards,
}) => {
  try {
    const upgrades = await getMostProfitableUpgrades({
      maxPrice: maxPrice,
      cardsCount: cardsCount,
      quantityPriority: quantityPriority,
      showUnavailableCards: showUnavailableCards,
    });

    for (const upgrade of upgrades) {
      await buyUpgradeWithCooldown(upgrade);
    }
  } catch (error) {
    console.error('\nОшибка при покупке самых выгодных карточек:', error);
  }
};

module.exports = { buyMostProfitableUpgrades, getMostProfitableUnavailableUpgrades };
