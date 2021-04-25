#!/usr/bin/env node
import meow from '../../index.js';

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
		},
		allowError: {
			type: 'boolean',
			alias: 'a'
		},
		shouldError: {
			type: 'boolean',
			isRequired: (flags, _) => {
				if (flags.allowError) {
					return 'should error';
				}

				return false;
			}
		}
	}
});

console.log(`${cli.flags.trigger},${cli.flags.withTrigger}`);
