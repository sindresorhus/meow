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
			type: 'number',
			alias: 't',
			isRequired: true,
			isMultiple: true
		}
	}
});

console.log(cli.flags.test);
