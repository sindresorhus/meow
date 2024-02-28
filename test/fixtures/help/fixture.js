#!/usr/bin/env node
import meow from '../../../source/index.js';

const cli = meow({
	importMeta: import.meta,
	help: 'foo',
	flags: {
		showHelp: {type: 'boolean'},
		code: {type: 'number'},
	},
});

const {code} = cli.flags;

if (cli.flags.showHelp) {
	if (code !== undefined) {
		cli.showHelp(code);
	}

	cli.showHelp();
}
