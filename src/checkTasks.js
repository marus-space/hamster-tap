const { fetchData } = require('./api');
const { formatTime } = require('./formatTime');
const { getRandomInRange } = require('./getRandomInRange');

const getUncompletedTasks = async () => {
  try {
    const { tasks } = await fetchData({ url: 'list-tasks' });

    const uncompletedTasks = tasks.filter(({ id, isCompleted }) => !isCompleted && id !== 'invite_friends');

    return uncompletedTasks;
  } catch (error) {
    console.error('\nОшибка при получении незавершенных заданий:', error);
    return [];
  }
};

const checkTask = async (task) => {
  const data = {
    taskId: task.id,
  };

  try {
    const { clickerUser, task } = await fetchData({ url: 'check-task', data });

    if (clickerUser && task) {
      const { balanceCoins } = clickerUser;
      const { id, isCompleted } = task;

      if (isCompleted) {
        console.log(`\nЗадание «${id}» успешно выполнено!\nБаланс: ${balanceCoins.toLocaleString('ru-RU')}`);
      }
    }
  } catch (error) {
    console.error(`\nОшибка при выполнении задания «${task.id}»:`, error);
  }
};

const checkTasks = async () => {
  try {
    const tasks = await getUncompletedTasks();

    for (const task of tasks) {
      await checkTask(task);
    }
  } catch (error) {
    console.error('\nОшибка при выполнении незавершенных заданий:', error);
  } finally {
    const timeout = getRandomInRange(2 * 60 ** 2 * 1000, 4 * 60 ** 2 * 1000); // От 2 до 4 часов в мс
    
    console.log(`\nСледующее выполнение незавершенных заданий через ${formatTime(timeout)}...`);

    setTimeout(async () => await checkTasks(), timeout);
  }
};

module.exports = { checkTasks };
