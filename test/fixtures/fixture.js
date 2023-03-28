#!/usr/bin/env node
import process from 'node:process';
import meow from '../../index.js';

const cli = meow({
	importMeta: import.meta,
	description: 'Custom description',
	help: `
		Usage
		  foo <input>
  	`,
	autoVersion: !process.argv.includes('--no-auto-version'),
	autoHelp: !process.argv.includes('--no-auto-help'),
	flags: {
		unicorn: {shortFlag: 'u'},
		meow: {default: 'dog'},
		camelCaseOption: {default: 'foo'},
	},
});

if (cli.flags.camelCaseOption === 'foo') {
	for (const x of Object.keys(cli.flags)) {
		console.log(x);
	}
} else {
	console.log(cli.flags.camelCaseOption);
}
