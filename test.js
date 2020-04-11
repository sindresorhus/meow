import test from 'ava';
import indentString from 'indent-string';
import execa from 'execa';
import pkg from './package.json';
import meow from '.';

test('return object', t => {
	const cli = meow({
		argv: ['foo', '--foo-bar', '-u', 'cat', '--', 'unicorn', 'cake'],
		help: `
			Usage
			  foo <input>
		`,
		flags: {
			unicorn: {alias: 'u'},
			meow: {default: 'dog'},
			'--': true
		}
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
	`);
	t.is(cli.help, indentString('\nCLI app helper\n\nunicorn\ncat\n', 2));
});

test('spawn cli and show version', async t => {
	const {stdout} = await execa('./fixture.js', ['--version']);
	t.is(stdout, pkg.version);
});

test('spawn cli and disabled autoVersion and autoHelp', async t => {
	const {stdout} = await execa('./fixture.js', ['--version', '--help']);
	t.is(stdout, 'version\nhelp\nmeow\ncamelCaseOption');
});

test('spawn cli and disabled autoVersion', async t => {
	const {stdout} = await execa('./fixture.js', ['--version', '--no-auto-version']);
	t.is(stdout, 'version\nautoVersion\nmeow\ncamelCaseOption');
});

test('spawn cli and not show version', async t => {
	const {stdout} = await execa('./fixture.js', ['--version=beta']);
	t.is(stdout, 'version\nmeow\ncamelCaseOption');
});

test('spawn cli and show help screen', async t => {
	const {stdout} = await execa('./fixture.js', ['--help']);
	t.is(stdout, indentString('\nCustom description\n\nUsage\n  foo <input>\n\n', 2));
});

test('spawn cli and disabled autoHelp', async t => {
	const {stdout} = await execa('./fixture.js', ['--help', '--no-auto-help']);
	t.is(stdout, 'help\nautoHelp\nmeow\ncamelCaseOption');
});

test('spawn cli and not show help', async t => {
	const {stdout} = await execa('./fixture.js', ['--help=all']);
	t.is(stdout, 'help\nmeow\ncamelCaseOption');
});

test('spawn cli and test input', async t => {
	const {stdout} = await execa('./fixture.js', ['-u', 'cat']);
	t.is(stdout, 'unicorn\nmeow\ncamelCaseOption');
});

test('spawn cli and test input flag', async t => {
	const {stdout} = await execa('./fixture.js', ['--camel-case-option', 'bar']);
	t.is(stdout, 'bar');
});

test.serial('pkg.bin as a string should work', t => {
	meow({
		pkg: {
			name: 'browser-sync',
			bin: 'bin/browser-sync.js'
		}
	});

	t.is(process.title, 'browser-sync');
});

test('single character flag casing should be preserved', t => {
	t.deepEqual(meow({argv: ['-F']}).flags, {F: true});
});

test('type inference', t => {
	t.is(meow({argv: ['5']}).input[0], '5');
	t.is(meow({argv: ['5']}, {input: 'string'}).input[0], '5');
	t.is(meow({
		argv: ['5'],
		inferType: true
	}).input[0], 5);
	t.is(meow({
		argv: ['5'],
		inferType: true,
		flags: {foo: 'string'}
	}).input[0], 5);
	t.is(meow({
		argv: ['5'],
		inferType: true,
		flags: {
			foo: 'string'
		}
	}).input[0], 5);
	t.is(meow({
		argv: ['5'],
		input: 'number'
	}).input[0], 5);
});

test('booleanDefault: undefined, filter out unset boolean args', t => {
	t.deepEqual(meow({
		argv: ['--foo'],
		booleanDefault: undefined,
		flags: {
			foo: {
				type: 'boolean'
			},
			bar: {
				type: 'boolean'
			},
			baz: {
				type: 'boolean',
				default: false
			}
		}
	}).flags, {
		foo: true,
		baz: false
	});
});

test('boolean args are false by default', t => {
	t.deepEqual(meow({
		argv: ['--foo'],
		flags: {
			foo: {
				type: 'boolean'
			},
			bar: {
				type: 'boolean',
				default: true
			},
			baz: {
				type: 'boolean'
			}
		}
	}).flags, {
		foo: true,
		bar: true,
		baz: false
	});
});

test('enforces boolean flag type', t => {
	const cli = meow({
		argv: ['--cursor=false'],
		flags: {
			cursor: {
				type: 'boolean'
			}
		}
	});
	t.deepEqual(cli.flags, {cursor: false});
});

test('accept help and options', t => {
	t.deepEqual(meow({
		argv: ['-f'],
		flags: {
			foo: {
				type: 'boolean',
				alias: 'f'
			}
		}
	}).flags, {
		foo: true
	});
});

test('grouped short-flags work', t => {
	const cli = meow({
		argv: ['-cl'],
		flags: {
			coco: {
				type: 'boolean',
				alias: 'c'
			},
			loco: {
				type: 'boolean',
				alias: 'l'
			}
		}
	});

	const {unnormalizedFlags} = cli;
	t.true(unnormalizedFlags.coco);
	t.true(unnormalizedFlags.loco);
	t.true(unnormalizedFlags.c);
	t.true(unnormalizedFlags.l);
});

test('grouped flags work', t => {
	const cli = meow({
		argv: ['-cl'],
		flags: {
			coco: {
				type: 'boolean',
				alias: 'c'
			},
			loco: {
				type: 'boolean',
				alias: 'l'
			}
		}
	});

	const {flags} = cli;
	t.true(flags.coco);
	t.true(flags.loco);
	t.is(flags.c, undefined);
	t.is(flags.l, undefined);
});

test('disable autoVersion/autoHelp if `cli.input.length > 0`', t => {
	t.is(meow({argv: ['bar', '--version']}).input[0], 'bar');
	t.is(meow({argv: ['bar', '--help']}).input[0], 'bar');
	t.is(meow({argv: ['bar', '--version', '--help']}).input[0], 'bar');
});

test('supports `number` flag type', t => {
	const cli = meow({
		argv: ['--foo=1.3'],
		flags: {
			foo: {
				type: 'number'
			}
		}
	}).flags.foo;

	t.is(cli, 1.3);
});

test('supports `number` flag type - flag but no value', t => {
	const cli = meow({
		argv: ['--foo'],
		flags: {
			foo: {
				type: 'number'
			}
		}
	}).flags.foo;

	t.is(cli, undefined);
});

test('supports `number` flag type - flag but no value but default', t => {
	const cli = meow({
		argv: ['--foo'],
		flags: {
			foo: {
				type: 'number',
				default: 2
			}
		}
	}).flags.foo;

	t.is(cli, 2);
});

test('supports `number` flag type - no flag but default', t => {
	const cli = meow({
		argv: [],
		flags: {
			foo: {
				type: 'number',
				default: 2
			}
		}
	}).flags.foo;

	t.is(cli, 2);
});

test('supports `number` flag type - throws on incorrect default value', t => {
	t.throws(() => {
		meow({
			argv: [],
			flags: {
				foo: {
					type: 'number',
					default: 'x'
				}
			}
		});
	});
});

test('multiple flag set once returns array', t => {
	t.deepEqual(meow({
		argv: ['--foo=bar'],
		flags: {
			foo: {
				type: 'string',
				multiple: true
			}
		}
	}).flags, {
		foo: ['bar']
	});
});

test('multiple flag set multiple times', t => {
	t.deepEqual(meow({
		argv: ['--foo=bar', '--foo=baz'],
		flags: {
			foo: {
				type: 'string',
				multiple: true
			}
		}
	}).flags, {
		foo: ['bar', 'baz']
	});
});

test('multiple flag with space separated values', t => {
	t.deepEqual(meow({
		argv: ['--foo', 'bar', 'baz'],
		flags: {
			foo: {
				type: 'string',
				multiple: true
			}
		}
	}).flags, {
		foo: ['bar', 'baz']
	});
});

test('single flag set more than once => throws', t => {
	t.throws(() => {
		meow({
			argv: ['--foo=bar', '--foo=baz'],
			flags: {
				foo: {
					type: 'string'
				}
			}
		});
	}, {message: 'Only one value allowed for --foo.'});
});

test('multiple boolean flag', t => {
	t.deepEqual(meow({
		argv: ['--foo', '--foo=false'],
		flags: {
			foo: {
				type: 'boolean',
				multiple: true
			}
		}
	}).flags, {
		foo: [true, false]
	});
});

test('multiple boolean flag is false by default', t => {
	t.deepEqual(meow({
		argv: [],
		flags: {
			foo: {
				type: 'boolean',
				multiple: true
			}
		}
	}).flags, {
		foo: [false]
	});
});

test('multiple flag with `booleanDefault: undefined` => filter out unset boolean args', t => {
	t.deepEqual(meow({
		argv: ['--foo'],
		booleanDefault: undefined,
		flags: {
			foo: {
				type: 'boolean',
				multiple: true
			},
			bar: {
				type: 'boolean',
				multiple: true
			}
		}
	}).flags, {
		foo: [true]
	});
});

test('multiple number flag', t => {
	t.deepEqual(meow({
		argv: ['--foo=1.3', '--foo=-1'],
		flags: {
			foo: {
				type: 'number',
				multiple: true
			}
		}
	}).flags, {
		foo: [1.3, -1]
	});
});

test('multiple flag default values', t => {
	t.deepEqual(meow({
		argv: [],
		flags: {
			string: {
				type: 'string',
				multiple: true,
				default: ['foo']
			},
			boolean: {
				type: 'boolean',
				multiple: true,
				default: [true]
			},
			number: {
				type: 'number',
				multiple: true,
				default: [0.5]
			}
		}
	}).flags, {
		string: ['foo'],
		boolean: [true],
		number: [0.5]
	});
});
