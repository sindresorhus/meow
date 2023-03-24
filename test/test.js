import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import test from 'ava';
import indentString from 'indent-string';
import {stripIndent} from 'common-tags';
import {execa} from 'execa';
import {readPackage} from 'read-pkg';
import meow from '../index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(__dirname, 'fixtures', 'fixture.js');
const importMeta = import.meta;
const NODE_MAJOR_VERSION = process.versions.node.split('.')[0];

test('invalid package url', t => {
	const error = t.throws(() => {
		meow({
			importMeta: '/path/to/package',
		});
	});
	t.is(error.message, 'The `importMeta` option is required. Its value must be `import.meta`.');
});

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

	t.is(cli.input[0], 'foo');
	t.true(cli.flags.fooBar);
	t.is(cli.flags.meow, 'dog');
	t.is(cli.flags.unicorn, 'cat');
	t.deepEqual(cli.flags['--'], ['unicorn', 'cake']);
	t.is(cli.pkg.name, 'meow');
	t.is(cli.help, indentString('\nCLI app helper\n\nUsage\n  foo <input>\n', 2));
});

test('support help shortcut', t => {
	const cli = meow(`
		unicorn
		cat
	`, {
		importMeta,
	});
	t.is(cli.help, indentString('\nCLI app helper\n\nunicorn\ncat\n', 2));
});

test('spawn cli and show version', async t => {
	const pkg = await readPackage();
	const {stdout} = await execa(fixturePath, ['--version']);
	t.is(stdout, pkg.version);
});

test('spawn cli and disabled autoVersion and autoHelp', async t => {
	const {stdout} = await execa(fixturePath, ['--version', '--help']);
	t.is(stdout, 'version\nhelp\nmeow\ncamelCaseOption');
});

test('spawn cli and disabled autoVersion', async t => {
	const {stdout} = await execa(fixturePath, ['--version', '--no-auto-version']);
	t.is(stdout, 'version\nautoVersion\nmeow\ncamelCaseOption');
});

test('spawn cli and not show version', async t => {
	const {stdout} = await execa(fixturePath, ['--version=beta']);
	t.is(stdout, 'version\nmeow\ncamelCaseOption');
});

test('spawn cli and show help screen', async t => {
	const {stdout} = await execa(fixturePath, ['--help']);
	t.is(stdout, indentString('\nCustom description\n\nUsage\n  foo <input>\n\n', 2));
});

test('spawn cli and disabled autoHelp', async t => {
	const {stdout} = await execa(fixturePath, ['--help', '--no-auto-help']);
	t.is(stdout, 'help\nautoHelp\nmeow\ncamelCaseOption');
});

test('spawn cli and not show help', async t => {
	const {stdout} = await execa(fixturePath, ['--help=all']);
	t.is(stdout, 'help\nmeow\ncamelCaseOption');
});

test('spawn cli and test input', async t => {
	const {stdout} = await execa(fixturePath, ['-u', 'cat']);
	t.is(stdout, 'unicorn\nmeow\ncamelCaseOption');
});

test('spawn cli and test input flag', async t => {
	const {stdout} = await execa(fixturePath, ['--camel-case-option', 'bar']);
	t.is(stdout, 'bar');
});

test.serial.failing('pkg.bin as a string should work', t => {
	meow({
		importMeta,
		pkg: {
			importMeta,
			name: 'browser-sync',
			bin: './bin/browser-sync.js',
		},
	});

	t.is(process.title, 'browser-sync');
});

test('single character flag casing should be preserved', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['-F'],
	}).flags, {F: true});
});

test('flag declared in kebab-case is an error', t => {
	const error = t.throws(() => {
		meow({
			importMeta,
			flags: {'kebab-case': 'boolean', test: 'boolean', 'another-one': 'boolean'},
		});
	});
	t.is(error.message, 'Flag keys may not contain \'-\'. Invalid flags: `kebab-case`, `another-one`');
});

