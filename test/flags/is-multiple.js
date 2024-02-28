import test from 'ava';
import meow from '../../source/index.js';
import {_verifyFlags} from './_utils.js';

const importMeta = import.meta;
const verifyFlags = _verifyFlags(importMeta);

test('unset flag returns empty array', verifyFlags, {
	flags: {
		foo: {
			type: 'string',
			isMultiple: true,
		},
	},
	expected: {
		foo: [],
	},
});

test('flag set once returns array', verifyFlags, {
	flags: {
		foo: {
			type: 'string',
			isMultiple: true,
		},
	},
	args: '--foo=bar',
	expected: {
		foo: ['bar'],
	},
});

test('flag set multiple times', verifyFlags, {
	flags: {
		foo: {
			type: 'string',
			isMultiple: true,
		},
	},
	args: '--foo=bar --foo=baz',
	expected: {
		foo: ['bar', 'baz'],
	},
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

test('does not support comma separated values', verifyFlags, {
	flags: {
		foo: {
			type: 'string',
			isMultiple: true,
		},
	},
	args: '--foo bar,baz',
	expected: {
		foo: ['bar,baz'],
	},
});

test('default to type string', verifyFlags, {
	flags: {
		foo: {
			isMultiple: true,
		},
	},
	args: '--foo=bar',
	expected: {
		foo: ['bar'],
	},
});

test('boolean flag', verifyFlags, {
	flags: {
		foo: {
			type: 'boolean',
			isMultiple: true,
		},
	},
	args: '--foo --foo=false',
	expected: {
		foo: [true, false],
	},
});

test('boolean flag is false by default', verifyFlags, {
	flags: {
		foo: {
			type: 'boolean',
			isMultiple: true,
		},
	},
	expected: {
		foo: [false],
	},
});

test('number flag', verifyFlags, {
	flags: {
		foo: {
			type: 'number',
			isMultiple: true,
		},
	},
	args: '--foo=1.3 --foo=-1',
	expected: {
		foo: [1.3, -1],
	},
});

test('flag default values', verifyFlags, {
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
	expected: {
		string: ['foo'],
		boolean: [true],
		number: [0.5],
	},
});

test('multiple flag default values', verifyFlags, {
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
	expected: {
		string: ['foo', 'bar'],
		boolean: [true, false],
		number: [0.5, 1],
	},
});

// Happened in production 2020-05-10: https://github.com/sindresorhus/meow/pull/143#issuecomment-626287226
test('handles multi-word flag name', verifyFlags, {
	flags: {
		fooBar: {
			type: 'string',
			isMultiple: true,
		},
	},
	args: '--foo-bar=baz',
	expected: {
		fooBar: ['baz'],
	},
});

test('works with short flags', verifyFlags, {
	flags: {
		foo: {
			type: 'string',
			shortFlag: 'f',
			isMultiple: true,
		},
	},
	args: '-f bar -f baz',
	expected: {
		foo: ['bar', 'baz'],
	},
});
