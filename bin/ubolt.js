#!/usr/bin/env node
const fs = require("fs");
const chalk = require("chalk");
const pkginfo = require("pkginfo")(module);
const yaml = require("js-yaml");
const homedir = require("os").homedir();
const git = require("simple-git/promise");

const { execSync } = require("child_process");

const local = localCommands();
const user = userCommands();
const commands = { ...user, ...local };
const command = process.argv.length > 2 ? commands[process.argv[2]] : null;

if (command != null) {
  if (command.command != null) {
    executeCommand(command.command, command.options);
  } else if (command.commands != null) {
    executeCommands(command.commands, command.options);
  }
} else {
  console.log(chalk.yellow("ubolt: " + module.exports.version));
  console.log(chalk.yellow("User commands:"));
  Object.keys(user).forEach(function (cmd) {
    console.log(chalk.green(cmd) + " " + commands[cmd].description);
  });
  console.log(chalk.yellow("Local commands:"));
  Object.keys(local).forEach(function (cmd) {
    console.log(chalk.green(cmd) + " " + commands[cmd].description);
  });
  process.exit(1);
}

async function executeCommand() {
  try {
    const commandToExecute = await replaceArguments(
      command.command,
      command.options
    );
    if (commandToExecute == null) {
      process.exit(1);
    }
    console.log(chalk.green(commandToExecute));
    execSync(commandToExecute, { stdio: "inherit" });
  } catch (e) {
    console.log(chalk.red(e));
    process.exit(e.status != null ? e.status : 1);
  }
}

async function executeCommands() {
  for (let index = 0; index < command.commands.length; index++) {
    const singleCommand = await replaceArguments(
      command.commands[index],
      command.options
    );
    if (singleCommand == null) {
      process.exit(1);
    }

    try {
      console.log(chalk.green(singleCommand));
      execSync(singleCommand, { stdio: "inherit" });
    } catch (e) {
      console.log(chalk.red(e));
      process.exit(e.status != null ? e.status : 1);
    }
  }
}

/**
 * localCommands
 * @return {object} list of local commands
 */
function localCommands() {
  loaded = {};
  if (fs.existsSync(".ubolt.yaml")) {
    const localUBolt = fs.readFileSync(".ubolt.yaml");
    loaded = yaml.safeLoad(localUBolt);
  }
  if (fs.existsSync(homedir + "/.ubolt.yaml")) {
    const userUBolt = fs.readFileSync(homedir + "/.ubolt.yaml");
    userloaded = yaml.safeLoad(userUBolt);
    Object.keys(userloaded).forEach(function (cmd) {
      if (userloaded[cmd].folder === process.cwd()) {
        loaded[cmd] = userloaded[cmd];
      }
    });
  }
  return loaded;
}

/**
 * userCommands
 * @return {object} list of user commands
 */
function userCommands() {
  if (fs.existsSync(homedir + "/.ubolt.yaml")) {
    const userUBolt = fs.readFileSync(homedir + "/.ubolt.yaml");
    loaded = yaml.safeLoad(userUBolt);
    result = {};
    Object.keys(loaded).forEach(function (cmd) {
      if (!loaded[cmd].folder) {
        result[cmd] = loaded[cmd];
      }
    });
    return result;
  } else {
    return {};
  }
}

/**
 * replaceArguments
 * @param {string} the command line
 * @param {string} options if any
 * @return {string} the new command line with arguments replaced
 */
async function replaceArguments(command, options) {
  if (
    options != null &&
    options.numberOfParams != null &&
    options.numberOfParams != process.argv.length - 3
  ) {
    console.log(
      chalk.red("Number of parameters supplied does not match expected amount")
    );
    return null;
  }

  let original = command;
  let position = 1;
  for (let index = 3; index < process.argv.length; index++) {
    original = original
      .split("$" + position.toString())
      .join(process.argv[index]);
    position += 1;
  }

  if (
    options != null &&
    options.usesGitBranch != null &&
    options.usesGitBranch == true
  ) {
    try {
      const result = await git().status();
      const branch = result.current;
      original = original.split("$GITBRANCH").join(branch);
    } catch (e) {
      // DO nothing, probably not a git repo directory
    }
  }

  return original;
}
