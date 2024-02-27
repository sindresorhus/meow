import test from 'ava';
import meow from '../../source/index.js';

test('main', t => {
	t.notThrows(() => meow({importMeta: import.meta}));
});

test('with help shortcut', t => {
	t.notThrows(() => (
		meow(`
			unicorns
			rainbows
		`, {
			importMeta: import.meta,
		})
	));
});

test('invalid package url', t => {
	t.throws(
		() => meow({importMeta: '/path/to/package'}),
		{message: 'The `importMeta` option is required. Its value must be `import.meta`.'},
	);
});
