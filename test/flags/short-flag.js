import test from 'ava';
import meow from '../../source/index.js';

const importMeta = import.meta;

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

	t.like(cli.unnormalizedFlags, {
		coco: true,
		loco: true,
		c: true,
		l: true,
	});

	t.like(cli.flags, {
		coco: true,
		loco: true,
		c: undefined,
		l: undefined,
	});
});
