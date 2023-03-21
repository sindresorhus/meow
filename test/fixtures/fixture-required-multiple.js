#!/usr/bin/env node
import meow from '../../index.js';

const cli = meow({
	importMeta: import.meta,
	description: 'Custom description',
	help: `
		Usage
		  foo <input>
  `,
	flags: {
		test: {
			type: 'number',
			shortFlag: 't',
			isRequired: true,
			isMultiple: true,
		},
	},
});

console.log(cli.flags.test);
