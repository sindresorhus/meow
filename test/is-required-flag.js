import test from 'ava';
import execa from 'execa';
import path from 'node:path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureRequiredPath = path.join(__dirname, 'fixtures', 'fixture-required.js');
const fixtureRequiredFunctionPath = path.join(__dirname, 'fixtures', 'fixture-required-function.js');
const fixtureRequiredMultiplePath = path.join(__dirname, 'fixtures', 'fixture-required-multiple.js');

test('spawn cli and test not specifying required flags', async t => {
	try {
		await execa(fixtureRequiredPath, []);
	} catch (error) {
		const {stderr, message} = error;
		t.regex(message, /Command failed with exit code 2/);
		t.regex(stderr, /Missing required flag/);
		t.regex(stderr, /--test, -t/);
		t.regex(stderr, /--number/);
		t.regex(stderr, /--kebab-case/);
		t.notRegex(stderr, /--not-required/);
	}
});

test('spawn cli and test specifying all required flags', async t => {
	const {stdout} = await execa(fixtureRequiredPath, [
		'-t',
		'test',
		'--number',
		'6',
		'--kebab-case',
		'test'
	]);
	t.is(stdout, 'test,6');
});

test('spawn cli and test specifying required string flag with an empty string as value', async t => {
	try {
		await execa(fixtureRequiredPath, ['--test', '']);
	} catch (error) {
		const {stderr, message} = error;
		t.regex(message, /Command failed with exit code 2/);
		t.regex(stderr, /Missing required flag/);
		t.notRegex(stderr, /--test, -t/);
	}
});

test('spawn cli and test specifying required number flag without a number', async t => {
	try {
		await execa(fixtureRequiredPath, ['--number']);
	} catch (error) {
		const {stderr, message} = error;
		t.regex(message, /Command failed with exit code 2/);
		t.regex(stderr, /Missing required flag/);
		t.regex(stderr, /--number/);
	}
});

test('spawn cli and test setting isRequired as a function and not specifying any flags', async t => {
	const {stdout} = await execa(fixtureRequiredFunctionPath, []);
	t.is(stdout, 'false,undefined');
});

test('spawn cli and test setting isRequired as a function and specifying only the flag that activates the isRequired condition for the other flag', async t => {
	try {
		await execa(fixtureRequiredFunctionPath, ['--trigger']);
	} catch (error) {
		const {stderr, message} = error;
		t.regex(message, /Command failed with exit code 2/);
		t.regex(stderr, /Missing required flag/);
		t.regex(stderr, /--with-trigger/);
	}
});

test('spawn cli and test setting isRequired as a function and specifying both the flags', async t => {
	const {stdout} = await execa(fixtureRequiredFunctionPath, ['--trigger', '--withTrigger', 'specified']);
	t.is(stdout, 'true,specified');
});

test('spawn cli and test setting isRequired as a function and check if returning a non-boolean value throws an error', async t => {
	try {
		await execa(fixtureRequiredFunctionPath, ['--allowError', '--shouldError', 'specified']);
	} catch (error) {
		const {stderr, message} = error;
		t.regex(message, /Command failed with exit code 1/);
		t.regex(stderr, /Return value for isRequired callback should be of type boolean, but string was returned./);
	}
});

test('spawn cli and test isRequired with isMultiple giving a single value', async t => {
	const {stdout} = await execa(fixtureRequiredMultiplePath, ['--test', '1']);
	t.is(stdout, '[ 1 ]');
});

test('spawn cli and test isRequired with isMultiple giving multiple values', async t => {
	const {stdout} = await execa(fixtureRequiredMultiplePath, ['--test', '1', '--test', '2']);
	t.is(stdout, '[ 1, 2 ]');
});

test('spawn cli and test isRequired with isMultiple giving no values, but flag is given', async t => {
	try {
		await execa(fixtureRequiredMultiplePath, ['--test']);
	} catch (error) {
		const {stderr, message} = error;
		t.regex(message, /Command failed with exit code 2/);
		t.regex(stderr, /Missing required flag/);
		t.regex(stderr, /--test/);
	}
});

test('spawn cli and test isRequired with isMultiple giving no values, but flag is not given', async t => {
	try {
		await execa(fixtureRequiredMultiplePath, []);
	} catch (error) {
		const {stderr, message} = error;
		t.regex(message, /Command failed with exit code 2/);
		t.regex(stderr, /Missing required flag/);
		t.regex(stderr, /--test/);
	}
});
