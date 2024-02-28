import test from 'ava';
import {_verifyCli, stripIndentTrim} from '../_utils.js';

const fixtureFolder = 'required';

const required = `${fixtureFolder}/fixture.js`;
const requiredFunction = `${fixtureFolder}/fixture-required-function.js`;
const requiredMultiple = `${fixtureFolder}/fixture-required-multiple.js`;
const conditionalRequiredMultiple = `${fixtureFolder}/fixture-conditional-required-multiple.js`;

const verifyFlags = _verifyCli(required);

test('not specifying required flags', verifyFlags, {
	error: stripIndentTrim`
		Missing required flags
			--test, -t
			--number
			--kebab-case
	`,
});

test('specifying all required flags', verifyFlags, {
	args: '--test test --number 6 --kebab-case test',
	expected: 'test,6',
});

test('specifying required string flag with an empty string as value', verifyFlags, {
	args: '--test ',
	error: stripIndentTrim`
		Missing required flags
			--number
			--kebab-case
	`,
});

test('specifying required number flag without a number', verifyFlags, {
	args: '--number',
	error: stripIndentTrim`
		Missing required flags
			--test, -t
			--number
			--kebab-case
	`,
});

test('setting isRequired as a function and not specifying any flags', verifyFlags, {
	fixture: requiredFunction,
	expected: 'false,undefined',
});

test('setting isRequired as a function and specifying only the flag that activates the isRequired condition for the other flag', verifyFlags, {
	fixture: requiredFunction,
	args: '--trigger',
	error: stripIndentTrim`
		Missing required flag
			--with-trigger
	`,
});

test('setting isRequired as a function and specifying both the flags', verifyFlags, {
	fixture: requiredFunction,
	args: '--trigger --withTrigger specified',
	expected: 'true,specified',
});

test('setting isRequired as a function and check if returning a non-boolean value throws an error', verifyFlags, {
	fixture: requiredFunction,
	args: '--allowError --shouldError specified',
	error: {
		clean: true,
		message: 'TypeError: Return value for isRequired callback should be of type boolean, but string was returned.',
		code: 1,
	},
});

test('isRequired with isMultiple giving a single value', verifyFlags, {
	fixture: requiredMultiple,
	args: '--test 1',
	expected: '[ 1 ]',
});

test('isRequired with isMultiple giving multiple values', verifyFlags, {
	fixture: requiredMultiple,
	args: '--test 1 --test 2',
	expected: '[ 1, 2 ]',
});

test('isRequired with isMultiple giving no values, but flag is given', verifyFlags, {
	fixture: requiredMultiple,
	args: '--test',
	error: stripIndentTrim`
		Missing required flag
			--test, -t
	`,
});

test('isRequired with isMultiple giving no values, but flag is not given', verifyFlags, {
	fixture: requiredMultiple,
	error: stripIndentTrim`
		Missing required flag
			--test, -t
	`,
});

test('isRequire function that returns false with isMultiple given no values, but flag is not given', verifyFlags, {
	fixture: conditionalRequiredMultiple,
	expected: '[]',
});
