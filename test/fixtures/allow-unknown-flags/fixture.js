#!/usr/bin/env node
import process from 'node:process';
import meow from '../../../source/index.js';

const cli = meow({
	importMeta: import.meta,
	description: 'Custom description',
	help: `
		Usage
		  foo <input>
  	`,
	autoVersion: !process.argv.includes('--no-auto-version'),
	autoHelp: !process.argv.includes('--no-auto-help'),
	allowUnknownFlags: false,
	flags: {
		foo: {
			type: 'string',
		},
		// For testing we need those as known flags
		noAutoHelp: {
			type: 'boolean',
		},
		noAutoVersion: {
			type: 'boolean',
		},
	},
});

console.log(cli.flags.foo);
