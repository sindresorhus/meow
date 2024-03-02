import test from 'ava';
import meow from '../../source/index.js';

const verifyImportMeta = test.macro((t, {cli, error}) => {
	if (error) {
		t.throws(cli, {message: 'The `importMeta` option is required. Its value must be `import.meta`.'});
	} else {
		t.notThrows(cli);
	}
});

test('main', verifyImportMeta, {
	cli: () => meow({
		importMeta: import.meta,
	}),
});

test('with help shortcut', verifyImportMeta, {
	cli: () => meow(`
		unicorns
		rainbows
	`, {
		importMeta: import.meta,
	}),
});

test('invalid package url', verifyImportMeta, {
	cli: () => meow({importMeta: '/path/to/package'}),
	error: true,
});

test('throws if unset', verifyImportMeta, {
	cli: () => meow('foo', {}),
	error: true,
});

test('throws if unset - options only', verifyImportMeta, {
	cli: () => meow({}),
	error: true,
});

test('throws if unset - help shortcut only', verifyImportMeta, {
	cli: () => meow('foo'),
	error: true,
});
