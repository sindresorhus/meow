import test from 'ava';
import meow from '../source/index.js';

const importMeta = import.meta;

test('isMultiple - unset flag returns empty array', t => {
	t.deepEqual(meow({
		importMeta,
		argv: [],
		flags: {
			foo: {
				type: 'string',
				isMultiple: true,
			},
		},
	}).flags, {
		foo: [],
	});
});

test('isMultiple - flag set once returns array', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo=bar'],
		flags: {
			foo: {
				type: 'string',
				isMultiple: true,
			},
		},
	}).flags, {
		foo: ['bar'],
	});
});

test('isMultiple - flag set multiple times', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo=bar', '--foo=baz'],
		flags: {
			foo: {
				type: 'string',
				isMultiple: true,
			},
		},
	}).flags, {
		foo: ['bar', 'baz'],
	});
});

test('isMultiple - flag with space separated values', t => {
	const {input, flags} = meow({
		importMeta,
		argv: ['--foo', 'bar', 'baz'],
		flags: {
			foo: {
				type: 'string',
				isMultiple: true,
			},
		},
	});

	t.deepEqual(input, ['baz']);
	t.deepEqual(flags.foo, ['bar']);
});

test('isMultiple - flag with comma separated values', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo', 'bar,baz'],
		flags: {
			foo: {
				type: 'string',
				isMultiple: true,
			},
		},
	}).flags, {
		foo: ['bar,baz'],
	});
});

test('isMultiple - default to type string', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo=bar'],
		flags: {
			foo: {
				isMultiple: true,
			},
		},
	}).flags, {
		foo: ['bar'],
	});
});

test('isMultiple - boolean flag', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo', '--foo=false'],
		flags: {
			foo: {
				type: 'boolean',
				isMultiple: true,
			},
		},
	}).flags, {
		foo: [true, false],
	});
});

test('isMultiple - boolean flag is false by default', t => {
	t.deepEqual(meow({
		importMeta,
		argv: [],
		flags: {
			foo: {
				type: 'boolean',
				isMultiple: true,
			},
		},
	}).flags, {
		foo: [false],
	});
});

test('isMultiple - number flag', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo=1.3', '--foo=-1'],
		flags: {
			foo: {
				type: 'number',
				isMultiple: true,
			},
		},
	}).flags, {
		foo: [1.3, -1],
	});
});

test('isMultiple - flag default values', t => {
	t.deepEqual(meow({
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
	}).flags, {
		string: ['foo'],
		boolean: [true],
		number: [0.5],
	});
});

test('isMultiple - multiple flag default values', t => {
	t.deepEqual(meow({
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
	}).flags, {
		string: ['foo', 'bar'],
		boolean: [true, false],
		number: [0.5, 1],
	});
});

// Happened in production 2020-05-10: https://github.com/sindresorhus/meow/pull/143#issuecomment-626287226
test('isMultiple - handles multi-word flag name', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo-bar=baz'],
		flags: {
			fooBar: {
				type: 'string',
				isMultiple: true,
			},
		},
	}).flags, {
		fooBar: ['baz'],
	});
});