test('type inference', t => {
	t.is(meow({importMeta, argv: ['5']}).input[0], '5');
	t.is(meow({importMeta, argv: ['5']}, {input: 'string'}).input[0], '5');
	t.is(meow({
		importMeta,
		argv: ['5'],
		inferType: true,
	}).input[0], 5);
	t.is(meow({
		importMeta,
		argv: ['5'],
		inferType: true,
		flags: {foo: 'string'},
	}).input[0], 5);
	t.is(meow({
		importMeta,
		argv: ['5'],
		inferType: true,
		flags: {
			foo: 'string',
		},
	}).input[0], 5);
	t.is(meow({
		importMeta,
		argv: ['5'],
		input: 'number',
	}).input[0], 5);
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
	t.is(meow({importMeta, argv: ['bar', '--version']}).input[0], 'bar');
	t.is(meow({importMeta, argv: ['bar', '--help']}).input[0], 'bar');
	t.is(meow({importMeta, argv: ['bar', '--version', '--help']}).input[0], 'bar');
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

test('supports `number` flag type - throws on incorrect default value', t => {
	t.throws(() => {
		meow({
			importMeta,
			argv: [],
			flags: {
				foo: {
					type: 'number',
					default: 'x',
				},
			},
		});
	});
});

test('isMultiple - unset flag returns empty array', t => {
	t.deepEqual(meow({
		importMeta,
		argv: [],
		flags: {
			foo: {
				type: 'string',
				isMultiple: true,
			},
		},
	}).flags, {
		foo: [],
	});
});

test('isMultiple - flag set once returns array', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo=bar'],
		flags: {
			foo: {
				type: 'string',
				isMultiple: true,
			},
		},
	}).flags, {
		foo: ['bar'],
	});
});

test('isMultiple - flag set multiple times', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo=bar', '--foo=baz'],
		flags: {
			foo: {
				type: 'string',
				isMultiple: true,
			},
		},
	}).flags, {
		foo: ['bar', 'baz'],
	});
});

test('isMultiple - flag with space separated values', t => {
	const {input, flags} = meow({
		importMeta,
		argv: ['--foo', 'bar', 'baz'],
		flags: {
			foo: {
				type: 'string',
				isMultiple: true,
			},
		},
	});

	t.deepEqual(input, ['baz']);
	t.deepEqual(flags.foo, ['bar']);
});

test('isMultiple - flag with comma separated values', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo', 'bar,baz'],
		flags: {
			foo: {
				type: 'string',
				isMultiple: true,
			},
		},
	}).flags, {
		foo: ['bar,baz'],
	});
});

test('single flag set more than once => throws', t => {
	t.throws(() => {
		meow({
			importMeta,
			argv: ['--foo=bar', '--foo=baz'],
			flags: {
				foo: {
					type: 'string',
				},
			},
		});
	}, {message: 'The flag --foo can only be set once.'});
});

test('isMultiple - default to type string', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo=bar'],
		flags: {
			foo: {
				isMultiple: true,
			},
		},
	}).flags, {
		foo: ['bar'],
	});
});

test('isMultiple - boolean flag', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo', '--foo=false'],
		flags: {
			foo: {
				type: 'boolean',
				isMultiple: true,
			},
		},
	}).flags, {
		foo: [true, false],
	});
});

test('isMultiple - boolean flag is false by default', t => {
	t.deepEqual(meow({
		importMeta,
		argv: [],
		flags: {
			foo: {
				type: 'boolean',
				isMultiple: true,
			},
		},
	}).flags, {
		foo: [false],
	});
});

test('isMultiple - number flag', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo=1.3', '--foo=-1'],
		flags: {
			foo: {
				type: 'number',
				isMultiple: true,
			},
		},
	}).flags, {
		foo: [1.3, -1],
	});
});

