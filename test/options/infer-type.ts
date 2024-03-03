import test from 'ava';
import meow from '../../source/index.js';
import type {MeowOptions} from '../_utils.js';

type MacroArguments = [{
	cli: MeowOptions;
	expected: string | number;
}];

const verifyTypeInference = test.macro<MacroArguments>((t, {cli: cliArguments, expected}) => {
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
	cli: { // eslint-disable-line @typescript-eslint/consistent-type-assertions
		argv: ['5'],
		input: 'number',
	} as MeowOptions,
	expected: 5,
});

test('works with flags', verifyTypeInference, {
	cli: {
		argv: ['5'],
		inferType: true,
		flags: {
			foo: {type: 'string'},
		},
	},
	expected: 5,
});
