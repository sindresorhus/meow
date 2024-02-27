import test from 'ava';
import meow from '../../source/index.js';

const verifyTypeInference = test.macro((t, {cli: cliArguments, expected}) => {
	const cli = meow({importMeta: import.meta, ...cliArguments});
	t.like(cli.input, [expected]);
});

test('no inference by default', verifyTypeInference, {
	cli: {
		argv: ['5'],
	},
	expected: '5',
});

test('type inference', verifyTypeInference, {
	cli: {
		argv: ['5'],
		inferType: true,
	},
	expected: 5,
});

test('with input type', verifyTypeInference, {
	cli: {
		argv: ['5'],
		input: 'number',
	},
	expected: 5,
});

test('works with flags', verifyTypeInference, {
	cli: {
		argv: ['5'],
		inferType: true,
		flags: {foo: 'string'},
	},
	expected: 5,
});
