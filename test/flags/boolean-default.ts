import test from 'ava';
import {_verifyFlags} from './_utils.js';

const verifyFlags = _verifyFlags(import.meta);

test('undefined - filter out unset boolean args', verifyFlags, {
	booleanDefault: undefined,
	flags: {
		foo: {
			type: 'boolean',
		},
		bar: {
			type: 'boolean',
		},
		baz: {
			type: 'boolean',
			default: false,
		},
	},
	args: '--foo',
	expected: {
		foo: true,
		bar: undefined,
		baz: false,
	},
});

test('boolean args are false by default', verifyFlags, {
	flags: {
		foo: {
			type: 'boolean',
		},
		bar: {
			type: 'boolean',
			default: true,
		},
		baz: {
			type: 'boolean',
		},
	},
	args: '--foo',
	expected: {
		foo: true,
		bar: true,
		baz: false,
	},
});

// @ts-expect-error: invalid booleanDefault
test('throws if default is null', verifyFlags, {
	booleanDefault: null,
	flags: {
		foo: {
			type: 'boolean',
		},
	},
	args: '--foo',
	error: 'Expected "foo" default value to be of type "boolean", got "null"',
});
