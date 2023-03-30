import test from 'ava';
import {stripIndent} from 'common-tags';
import meow from '../source/index.js';

const importMeta = import.meta;

/**
A convenience-wrapper around `t.throws` with `meow`.

@param {import('../index').Options} options `meow` options with `importMeta` set
@param {string} message The thrown error message. Strips indentation, so template literals can be used.
*/
const meowThrows = test.macro((t, options, {message}) => {
	options = {
		importMeta,
		...options,
	};

	message = stripIndent(message);

	t.throws(() => meow(options), {message});
});

test('invalid package url', meowThrows, {
	importMeta: '/path/to/package',
}, {message: 'The `importMeta` option is required. Its value must be `import.meta`.'});

test('supports `number` flag type - throws on incorrect default value', meowThrows, {
	argv: [],
	flags: {
		foo: {
			type: 'number',
			default: 'x',
		},
	},
}, {message: 'Expected "foo" default value to be of type "number", got "string"'});

test('flag declared in kebab-case is an error', meowThrows, {
	flags: {'kebab-case': 'boolean', test: 'boolean', 'another-one': 'boolean'},
}, {message: 'Flag keys may not contain \'-\'. Invalid flags: `kebab-case`, `another-one`'});

test('single flag set more than once is an error', meowThrows, {
	argv: ['--foo=bar', '--foo=baz'],
	flags: {
		foo: {
			type: 'string',
		},
	},
}, {message: 'The flag --foo can only be set once.'});

test('suggests renaming alias to shortFlag', meowThrows, {
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
}, {message: 'The option `alias` has been renamed to `shortFlag`. The following flags need to be updated: `--foo`, `--bar`'});

test('options - multiple validation errors', meowThrows, {
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
}, {message: `
	Flag keys may not contain '-'. Invalid flags: \`some-thing\`
	The option \`alias\` has been renamed to \`shortFlag\`. The following flags need to be updated: \`--plant\`
	The option \`choices\` must be an array. Invalid flags: \`--animal\`
`});
