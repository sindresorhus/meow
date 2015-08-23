# meow [![Build Status](https://travis-ci.org/sindresorhus/meow.svg?branch=master)](https://travis-ci.org/sindresorhus/meow)

> CLI app helper

![](meow.gif)


## Features

- Parses arguments using [minimist](https://github.com/substack/minimist)
- Converts flags to [camelCase](https://github.com/sindresorhus/camelcase)
- Outputs version when `--version`
- Outputs description and supplied help text when `--help`


## Install

```
$ npm install --save meow
```


## Usage

```
$ ./foo-app.js unicorns --rainbow-cake
```

```js
#!/usr/bin/env node
'use strict';
var meow = require('meow');
var fooApp = require('./');

var cli = meow({
	help: [
		'Usage',
		'  foo-app <input>'
	]
});
/*
{
	input: ['unicorns'],
	flags: {rainbowCake: true},
	...
}
*/

fooApp(cli.input[0], cli.flags);
```


## API

### meow(options, minimistOptions)

Returns an object with:

- `input` *(array)* - Non-flag arguments
- `flags` *(object)* - Flags converted to camelCase
- `pkg` *(object)* - The `package.json` object
- `help` *(object)* - The help text used with `--help`
- `showHelp([code=0])` *(function)* - Show the help text and exit with `code`

#### options

Type: `object`, `array`, `string`

If `options` is an array or a string it'll work as a help shortcut. E.g:

```js
var cli = meow([
	'Usage',
	'  foo-app <input>'
]);

console.log(cli.help);

/*
My example app

Usage
  foo-app <input>
*/
```

##### help

Type: `array`, `string`, `boolean`

The help text you want shown.

If it's an array each item will be a line.

If you don't specify anything, it will still show the package.json `"description"`.

Set it to `false` to disable it all together.

##### version

Type: `string`, `boolean`  
Default: the package.json `"version"` property

Set a custom version output.

Set it to `false` to disable it all together.

##### pkg

Type: `string`, `object`  
Default: `package.json`

Relative path to `package.json` or it as an object.

##### argv

Type: `array`  
Default: `process.argv.slice(2)`

Custom arguments object.

#### minimistOptions

Type: `object`  
Default: `{}`

Minimist [options](https://github.com/substack/minimist#var-argv--parseargsargs-opts).


## Tips

See [`get-stdin`](https://github.com/sindresorhus/get-stdin) if you want to accept input from stdin.

See [`update-notifier`](https://github.com/yeoman/update-notifier) if you want update notifications.

See [`configstore`](https://github.com/yeoman/configstore) if you need to persist some data.

[More useful CLI utilities.](https://github.com/sindresorhus/awesome-nodejs#command-line-utilities)


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
