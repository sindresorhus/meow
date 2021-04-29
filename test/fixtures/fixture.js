#!/usr/bin/env node
import path from 'node:path';
import meow from '../../index.js';

const cli = meow({
	packagePath: path.join(import.meta.url, '../..'),
	description: 'Custom description',
	help: `
		Usage
		  foo <input>
  `,
	autoVersion: !process.argv.includes('--no-auto-version'),
	autoHelp: !process.argv.includes('--no-auto-help'),
	flags: {
		unicorn: {alias: 'u'},
		meow: {default: 'dog'},
		camelCaseOption: {default: 'foo'}
	}
});

if (cli.flags.camelCaseOption === 'foo') {
	for (const x of Object.keys(cli.flags)) {
		console.log(x);
	}
} else {
	console.log(cli.flags.camelCaseOption);
}