test('isMultiple - flag default values', t => {
	t.deepEqual(meow({
		importMeta,
		argv: [],
		flags: {
			string: {
				type: 'string',
				isMultiple: true,
				default: ['foo'],
			},
			boolean: {
				type: 'boolean',
				isMultiple: true,
				default: [true],
			},
			number: {
				type: 'number',
				isMultiple: true,
				default: [0.5],
			},
		},
	}).flags, {
		string: ['foo'],
		boolean: [true],
		number: [0.5],
	});
});

test('isMultiple - multiple flag default values', t => {
	t.deepEqual(meow({
		importMeta,
		argv: [],
		flags: {
			string: {
				type: 'string',
				isMultiple: true,
				default: ['foo', 'bar'],
			},
			boolean: {
				type: 'boolean',
				isMultiple: true,
				default: [true, false],
			},
			number: {
				type: 'number',
				isMultiple: true,
				default: [0.5, 1],
			},
		},
	}).flags, {
		string: ['foo', 'bar'],
		boolean: [true, false],
		number: [0.5, 1],
	});
});

// Happened in production 2020-05-10: https://github.com/sindresorhus/meow/pull/143#issuecomment-626287226
test('isMultiple - handles multi-word flag name', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo-bar=baz'],
		flags: {
			fooBar: {
				type: 'string',
				isMultiple: true,
			},
		},
	}).flags, {
		fooBar: ['baz'],
	});
});

test('suggests renaming alias to shortFlag', t => {
	t.throws(() => {
		meow({
			importMeta,
			flags: {
				foo: {
					type: 'string',
					alias: 'f',
				},
				bar: {
					type: 'string',
					alias: 'b',
				},
				baz: {
					type: 'string',
					shortFlag: 'z',
				},
			},
		});
	}, {message: 'The option `alias` has been renamed to `shortFlag`. The following flags need to be updated: `--foo`, `--bar`'});
});

test('aliases - accepts one', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo=baz'],
		flags: {
			fooBar: {
				type: 'string',
				aliases: ['foo'],
			},
		},
	}).flags, {
		fooBar: 'baz',
	});
});

test('aliases - accepts multiple', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo=baz1', '--bar=baz2'],
		flags: {
			fooBar: {
				type: 'string',
				aliases: ['foo', 'bar'],
				isMultiple: true,
			},
		},
	}).flags, {
		fooBar: ['baz1', 'baz2'],
	});
});

test('aliases - can be a short flag', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--f=baz'],
		flags: {
			fooBar: {
				type: 'string',
				aliases: ['f'],
			},
		},
	}).flags, {
		fooBar: 'baz',
	});
});

test('aliases - works with short flag', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo=baz1', '--bar=baz2', '-f=baz3'],
		flags: {
			fooBar: {
				type: 'string',
				shortFlag: 'f',
				aliases: ['foo', 'bar'],
				isMultiple: true,
			},
		},
	}).flags, {
		fooBar: ['baz1', 'baz2', 'baz3'],
	});
});

test('aliases - unnormalized flags', t => {
	t.deepEqual(meow({
		importMeta,
		argv: ['--foo=baz'],
		flags: {
			fooBar: {
				type: 'string',
				aliases: ['foo'],
				shortFlag: 'f',
			},
		},
	}).unnormalizedFlags, {
		fooBar: 'baz',
		foo: 'baz',
		f: 'baz',
	});
});

test('choices - success case', t => {
	const cli = meow({
		importMeta,
		argv: ['--animal', 'cat', '--number=2.2'],
		flags: {
			animal: {
				choices: ['dog', 'cat', 'unicorn'],
			},
			number: {
				type: 'number',
				choices: [1.1, 2.2, 3.3],
			},
		},
	});

	t.is(cli.flags.animal, 'cat');
	t.is(cli.flags.number, 2.2);
});

test('choices - throws if input does not match choices', t => {
	t.throws(() => {
		meow({
			importMeta,
			argv: ['--animal', 'rainbow', '--number', 5],
			flags: {
				animal: {
					choices: ['dog', 'cat', 'unicorn'],
				},
				number: {
					choices: [1, 2, 3],
				},
			},
		});
	}, {
		message: stripIndent`
			Unknown value for flag \`animal\`: \`rainbow\`. Value must be one of: [dog, cat, unicorn]
			Unknown value for flag \`number\`: \`5\`. Value must be one of: [1, 2, 3]
		`,
	});
});

