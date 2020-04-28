import test from 'ava';
import execa from 'execa';
const path = require('path');

const fixtureRequiredPath = path.join(__dirname, 'fixtures', 'fixture-required.js');
const fixtureRequiredFunctionPath = path.join(__dirname, 'fixtures', 'fixture-required-function.js');

test('spawn cli and test not specifying required flags', async t => {
	try {
		await execa(fixtureRequiredPath, []);
	} catch (error) {
		const {stderr, message} = error;
		t.regex(message, /Command failed with exit code 2/);
		t.regex(stderr, /Missing required flag/);
		t.regex(stderr, /--test, -t/);
		t.regex(stderr, /--number/);
		t.notRegex(stderr, /--notRequired/);
	}
});

test('spawn cli and test specifying all required flags', async t => {
	const {stdout} = await execa(fixtureRequiredPath, [
		'-t',
		'test',
		'--number',
		'6'
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
		t.regex(stderr, /--withTrigger/);
	}
});

test('spawn cli and test setting isRequired as a function and specifying both the flags', async t => {
	const {stdout} = await execa(fixtureRequiredFunctionPath, ['--trigger', '--withTrigger', 'specified']);
	t.is(stdout, 'true,specified');
});
