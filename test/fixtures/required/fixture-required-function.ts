#!/usr/bin/env tsimp
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
			// TODO: change type to allow truthy / falsy values?
			// @ts-expect-error: falsy trigger is still boolean
			isRequired: (flags, _) => flags.trigger,
		},
		allowError: {
			type: 'boolean',
			shortFlag: 'a',
		},
		shouldError: {
			type: 'boolean',
			// @ts-expect-error: invalid string return
			isRequired: (flags, _) => flags.allowError ? 'should error' : false,
		},
	},
});

// TODO: errors above make flags untyped
// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
console.log(`${cli.flags.trigger},${cli.flags.withTrigger}`);
