import test from 'ava';
import meow from '../../source/index.js';

type MacroArguments = [{
	cli: () => ReturnType<typeof meow>;
	error?: true;
}];

const verifyImportMeta = test.macro<MacroArguments>((t, {cli, error}) => {
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
	// @ts-expect-error: invalid importMeta
	cli: () => meow({importMeta: '/path/to/package'}),
	error: true,
});

test('throws if unset', verifyImportMeta, {
	// @ts-expect-error: missing importMeta
	cli: () => meow('foo', {}),
	error: true,
});

test('throws if unset - options only', verifyImportMeta, {
	// @ts-expect-error: missing importMeta
	cli: () => meow({}),
	error: true,
});

test('throws if unset - help shortcut only', verifyImportMeta, {
	// @ts-expect-error: missing options
	cli: () => meow('foo'),
	error: true,
});
