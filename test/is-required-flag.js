import test from 'ava';
import {spawnFixture} from './_utils.js';

const fixtureFolder = 'required';

const required = `${fixtureFolder}/fixture.js`;
const requiredFunction = `${fixtureFolder}/fixture-required-function.js`;
const requiredMultiple = `${fixtureFolder}/fixture-required-multiple.js`;
const conditionalRequiredMultiple = `${fixtureFolder}/fixture-conditional-required-multiple.js`;

test('spawn cli and test not specifying required flags', async t => {
	const {stderr} = await t.throwsAsync(
		spawnFixture(required),
		{message: /^Command failed with exit code 2/},
	);

	t.regex(stderr, /Missing required flag/);
	t.regex(stderr, /--test, -t/);
	t.regex(stderr, /--number/);
	t.regex(stderr, /--kebab-case/);
	t.notRegex(stderr, /--not-required/);
});

test('spawn cli and test specifying all required flags', async t => {
	const {stdout} = await spawnFixture(required, ['-t', 'test', '--number', '6', '--kebab-case', 'test']);
	t.is(stdout, 'test,6');
});

test('spawn cli and test specifying required string flag with an empty string as value', async t => {
	const {stderr} = await t.throwsAsync(
		spawnFixture(required, ['--test', '']),
		{message: /^Command failed with exit code 2/},
	);

	t.regex(stderr, /Missing required flag/);
	t.notRegex(stderr, /--test, -t/);
});

test('spawn cli and test specifying required number flag without a number', async t => {
	const {stderr} = await t.throwsAsync(
		spawnFixture(required, ['--number']),
		{message: /^Command failed with exit code 2/},
	);

	t.regex(stderr, /Missing required flag/);
	t.regex(stderr, /--number/);
});

test('spawn cli and test setting isRequired as a function and not specifying any flags', async t => {
	const {stdout} = await spawnFixture(requiredFunction);
	t.is(stdout, 'false,undefined');
});

test('spawn cli and test setting isRequired as a function and specifying only the flag that activates the isRequired condition for the other flag', async t => {
	const {stderr} = await t.throwsAsync(
		spawnFixture(requiredFunction, ['--trigger']),
		{message: /^Command failed with exit code 2/},
	);

	t.regex(stderr, /Missing required flag/);
	t.regex(stderr, /--with-trigger/);
});

test('spawn cli and test setting isRequired as a function and specifying both the flags', async t => {
	const {stdout} = await spawnFixture(requiredFunction, ['--trigger', '--withTrigger', 'specified']);
	t.is(stdout, 'true,specified');
});

test('spawn cli and test setting isRequired as a function and check if returning a non-boolean value throws an error', async t => {
	const {stderr} = await t.throwsAsync(
		spawnFixture(requiredFunction, ['--allowError', '--shouldError', 'specified']),
		{message: /^Command failed with exit code 1/},
	);

	t.regex(stderr, /Return value for isRequired callback should be of type boolean, but string was returned./);
});

test('spawn cli and test isRequired with isMultiple giving a single value', async t => {
	const {stdout} = await spawnFixture(requiredMultiple, ['--test', '1']);
	t.is(stdout, '[ 1 ]');
});

test('spawn cli and test isRequired with isMultiple giving multiple values', async t => {
	const {stdout} = await spawnFixture(requiredMultiple, ['--test', '1', '--test', '2']);
	t.is(stdout, '[ 1, 2 ]');
});

test('spawn cli and test isRequired with isMultiple giving no values, but flag is given', async t => {
	const {stderr} = await t.throwsAsync(
		spawnFixture(requiredMultiple, ['--test']),
		{message: /^Command failed with exit code 2/},
	);

	t.regex(stderr, /Missing required flag/);
	t.regex(stderr, /--test/);
});

test('spawn cli and test isRequired with isMultiple giving no values, but flag is not given', async t => {
	const {stderr} = await t.throwsAsync(
		spawnFixture(requiredMultiple),
		{message: /^Command failed with exit code 2/},
	);

	t.regex(stderr, /Missing required flag/);
	t.regex(stderr, /--test/);
});

test('spawn cli and test isRequire function that returns false with isMultiple given no values, but flag is not given', async t => {
	const {stdout} = await spawnFixture(conditionalRequiredMultiple);
	t.is(stdout, '[]');
});
