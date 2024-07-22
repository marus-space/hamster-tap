const { fetchData } = require('./api');
const { formatTime } = require('./formatTime');

const getFreeAvailableBoosts = async () => {
  try {
    const { boostsForBuy } = await fetchData({ url: 'boosts-for-buy' });

    const freeBoosts = boostsForBuy
      .filter(({ price, level, maxLevel }) => !price && (!maxLevel || level < maxLevel));
    
    if (freeBoosts.length) {
      const freeAvailableBoosts = freeBoosts
        .filter(({ id, cooldownSeconds }) => {
          if (cooldownSeconds) {
            console.log(`\nБесплатный буст «${id}» будет доступен через ${formatTime(cooldownSeconds * 1000)}...`);
          }

          return !cooldownSeconds;
        });

      if (freeAvailableBoosts.length) {
        console.log('\nДоступные бесплатные бусты:', JSON.stringify(freeAvailableBoosts, null, '\t'));
      }

      return freeAvailableBoosts;
    }

    return [];
  } catch (error) {
    console.error('\nОшибка при получении бесплатных бустов:', error);
    return [];
  }
};

const buyBoost = async (boost) => {
  const data = {
    boostId: boost.id,
    timestamp: Math.floor(Date.now() / 1000),
  };

  try {
    const { clickerUser } = await fetchData({ url: 'buy-boost', data });

    if (clickerUser) {
      const { availableTaps } = clickerUser;
      const { id, } = boost;

      console.log(`\nКуплен бесплатный буст «${id}»\nТекущая энергия: ${availableTaps.toLocaleString('ru-RU')}`);

      return clickerUser;
    }
  } catch (error) {
    console.error(`\nОшибка при покупке бесплатного буста «${boost.id}»:`, error);
    return null;
  }
};

const buyFreeBoosts = async () => {
  try {
    const boosts = await getFreeAvailableBoosts();

    if (boosts[0]) {
      return await buyBoost(boosts[0]);
    }

    return null;
  } catch (error) {
    console.error('\nОшибка при покупке бесплатных бустов:', error);
    return null;
  }
};

module.exports = { buyFreeBoosts };