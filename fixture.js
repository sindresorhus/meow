#!/usr/bin/env node
'use strict';
const meow = require('.');

const cli = meow({
	description: 'Custom description',
	help: `
		Usage
		  foo <input>
  `,
  autoVersion: !process.argv.includes('--no-auto-version'),
  autoHelp: !process.argv.includes('--no-auto-help')
}, {
	alias: {
		u: 'unicorn'
	},
	default: {
		meow: 'dog',
		camelCaseOption: 'foo'
	}
});

if (cli.flags.camelCaseOption === 'foo') {
	Object.keys(cli.flags).forEach(x => {
		console.log(x);
	});
} else {
	console.log(cli.flags.camelCaseOption);
}
