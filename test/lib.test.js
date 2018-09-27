import {resolve} from 'path'
import test from 'ava'
import indentString from 'indent-string'
import execa from 'execa'
import pkg from '../package'
import m from '../lib'

const fixturePath = resolve(__dirname, 'fixtures', 'lib.js')

test('return object', t => {
	const cli = m({
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
	})

	t.is(cli.input[0], 'foo')
	t.true(cli.flags.fooBar)
	t.is(cli.flags.meow, 'dog')
	t.is(cli.flags.unicorn, 'cat')
	t.deepEqual(cli.flags['--'], ['unicorn', 'cake'])
	t.is(cli.pkg.name, 'meow')
	t.is(cli.help, indentString('\nCLI app helper\n\nUsage\n  foo <input>\n', 2))
})

test('support help shortcut', t => {
	const cli = m(`
		unicorn
		cat
	`)
	t.is(cli.help, indentString('\nCLI app helper\n\nunicorn\ncat\n', 2))
})

test('spawn cli and show version', async t => {
	const {stdout} = await execa(fixturePath, ['--version'])
	t.is(stdout, pkg.version)
})

test('spawn cli and not show version', async t => {
	const {stdout} = await execa(fixturePath, ['--version', '--no-auto-version'])
	t.is(stdout, 'version\nautoVersion\nmeow\ncamelCaseOption')
})

test('spawn cli and show help screen', async t => {
	const {stdout} = await execa(fixturePath, ['--help'])
	t.is(stdout, indentString('\nCustom description\n\nUsage\n  foo <input>\n\n', 2))
})

test('spawn cli and not show help screen', async t => {
	const {stdout} = await execa(fixturePath, ['--help', '--no-auto-help'])
	t.is(stdout, 'help\nautoHelp\nmeow\ncamelCaseOption')
})

test('spawn cli and test input', async t => {
	const {stdout} = await execa(fixturePath, ['-u', 'cat'])
	t.is(stdout, 'u\nunicorn\nmeow\ncamelCaseOption')
})

test('spawn cli and test input flag', async t => {
	const {stdout} = await execa(fixturePath, ['--camel-case-option', 'bar'])
	t.is(stdout, 'bar')
})

// TODO: This fails in Node.js 7.10.0, but not 6 or 4
test.serial.skip('pkg.bin as a string should work', t => { // eslint-disable-line ava/no-skip-test
	m({
		pkg: {
			name: 'browser-sync',
			bin: 'bin/browser-sync.js'
		}
	})

	t.is(process.title, 'browser-sync')
})

test('single character flag casing should be preserved', t => {
	t.deepEqual(m({argv: ['-F']}).flags, {F: true})
})

test('type inference', t => {
	t.is(m({argv: ['5']}).input[0], '5')
	t.is(m({argv: ['5']}, {input: 'string'}).input[0], '5')
	t.is(m({
		argv: ['5'],
		inferType: true
	}).input[0], 5)
	t.is(m({
		argv: ['5'],
		inferType: true,
		flags: {foo: 'string'}
	}).input[0], 5)
	t.is(m({
		argv: ['5'],
		inferType: true,
		flags: {
			foo: 'string'
		}
	}).input[0], 5)
	t.is(m({
		argv: ['5'],
		input: 'number'
	}).input[0], 5)
})

test('booleanDefault: undefined, filter out unset boolean args', t => {
	t.deepEqual(m('help', {
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
	})
})

test('boolean args are false by default', t => {
	t.deepEqual(m('help', {
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
	})
})

test('enforces boolean flag type', t => {
	const cli = m('', {
		argv: ['--cursor=false'],
		flags: {
			cursor: {type: 'boolean'}
		}
	})
	t.deepEqual(cli.flags, {cursor: false})
})

test('accept help and options', t => {
	t.deepEqual(m('help', {
		argv: ['-f'],
		flags: {
			foo: {
				type: 'boolean',
				alias: 'f'
			}
		}
	}).flags, {
		foo: true,
		f: true
	})
})