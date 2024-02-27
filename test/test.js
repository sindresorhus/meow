import test from 'ava';
import indentString from 'indent-string';
import meow from '../source/index.js';
import {spawnFixture, __dirname} from './_utils.js';

const importMeta = import.meta;

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

	t.like(cli, {
		input: ['foo'],
		flags: {
			fooBar: true,
			meow: 'dog',
			unicorn: 'cat',
			'--': ['unicorn', 'cake'],
		},
		pkg: {
			name: 'meow',
		},
		help: indentString('\nCLI app helper\n\nUsage\n  foo <input>\n', 2),
	});
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

	t.like(cli, {
		pkg: {
			name: 'browser-sync',
			version: '',
		},
		version: undefined,
	});
});

test('single character flag casing should be preserved', t => {
	const cli = meow({
		importMeta,
		argv: ['-F'],
	});

	t.like(cli.flags, {
		F: true,
	});
});

test('booleanDefault: undefined, filter out unset boolean args', t => {
	const cli = meow({
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
	});

	t.like(cli.flags, {
		foo: true,
		bar: undefined,
		baz: false,
	});
});

test('boolean args are false by default', t => {
	const cli = meow({
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
	});

	t.like(cli.flags, {
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

	t.like(cli.flags, {
		cursor: false,
	});
});

// TODO: what is this test name???
test('accept help and options', t => {
	const cli = meow({
		importMeta,
		argv: ['-f'],
		flags: {
			foo: {
				type: 'boolean',
				shortFlag: 'f',
			},
		},
	});

	t.like(cli.flags, {
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

	t.like(cli.unnormalizedFlags, {
		coco: true,
		loco: true,
		c: true,
		l: true,
	});
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

	t.like(cli.flags, {
		coco: true,
		loco: true,
		c: undefined,
		l: undefined,
	});
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
	});

	t.like(cli.flags, {
		foo: 1.3,
	});
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
	});

	t.like(cli.flags, {
		foo: undefined,
	});
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
	});

	t.like(cli.flags, {
		foo: 2,
	});
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
	});

	t.like(cli.flags, {
		foo: 2,
	});
});
