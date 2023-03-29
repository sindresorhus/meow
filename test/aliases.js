import test from 'ava';
import meow from '../source/index.js';

const importMeta = import.meta;

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
