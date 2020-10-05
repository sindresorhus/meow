#!/usr/bin/env node
'use strict';
const meow = require('../..');

const cli = meow({
	description: 'Custom description',
	help: `
		Usage
		  foo <input>
  `,
	flags: {
		test: {
			type: 'string',
			alias: 't',
			isRequired: true
		},
		'kebab-case': {
			type: 'string',
			isRequired: true
		},
		number: {
			type: 'number',
			isRequired: true
		},
		notRequired: {
			type: 'string'
		}
	}
});

console.log(`${cli.flags.test},${cli.flags.kebabCase},${cli.flags.number}`);
