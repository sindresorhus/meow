#!/usr/bin/env node
import process from 'node:process';
import meow from '../../../source/index.js';

const version = process.env.VERSION === 'false' ? false : process.env.VERSION;

const options = {
	importMeta: import.meta,
	version,
	autoVersion: !process.argv.includes('--no-auto-version'),
	flags: {
		showVersion: {type: 'boolean'},
	},
};

if (options.version === undefined) {
	delete options.version;
}

const cli = meow(options);

if (cli.flags.showVersion) {
	cli.showVersion();
}
