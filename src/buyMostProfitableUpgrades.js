const { fetchData } = require('./api');
const { getRandomInRange } = require('./getRandomInRange');
const { formatTime } = require('./formatTime');

const getNestedUpgradeById = (upgradesForBuy, upgradeId, requiredLevel) => {
  let upgrade = upgradesForBuy.find(({ id }) => id === upgradeId);

  const { name, section, level, price, isAvailable, isExpired, condition, profitPerHourDelta, expiresAt } = upgrade;

  if (condition?._type && condition._type !== 'ByUpgrade' || isExpired) {
    return null;
  }
  
  if (condition?.upgradeId) {
    upgrade = {
      ...upgrade,
      condition: {
        requiredLevel: condition.level,
        ...getNestedUpgradeById(
          upgradesForBuy,
          condition.upgradeId,
          !upgrade?.isAvailable ? condition.level : undefined),
      },
    };

    if (!upgrade.condition?.name) {
      return null;
    }
  }
  

  let expectedTotalPrice = 0;

  if (requiredLevel !== undefined && level !== undefined && price) {
    expectedTotalPrice = Array.from({ length: requiredLevel - level + 1 }, (v, k) => k)
      .reduce((sum, index) => {
        return sum += price * 2 ** index;
      }, 0);
  }

  return {
    currentLevel: level - 1,
    name,
    section,
    price,
    expectedTotalPrice: (expectedTotalPrice || price) + (!isAvailable ? upgrade.condition?.expectedTotalPrice || 0 : 0),
    passiveCoinPrice: (price / profitPerHourDelta).toFixed(2),
    ...(expiresAt && { expiresAt: new Date(expiresAt).toLocaleString('ru-RU') }),
    ...(!isAvailable && { condition: upgrade.condition }),
  };
};

const getMostProfitableUnavailableUpgrades = async () => {
  try {
    const { upgradesForBuy } = await fetchData({ url: 'upgrades-for-buy' });

    const unavailableCardsArray = upgradesForBuy
      .filter(({ isAvailable }) => !isAvailable)
      .map(({ id }) => getNestedUpgradeById(upgradesForBuy, id))
      .filter((upgrade) => !!upgrade)
      .sort((a, b) => a.expectedTotalPrice - b.expectedTotalPrice);
    
    console.log(JSON.stringify(unavailableCardsArray, null, '\t'));

    return unavailableCardsArray;
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

module.exports = { buyMostProfitableUpgrades, getMostProfitableUnavailableUpgrades, getMostProfitableUpgrades };
