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
		trigger: {
			type: 'boolean',
			alias: 't'
		},
		withTrigger: {
			type: 'string',
			isRequired: (flags, _) => {
				return flags.trigger;
			}
		}
	}
});
console.log(`${cli.flags.trigger},${cli.flags.withTrigger}`);
