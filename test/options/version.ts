import test from 'ava';
import {_verifyCli, defaultFixture, stripIndentTrim} from '../_utils.js';

const verifyVersion = _verifyCli('version/fixture.ts');

test('spawn cli and show version', verifyVersion, {
	args: '--version',
	expected: '1.0.0',
});

test('spawn cli and disabled autoVersion', verifyVersion, {
	fixture: defaultFixture,
	args: '--version --no-auto-version',
	expected: stripIndentTrim`
		version
		autoVersion
		meow
		camelCaseOption
	`,
});

test('spawn cli and not show version', verifyVersion, {
	fixture: defaultFixture,
	args: '--version=beta',
	expected: stripIndentTrim`
		version
		meow
		camelCaseOption
	`,
});

test('custom version', verifyVersion, {
	args: '--version',
	execaOptions: {env: {VERSION: 'beta'}}, // eslint-disable-line @typescript-eslint/naming-convention
	expected: 'beta',
});

test('version = false has no effect', verifyVersion, {
	args: '--version',
	execaOptions: {env: {VERSION: 'false'}}, // eslint-disable-line @typescript-eslint/naming-convention
	expected: 'false',
});

test('manual showVersion', verifyVersion, {
	args: '--show-version',
	expected: '1.0.0',
});

test('no version fallback message', verifyVersion, {
	fixture: 'with-package-json/default/fixture.ts',
	args: '--version',
	expected: 'No version found',
});
