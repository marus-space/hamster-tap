#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const { initialize } = require('./src/api');
const { scheduleNextTap } = require('./src/scheduleNextTap');
const { claimDailyCipher } = require('./src/claimDailyCipher');
const { checkTasks } = require('./src/checkTasks');

program
  .version('1.0.0')
  .option('-f, --file <path>', 'Path to JSON file with parameters');

program.parse(process.argv);

const options = program.opts();

if (!options.file) {
  console.error('Error: Path to JSON file with parameters is required');
  process.exit(1);
}

let config;

try {
  const data = fs.readFileSync(options.file, 'utf8');
  config = JSON.parse(data);
} catch (err) {
  console.error('Error reading or parsing file:', err);
  process.exit(1);
}

initialize(config);

setTimeout(async () => {
  console.warn('Тапалка включена');
  await claimDailyCipher();
  await checkTasks();
  await scheduleNextTap(config);
}, 0);
