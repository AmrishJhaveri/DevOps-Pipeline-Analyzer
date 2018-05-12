// The module which contains the application of logic of fetching the data from
// github api and parsing the jenkinsfile to answer questions.
const q1 = require('./app/q1/q1.js');
const q2 = require('./app/q2/q2.js');
const q3 = require('./app/q3/q3.js');
const q4 = require('./app/q4/q4.js');

// Fires all questions.
// PLEASE DO NOT USE THIS. Execute all questions independently.
// You will get a message 'You have triggered an abuse detection mechanism.'
// from Github Api
async function startApp() {
  let promises = [];
  promises.push(q1.startProcess());
  promises.push(q2.startProcess());
  promises.push(q3.startProcess());
  promises.push(q4.startProcess());
  await Promise.all(promises);
}

// This is commented as a precaution. So application cannot be started. If used
// then file paths in all independent questions needs to be changed.

// startApp();