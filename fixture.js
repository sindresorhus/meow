#!/usr/bin/env node
'use strict';
const meow = require('.');

const cli = meow({
	description: 'Custom description',
	help: `
		Usage
		  foo <input>
  `,
	autoVersion: process.argv.indexOf('--no-auto-version') === -1,
	autoHelp: process.argv.indexOf('--no-auto-help') === -1,
	flags: {
		unicorn: {
			alias: 'u',
			required: (args) => {
				if (args.meow) return true;
				return false;
			},
		},
		meow: { required: true },
		camelCaseOption: { default: 'foo' },
		fire: { alias: 'f', default: 'fire' },
	},
});

if (cli.flags.camelCaseOption === 'foo') {
	Object.keys(cli.flags).forEach((x) => {
		console.log(x);
	});
} else {
	console.log(cli.flags.camelCaseOption);
}
