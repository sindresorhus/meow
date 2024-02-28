import test from 'ava';
import meow from '../../source/index.js';
import {_verifyFlags} from './_utils.js';

const importMeta = import.meta;
const verifyFlags = _verifyFlags(importMeta);

test('can be used in place of long flags', t => {
	const cli = meow({
		importMeta,
		argv: ['-f'],
		flags: {
			foo: {
				type: 'boolean',
				shortFlag: 'f',
			},
		},
	});

	t.like(cli.flags, {
		foo: true,
		f: undefined,
	});

	t.like(cli.unnormalizedFlags, {
		foo: true,
		f: true,
	});
});

test('grouped flags work', t => {
	const cli = meow({
		importMeta,
		argv: ['-cl'],
		flags: {
			coco: {
				type: 'boolean',
				shortFlag: 'c',
			},
			loco: {
				type: 'boolean',
				shortFlag: 'l',
			},
		},
	});

	t.like(cli.flags, {
		coco: true,
		loco: true,
		c: undefined,
		l: undefined,
	});

	t.like(cli.unnormalizedFlags, {
		coco: true,
		loco: true,
		c: true,
		l: true,
	});
});

test('suggests renaming alias to shortFlag', verifyFlags, {
	flags: {
		foo: {
			type: 'string',
			alias: 'f',
		},
		bar: {
			type: 'string',
			alias: 'b',
		},
		baz: {
			type: 'string',
			shortFlag: 'z',
		},
	},
	error: 'The option `alias` has been renamed to `shortFlag`. The following flags need to be updated: `--foo`, `--bar`',
});
