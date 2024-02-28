import test from 'ava';
import {stripIndentTrim} from '../_utils.js';
import {_verifyFlags} from './_utils.js';

const verifyFlags = _verifyFlags(import.meta);

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

test('throws if default value is not of the correct type', verifyFlags, {
	flags: {
		foo: {
			type: 'number',
			default: 'x',
		},
	},
	error: 'Expected "foo" default value to be of type "number", got "string"',
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

test('flag declared in kebab-case is an error', verifyFlags, {
	flags: {
		'kebab-case': {type: 'boolean'},
		test: {type: 'boolean'},
		'another-one': {type: 'boolean'},
	},
	error: 'Flag keys may not contain \'-\'. Invalid flags: `kebab-case`, `another-one`',
});

test('single flag set more than once is an error', verifyFlags, {
	flags: {
		foo: {
			type: 'string',
		},
	},
	args: '--foo=bar --foo=baz',
	error: 'The flag --foo can only be set once.',
});

test('options - multiple validation errors', verifyFlags, {
	flags: {
		animal: {
			type: 'string',
			choices: 'cat',
		},
		plant: {
			type: 'string',
			alias: 'p',
		},
		'some-thing': {
			type: 'string',
		},
	},
	error: stripIndentTrim`
		Flag keys may not contain '-'. Invalid flags: \`some-thing\`
		The option \`alias\` has been renamed to \`shortFlag\`. The following flags need to be updated: \`--plant\`
		The option \`choices\` must be an array. Invalid flags: \`--animal\`
	`,
});
