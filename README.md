# ubolt

![npm](https://img.shields.io/npm/v/ubolt?style=for-the-badge)

A simple command alias utility that helps manage global user aliases along with per-directory aliases.

To install:

```
npm install -g ubolt
```

## User configuration

For user level commands, create a `.ubolt.yaml` file in your home directory. In the file, add an entry for any global command alias you want.
For example:

```
status:
    command: git status
    description: Perform a git status
pull:
    command: git pull
    description: Perform a git pull
```

Now you can execute these commands anywhere by simply:

```
ubolt status
ubolt pull
```

Creating aliases for these commands isn't that useful, but when you have a really long command line like when using docker, this becomes really helpful!

## Local configuration

What makes `ubolt` more awesome is setting up local command aliases. Unlike the aliases you set in the shell, having directory level aliases lets you put
project specific commands that will only show up when executing `ubolt` while that directory is your current directory. For example:

```
ubolt-info:
    command: npm info ubolt
    description: Display npm information for ubolt
```

Now only when you are in this directory you can execute:

```
ubolt ubolt-info
```

## Global alias

I suggest you setup an alias for ubolt itself to something very short. If you are using `zsh`, then you can create an alias like this in your `.zshrc`:

```
alias u=ubolt
```

Then the commands are even less verbose:

```
u status
u pull
u ubolt-info
```

## Alias discovery

If you just type in `ubolt`, or give it an alias not found, it will display all the user & local aliases it can find, based on your current directory.

## Naming

I wanted to make a very fast alias command executor, so why not name it after the worlds fastest man?
