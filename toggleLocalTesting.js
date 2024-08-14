const fs = require('fs');
const path = require('path');

const configFilePath = path.join(__dirname, 'config.ts');

function setLocalTesting(value) {
  const configFile = fs.readFileSync(configFilePath, 'utf8');
  const updatedConfigFile = configFile.replace(/(export let isLocalTesting = )(true|false);/, `$1${value};`);
  fs.writeFileSync(configFilePath, updatedConfigFile, 'utf8');
}

if (process.argv[2] === 'on') {
  setLocalTesting(true);
} else if (process.argv[2] === 'off') {
  setLocalTesting(false);
}
