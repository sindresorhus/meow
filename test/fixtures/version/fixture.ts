#!/usr/bin/env tsimp
import process from 'node:process';
import meow from '../../../source/index.js';

const version = (process.env.VERSION === 'false' ? false : process.env.VERSION) as string | undefined;

const options = {
	importMeta: import.meta,
	version,
	autoVersion: !process.argv.includes('--no-auto-version'),
	flags: {
		showVersion: {type: 'boolean'} as const,
	},
};

if (options.version === undefined) {
	delete options.version;
}

const cli = meow(options);

if (cli.flags.showVersion) {
	cli.showVersion();
}
