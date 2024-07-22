const formatTime = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const remainingSeconds = seconds % 60;
  const remainingMinutes = minutes % 60;
  const remainingHours = hours % 24;

  if (days > 0) {
    return `${days} дн${remainingHours ? ` ${remainingHours} ч` : ''}`;
  } else if (hours > 0) {
    return `${hours} ч${remainingMinutes ? ` ${remainingMinutes} мин` : ''}`;
  } else if (minutes > 0) {
    return `${minutes} мин${remainingSeconds ? ` ${remainingSeconds} сек` : ''}`;
  } else {
    return `${seconds} сек`;
  }
};

module.exports = { formatTime };
