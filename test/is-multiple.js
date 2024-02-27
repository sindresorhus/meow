import test from 'ava';
import meow from '../source/index.js';

const importMeta = import.meta;

test('unset flag returns empty array', t => {
	const cli = meow({
		importMeta,
		argv: [],
		flags: {
			foo: {
				type: 'string',
				isMultiple: true,
			},
		},
	});

	t.like(cli.flags, {
		foo: [],
	});
});

test('flag set once returns array', t => {
	const cli = meow({
		importMeta,
		argv: ['--foo=bar'],
		flags: {
			foo: {
				type: 'string',
				isMultiple: true,
			},
		},
	});

	t.like(cli.flags, {
		foo: ['bar'],
	});
});

test('flag set multiple times', t => {
	const cli = meow({
		importMeta,
		argv: ['--foo=bar', '--foo=baz'],
		flags: {
			foo: {
				type: 'string',
				isMultiple: true,
			},
		},
	});

	t.like(cli.flags, {
		foo: ['bar', 'baz'],
	});
});

test('flag with space separated values', t => {
	const cli = meow({
		importMeta,
		argv: ['--foo', 'bar', 'baz'],
		flags: {
			foo: {
				type: 'string',
				isMultiple: true,
			},
		},
	});

	t.like(cli, {
		input: ['baz'],
		flags: {
			foo: ['bar'],
		},
	});
});

test('flag with comma separated values', t => {
	const cli = meow({
		importMeta,
		argv: ['--foo', 'bar,baz'],
		flags: {
			foo: {
				type: 'string',
				isMultiple: true,
			},
		},
	});

	t.like(cli.flags, {
		foo: ['bar,baz'],
	});
});

test('default to type string', t => {
	const cli = meow({
		importMeta,
		argv: ['--foo=bar'],
		flags: {
			foo: {
				isMultiple: true,
			},
		},
	});

	t.like(cli.flags, {
		foo: ['bar'],
	});
});

test('boolean flag', t => {
	const cli = meow({
		importMeta,
		argv: ['--foo', '--foo=false'],
		flags: {
			foo: {
				type: 'boolean',
				isMultiple: true,
			},
		},
	});

	t.like(cli.flags, {
		foo: [true, false],
	});
});

test('boolean flag is false by default', t => {
	const cli = meow({
		importMeta,
		argv: [],
		flags: {
			foo: {
				type: 'boolean',
				isMultiple: true,
			},
		},
	});

	t.like(cli.flags, {
		foo: [false],
	});
});

test('number flag', t => {
	const cli = meow({
		importMeta,
		argv: ['--foo=1.3', '--foo=-1'],
		flags: {
			foo: {
				type: 'number',
				isMultiple: true,
			},
		},
	});

	t.like(cli.flags, {
		foo: [1.3, -1],
	});
});

test('flag default values', t => {
	const cli = meow({
		importMeta,
		argv: [],
		flags: {
			string: {
				type: 'string',
				isMultiple: true,
				default: ['foo'],
			},
			boolean: {
				type: 'boolean',
				isMultiple: true,
				default: [true],
			},
			number: {
				type: 'number',
				isMultiple: true,
				default: [0.5],
			},
		},
	});

	t.like(cli.flags, {
		string: ['foo'],
		boolean: [true],
		number: [0.5],
	});
});

test('multiple flag default values', t => {
	const cli = meow({
		importMeta,
		argv: [],
		flags: {
			string: {
				type: 'string',
				isMultiple: true,
				default: ['foo', 'bar'],
			},
			boolean: {
				type: 'boolean',
				isMultiple: true,
				default: [true, false],
			},
			number: {
				type: 'number',
				isMultiple: true,
				default: [0.5, 1],
			},
		},
	});

	t.like(cli.flags, {
		string: ['foo', 'bar'],
		boolean: [true, false],
		number: [0.5, 1],
	});
});

// Happened in production 2020-05-10: https://github.com/sindresorhus/meow/pull/143#issuecomment-626287226
test('handles multi-word flag name', t => {
	const cli = meow({
		importMeta,
		argv: ['--foo-bar=baz'],
		flags: {
			fooBar: {
				type: 'string',
				isMultiple: true,
			},
		},
	});

	t.like(cli.flags, {
		fooBar: ['baz'],
	});
});
