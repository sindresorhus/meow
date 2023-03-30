import path from 'node:path';
import process from 'node:process';
import test from 'ava';
import indentString from 'indent-string';
import {execa} from 'execa';
import {readPackage} from 'read-pkg';
import meow from '../source/index.js';
import {spawnFixture, __dirname} from './_utils.js';

const importMeta = import.meta;
const NODE_MAJOR_VERSION = process.versions.node.split('.').at(0);

test('return object', t => {
	const cli = meow({
		importMeta,
		argv: ['foo', '--foo-bar', '-u', 'cat', '--', 'unicorn', 'cake'],
		help: `
			Usage
			  foo <input>
		`,
		flags: {
			unicorn: {shortFlag: 'u'},
			meow: {default: 'dog'},
			'--': true,
		},
	});

	t.is(cli.input.at(0), 'foo');
	t.true(cli.flags.fooBar);
	t.is(cli.flags.meow, 'dog');
	t.is(cli.flags.unicorn, 'cat');
	t.deepEqual(cli.flags['--'], ['unicorn', 'cake']);
	t.is(cli.pkg.name, 'meow');
	t.is(cli.help, indentString('\nCLI app helper\n\nUsage\n  foo <input>\n', 2));
});

test('spawn cli and show version', async t => {
	const pkg = await readPackage();
	const {stdout} = await spawnFixture(['--version']);
	t.is(stdout, pkg.version);
});

test('spawn cli and disabled autoVersion and autoHelp', async t => {
	const {stdout} = await spawnFixture(['--version', '--help']);
	t.is(stdout, 'version\nhelp\nmeow\ncamelCaseOption');
});

test('spawn cli and disabled autoVersion', async t => {
	const {stdout} = await spawnFixture(['--version', '--no-auto-version']);
	t.is(stdout, 'version\nautoVersion\nmeow\ncamelCaseOption');
});

test('spawn cli and not show version', async t => {
	const {stdout} = await spawnFixture(['--version=beta']);
	t.is(stdout, 'version\nmeow\ncamelCaseOption');
});

test('spawn cli and test input', async t => {
	const {stdout} = await spawnFixture(['-u', 'cat']);
	t.is(stdout, 'unicorn\nmeow\ncamelCaseOption');
});

test('spawn cli and test input flag', async t => {
	const {stdout} = await spawnFixture(['--camel-case-option', 'bar']);
	t.is(stdout, 'bar');
});

test('spawn cli and test process title', async t => {
	const {stdout} = await spawnFixture('with-package-json/fixture.js');
	t.is(stdout, 'foo');
});

test('setting pkg.bin should work', t => {
	const cli = meow({
		importMeta,
		pkg: {
			name: 'browser-sync',
			bin: './bin/browser-sync.js',
		},
	});

	t.is(cli.pkg.name, 'browser-sync');
	t.is(cli.pkg.version, '');
	t.is(cli.version, undefined);
});

test('single character flag casing should be preserved', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['-F'],
	}).flags, {F: true});
});

test('type inference', t => {
	t.is(meow({importMeta, argv: ['5']}).input.at(0), '5');
	t.is(meow({importMeta, argv: ['5']}, {input: 'string'}).input.at(0), '5');
	t.is(meow({
		importMeta,
		argv: ['5'],
		inferType: true,
	}).input.at(0), 5);
	t.is(meow({
		importMeta,
		argv: ['5'],
		inferType: true,
		flags: {foo: 'string'},
	}).input.at(0), 5);
	t.is(meow({
		importMeta,
		argv: ['5'],
		inferType: true,
		flags: {
			foo: 'string',
		},
	}).input.at(0), 5);
	t.is(meow({
		importMeta,
		argv: ['5'],
		input: 'number',
	}).input.at(0), 5);
});

test('booleanDefault: undefined, filter out unset boolean args', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo'],
		booleanDefault: undefined,
		flags: {
			foo: {
				type: 'boolean',
			},
			bar: {
				type: 'boolean',
			},
			baz: {
				type: 'boolean',
				default: false,
			},
		},
	}).flags, {
		foo: true,
		baz: false,
	});
});

test('boolean args are false by default', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo'],
		flags: {
			foo: {
				type: 'boolean',
			},
			bar: {
				type: 'boolean',
				default: true,
			},
			baz: {
				type: 'boolean',
			},
		},
	}).flags, {
		foo: true,
		bar: true,
		baz: false,
	});
});

test('enforces boolean flag type', t => {
	const cli = meow({
		importMeta,
		argv: ['--cursor=false'],
		flags: {
			cursor: {
				type: 'boolean',
			},
		},
	});
	t.deepEqual(cli.flags, {cursor: false});
});

test('accept help and options', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['-f'],
		flags: {
			foo: {
				type: 'boolean',
				shortFlag: 'f',
			},
		},
	}).flags, {
		foo: true,
	});
});

test('grouped short-flags work', t => {
	const cli = meow({
		importMeta,
		argv: ['-cl'],
		flags: {
			coco: {
				type: 'boolean',
				shortFlag: 'c',
			},
			loco: {
				type: 'boolean',
				shortFlag: 'l',
			},
		},
	});

	const {unnormalizedFlags} = cli;
	t.true(unnormalizedFlags.coco);
	t.true(unnormalizedFlags.loco);
	t.true(unnormalizedFlags.c);
	t.true(unnormalizedFlags.l);
});

test('grouped flags work', t => {
	const cli = meow({
		importMeta,
		argv: ['-cl'],
		flags: {
			coco: {
				type: 'boolean',
				shortFlag: 'c',
			},
			loco: {
				type: 'boolean',
				shortFlag: 'l',
			},
		},
	});

	const {flags} = cli;
	t.true(flags.coco);
	t.true(flags.loco);
	t.is(flags.c, undefined);
	t.is(flags.l, undefined);
});

test('disable autoVersion/autoHelp if `cli.input.length > 0`', t => {
	t.is(meow({importMeta, argv: ['bar', '--version']}).input.at(0), 'bar');
	t.is(meow({importMeta, argv: ['bar', '--help']}).input.at(0), 'bar');
	t.is(meow({importMeta, argv: ['bar', '--version', '--help']}).input.at(0), 'bar');
});

test('supports `number` flag type', t => {
	const cli = meow({
		importMeta,
		argv: ['--foo=1.3'],
		flags: {
			foo: {
				type: 'number',
			},
		},
	}).flags.foo;

	t.is(cli, 1.3);
});

test('supports `number` flag type - flag but no value', t => {
	const cli = meow({
		importMeta,
		argv: ['--foo'],
		flags: {
			foo: {
				type: 'number',
			},
		},
	}).flags.foo;

	t.is(cli, undefined);
});

test('supports `number` flag type - flag but no value but default', t => {
	const cli = meow({
		importMeta,
		argv: ['--foo'],
		flags: {
			foo: {
				type: 'number',
				default: 2,
			},
		},
	}).flags.foo;

	t.is(cli, 2);
});

test('supports `number` flag type - no flag but default', t => {
	const cli = meow({
		importMeta,
		argv: [],
		flags: {
			foo: {
				type: 'number',
				default: 2,
			},
		},
	}).flags.foo;

	t.is(cli, 2);
});

if (NODE_MAJOR_VERSION >= 14) {
	test('supports es modules', async t => {
		try {
			const {stdout} = await execa('node', ['estest/index.js', '--version'], {
				importMeta: path.join(__dirname, '..'),
			});
			t.regex(stdout, /1.2.3/);
		} catch (error) {
			t.is(error, undefined);
		}
	});
}
