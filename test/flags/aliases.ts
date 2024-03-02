import test from 'ava';
import meow from '../../source/index.js';

const importMeta = import.meta;

test('accepts one', t => {
	const cli = meow({
		importMeta,
		argv: ['--foo=baz'],
		flags: {
			fooBar: {
				type: 'string',
				aliases: ['foo'],
			},
		},
	});

	t.like(cli.flags, {
		fooBar: 'baz',
	});
});

test('accepts multiple', t => {
	const cli = meow({
		importMeta,
		argv: ['--foo=baz1', '--bar=baz2'],
		flags: {
			fooBar: {
				type: 'string',
				aliases: ['foo', 'bar'],
				isMultiple: true,
			},
		},
	});

	t.like(cli.flags, {
		fooBar: ['baz1', 'baz2'],
	});
});

test('can be a short flag', t => {
	const cli = meow({
		importMeta,
		argv: ['--f=baz'],
		flags: {
			fooBar: {
				type: 'string',
				aliases: ['f'],
			},
		},
	});

	t.like(cli.flags, {
		fooBar: 'baz',
	});
});

test('works with short flag', t => {
	const cli = meow({
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
	});

	t.like(cli.flags, {
		fooBar: ['baz1', 'baz2', 'baz3'],
	});
});

test('unnormalized flags', t => {
	const cli = meow({
		importMeta,
		argv: ['--foo=baz'],
		flags: {
			fooBar: {
				type: 'string',
				aliases: ['foo'],
				shortFlag: 'f',
			},
		},
	});

	t.like(cli.unnormalizedFlags, {
		fooBar: 'baz',
		foo: 'baz',
		f: 'baz',
	});
});
