const { fetchData } = require('./api');
const { formatTime } = require('./formatTime');

const getUncompletedTasks = async () => {
  try {
    const { tasks } = await fetchData({ url: 'list-tasks' });

    const uncompletedTasks = tasks.filter(({ id, isCompleted }) => !isCompleted && id !== 'invite_friends');

    return uncompletedTasks;
  } catch (error) {
    console.error('\nОшибка при получении незавершенных заданий:', error);
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
        console.log(`\nЗадание ${id} успешно выполнено!\nБаланс: ${balanceCoins.toLocaleString()}`);
      }
    }
  } catch (error) {
    console.error(`\nОшибка при выполнении задания ${task.id}:`, error);
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
    const timeout = 3 * 60 ** 2 * 1000; // 3 часа в мс
    
    console.log(`\nСледующее выполнение незавершенных заданий через ${formatTime(timeout)}...`);

    setTimeout(async () => await checkTasks(), timeout);
  }
};

module.exports = { checkTasks };
