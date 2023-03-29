#!/usr/bin/env node
import meow from '../../../source/index.js';

const cli = meow({
	importMeta: import.meta,
	description: 'Custom description',
	help: `
		Usage
		  foo <input>
  	`,
	flags: {
		trigger: {
			type: 'boolean',
			shortFlag: 't',
		},
		withTrigger: {
			type: 'string',
			isRequired: (flags, _) => flags.trigger,
		},
		allowError: {
			type: 'boolean',
			shortFlag: 'a',
		},
		shouldError: {
			type: 'boolean',
			isRequired: (flags, _) =>
				flags.allowError ? 'should error' : false
			,
		},
	},
});

console.log(`${cli.flags.trigger},${cli.flags.withTrigger}`);
