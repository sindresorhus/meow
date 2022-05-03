import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'ava';
import {execa} from 'execa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePreferNestedFlags = path.join(__dirname, 'fixtures', 'fixture-prefer-nested-flags.js');

test('spawn CLI and check nested flags capture', async t => {
	const {stdout} = await execa(fixturePreferNestedFlags, ['--foo', 'bar', '--', '--foo', 'baz']);
	t.is(stdout, 'baz');
});

test('spawn CLI and test getting known flags if no nesting found', async t => {
	const {stdout} = await execa(fixturePreferNestedFlags, ['--foo', 'bar']);
	t.is(stdout, 'bar');
});
