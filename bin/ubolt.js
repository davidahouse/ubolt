#!/usr/bin/env node
const fs = require('fs');
const chalk = require('chalk');
const pkginfo = require('pkginfo')(module);
const yaml = require('js-yaml');
const homedir = require('os').homedir();

const { execSync } = require('child_process');

const local = localCommands();
const user = userCommands();
const commands = { ...user, ...local };
const command = process.argv.length > 2 ? commands[process.argv[2]] : null;

if (command != null) {
  if (command.command != null) {
    try {
      execSync(command.command, { stdio: 'inherit' });
    } catch (e) {
      console.log('Error: ' + e);
    }
  } else if (command.commands != null) {
    for (let index = 0; index < command.commands.length; index++) {
      const singleCommand = command.commands[index];
      try {
        execSync(singleCommand, { stdio: 'inherit' });
      } catch (e) {
        console.log('Error: ' + e);
      }
    }
  }
} else {
  console.log(chalk.yellow('ubolt: ' + module.exports.version));
  console.log(chalk.yellow('User commands:'));
  Object.keys(user).forEach(function(cmd) {
    console.log(chalk.green(cmd) + ' ' + commands[cmd].description);
  });
  console.log(chalk.yellow('Local commands:'));
  Object.keys(local).forEach(function(cmd) {
    console.log(chalk.green(cmd) + ' ' + commands[cmd].description);
  });
}

/**
 * localCommands
 * @return {object} list of local commands
 */
function localCommands() {
  if (fs.existsSync('.ubolt.yaml')) {
    const localUBolt = fs.readFileSync('.ubolt.yaml');
    return yaml.safeLoad(localUBolt);
  } else {
    return {};
  }
}

/**
 * userCommands
 * @return {object} list of user commands
 */
function userCommands() {
  if (fs.existsSync(homedir + '/.ubolt.yaml')) {
    const userUBolt = fs.readFileSync(homedir + '/.ubolt.yaml');
    return yaml.safeLoad(userUBolt);
  } else {
    return {};
  }
}
