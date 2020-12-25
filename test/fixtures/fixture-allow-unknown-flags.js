#!/usr/bin/env node
'use strict';
const meow = require('../..');

const cli = meow({
	description: 'Custom description',
	help: `
		Usage
		  foo <input>
  `,
	allowUnknownFlags: false,
	flags: {
		foo: {
			type: 'string'
		}
	}
});

console.log(cli.flags.foo);
