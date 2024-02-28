import test from 'ava';
import meow from '../../source/index.js';

const importMeta = import.meta;

test('undefined - filter out unset boolean args', t => {
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
