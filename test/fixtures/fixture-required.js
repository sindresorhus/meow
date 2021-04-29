#!/usr/bin/env node
'use strict';
import path from 'node:path';
import meow from '../../index.js';

const cli = meow({
	packagePath: path.join(import.meta.url, '../..'),
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
		number: {
			type: 'number',
			isRequired: true
		},
		kebabCase: {
			type: 'string',
			isRequired: true
		},
		notRequired: {
			type: 'string'
		}
	}
});

console.log(`${cli.flags.test},${cli.flags.number}`);
