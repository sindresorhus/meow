import test from 'ava';
import {_verifyCli, stripIndent} from '../_utils.js';
import meow from '../../source/index.js';

const importMeta = import.meta;

const verifyPackage = _verifyCli('with-package-json/default/fixture.ts');

test('description', t => {
	const cli = meow({
		importMeta,
		pkg: {
			description: 'Unicorn and rainbow creator',
		},
	});

	t.is(cli.help, stripIndent`

		Unicorn and rainbow creator
	`);
});

test.todo('version');

test('overriding pkg still normalizes', t => {
	const cli = meow({
		importMeta,
		pkg: {
			name: 'browser-sync',
			bin: './bin/browser-sync.js',
		},
	});

	t.like(cli, {
		pkg: {
			name: 'browser-sync',
			version: '',
		},
	});

	// TODO: test that showVersion logs undefined
});

test('process title - bin default', verifyPackage, {
	expected: 'foo',
});

test('process title - bin custom', verifyPackage, {
	fixture: 'with-package-json/custom-bin/fixture.ts',
	expected: 'bar',
});

test('process title - name backup', verifyPackage, {
	fixture: 'with-package-json/no-bin/fixture.ts',
	expected: 'foo',
});