test('choices - throws if choices is not array', t => {
	t.throws(() => {
		meow({
			importMeta,
			argv: ['--animal', 'cat'],
			flags: {
				animal: {
					choices: 'cat',
				},
			},
		});
	}, {message: 'The option `choices` must be an array. Invalid flags: `--animal`'});
});

test('choices - does not throw error when isRequired is false', t => {
	t.notThrows(() => {
		meow({
			importMeta,
			argv: [],
			flags: {
				animal: {
					isRequired: false,
					choices: ['dog', 'cat', 'unicorn'],
				},
			},
		});
	});
});

test('choices - throw error when isRequired is true', t => {
	t.throws(() => {
		meow({
			importMeta,
			argv: [],
			flags: {
				animal: {
					isRequired: true,
					choices: ['dog', 'cat', 'unicorn'],
				},
			},
		});
	}, {message: 'Flag `animal` has no value. Value must be one of: [dog, cat, unicorn]'});
});

test('choices - success with isMultiple', t => {
	const cli = meow({
		importMeta,
		argv: ['--animal=dog', '--animal=unicorn'],
		flags: {
			animal: {
				type: 'string',
				isMultiple: true,
				choices: ['dog', 'cat', 'unicorn'],
			},
		},
	});

	t.deepEqual(cli.flags.animal, ['dog', 'unicorn']);
});

test('choices - throws with isMultiple, one unknown value', t => {
	t.throws(() => {
		meow({
			importMeta,
			argv: ['--animal=dog', '--animal=rabbit'],
			flags: {
				animal: {
					type: 'string',
					isMultiple: true,
					choices: ['dog', 'cat', 'unicorn'],
				},
			},
		});
	}, {message: 'Unknown value for flag `animal`: `rabbit`. Value must be one of: [dog, cat, unicorn]'});
});

test('choices - throws with isMultiple, multiple unknown value', t => {
	t.throws(() => {
		meow({
			importMeta,
			argv: ['--animal=dog', '--animal=rabbit'],
			flags: {
				animal: {
					type: 'string',
					isMultiple: true,
					choices: ['cat', 'unicorn'],
				},
			},
		});
	}, {message: 'Unknown values for flag `animal`: `dog, rabbit`. Value must be one of: [cat, unicorn]'});
});

test('choices - throws with multiple flags', t => {
	t.throws(() => {
		meow({
			importMeta,
			argv: ['--animal=dog', '--plant=succulent'],
			flags: {
				animal: {
					type: 'string',
					choices: ['cat', 'unicorn'],
				},
				plant: {
					type: 'string',
					choices: ['tree', 'flower'],
				},
			},
		});
	}, {message: stripIndent`
		Unknown value for flag \`animal\`: \`dog\`. Value must be one of: [cat, unicorn]
		Unknown value for flag \`plant\`: \`succulent\`. Value must be one of: [tree, flower]
	`});
});

test.failing('choices - choices must be of the same type', t => {
	t.throws(() => {
		meow({
			importMeta,
			flags: {
				number: {
					type: 'number',
					choices: [1, '2'],
				},
			},
		});
	});
});

test('options - multiple validation errors', t => {
	t.throws(() => {
		meow({
			importMeta,
			flags: {
				animal: {
					type: 'string',
					choices: 'cat',
				},
				plant: {
					type: 'string',
					alias: 'p',
				},
				'some-thing': {
					type: 'string',
				},
			},
		});
	}, {message: stripIndent`
		Flag keys may not contain '-'. Invalid flags: \`some-thing\`
		The option \`alias\` has been renamed to \`shortFlag\`. The following flags need to be updated: \`--plant\`
		The option \`choices\` must be an array. Invalid flags: \`--animal\`
	`});
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
