import test from 'ava';
import meow from '../source/index.js';
import {stripIndent} from './_utils.js';

const importMeta = import.meta;

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
			Unknown value for flag \`--animal\`: \`rainbow\`. Value must be one of: [\`dog\`, \`cat\`, \`unicorn\`]
			Unknown value for flag \`--number\`: \`5\`. Value must be one of: [\`1\`, \`2\`, \`3\`]
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
	}, {message: 'Flag `--animal` has no value. Value must be one of: [`dog`, `cat`, `unicorn`]'});
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
	}, {message: 'Unknown value for flag `--animal`: `rabbit`. Value must be one of: [`dog`, `cat`, `unicorn`]'});
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
	}, {message: 'Unknown values for flag `--animal`: `dog`, `rabbit`. Value must be one of: [`cat`, `unicorn`]'});
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
	}, {
		message: stripIndent`
			Unknown value for flag \`--animal\`: \`dog\`. Value must be one of: [\`cat\`, \`unicorn\`]
			Unknown value for flag \`--plant\`: \`succulent\`. Value must be one of: [\`tree\`, \`flower\`]
		`,
	});
});

test('choices - choices must be of the same type', t => {
	t.throws(() => {
		meow({
			importMeta,
			flags: {
				number: {
					type: 'number',
					choices: [1, '2'],
				},
				boolean: {
					type: 'boolean',
					choices: [true, 'false'],
				},
			},
		});
	}, {message: 'Each value of the option `choices` must be of the same type as its flag. Invalid flags: (`--number`, type: \'number\'), (`--boolean`, type: \'boolean\')'});
});

test('choices - success when each value of default exist within the option choices', t => {
	t.notThrows(() => {
		meow({
			importMeta,
			flags: {
				number: {
					type: 'number',
					choices: [1, 2, 3],
					default: 1,
				},
				string: {
					type: 'string',
					choices: ['dog', 'cat', 'unicorn'],
					default: 'dog',
				},
				multiString: {
					type: 'string',
					choices: ['dog', 'cat', 'unicorn'],
					default: ['dog', 'cat'],
					isMultiple: true,
				},
			},
		});
	});
});

test('choices - throws when default does not only include valid choices', t => {
	t.throws(() => {
		meow({
			importMeta,
			flags: {
				number: {
					type: 'number',
					choices: [1, 2, 3],
					default: 8,
				},
				string: {
					type: 'string',
					choices: ['dog', 'cat'],
					default: 'unicorn',
				},
				multiString: {
					type: 'string',
					choices: ['dog', 'cat'],
					default: ['dog', 'unicorn'],
					isMultiple: true,
				},
			},
		});
	}, {message: 'Each value of the option `default` must exist within the option `choices`. Invalid flags: `--number`, `--string`, `--multiString`'});
});
