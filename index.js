// The module which contains the application of logic of fetching the data from
// github api and parsing the jenkinsfile to answer questions.
const q1 = require('./app/q1/q1.js');
const q2 = require('./app/q2/q2.js');
const q3 = require('./app/q3/q3.js');
const q4 = require('./app/q4/q4.js');

// Fires all questions.
// PLEASE DO NOT USE THIS. Execute all questions independently.
// You will get a message 'You have triggered an abuse detection mechanism.'
async function startApp() {
  await q1.startProcess();
  await q2.startProcess();
  await q3.startProcess();
  await q4.startProcess();
}

// startApp();