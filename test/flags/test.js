import test from 'ava';
import meow from '../../source/index.js';

const verifyFlags = test.macro((t, {flags = {}, args, expected}) => {
	const cli = meow({importMeta: import.meta, argv: args.split(' '), flags});
	t.like(cli.flags, expected);
});

test('flag types', verifyFlags, {
	flags: {
		foo: {type: 'string'},
		bar: {type: 'number'},
		baz: {type: 'boolean'},
	},
	args: '--foo=bar --bar=1.3 --baz=false',
	expected: {
		foo: 'bar',
		bar: 1.3,
		baz: false,
	},
});

test('flag, no value', verifyFlags, {
	flags: {
		foo: {type: 'string'},
		bar: {type: 'number'},
	},
	args: '--foo --bar',
	expected: {
		foo: '',
		bar: undefined,
	},
});

test('default - flag, no value', verifyFlags, {
	flags: {
		foo: {type: 'string', default: 'bar'},
		bar: {type: 'number', default: 1.3},
	},
	args: '--foo --bar',
	expected: {
		foo: 'bar',
		bar: 1.3,
	},
});

test('default - no flag', verifyFlags, {
	flags: {
		foo: {type: 'string', default: 'bar'},
		bar: {type: 'number', default: 1.3},
	},
	args: '',
	expected: {
		foo: 'bar',
		bar: 1.3,
	},
});

test('single character flag casing should be preserved', verifyFlags, {
	args: '-F',
	expected: {
		F: true,
	},
});
