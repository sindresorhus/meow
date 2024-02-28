import test from 'ava';
import {oneLine} from 'common-tags';
import {stripIndentTrim} from '../_utils.js';
import {_verifyFlags} from './_utils.js';

const verifyChoices = _verifyFlags(import.meta);

test('success case', verifyChoices, {
	flags: {
		animal: {
			choices: ['dog', 'cat', 'unicorn'],
		},
		number: {
			type: 'number',
			choices: [1.1, 2.2, 3.3],
		},
	},
	args: '--animal cat --number=2.2',
	expected: {
		animal: 'cat',
		number: 2.2,
	},
});

test('throws if input does not match choices', verifyChoices, {
	flags: {
		animal: {
			choices: ['dog', 'cat', 'unicorn'],
		},
		number: {
			choices: [1, 2, 3],
		},
	},
	args: '--animal rainbow --number 5',
	error: stripIndentTrim`
		Unknown value for flag \`--animal\`: \`rainbow\`. Value must be one of: [\`dog\`, \`cat\`, \`unicorn\`]
		Unknown value for flag \`--number\`: \`5\`. Value must be one of: [\`1\`, \`2\`, \`3\`]
	`,
});

test('throws if choices is not array', verifyChoices, {
	flags: {
		animal: {
			choices: 'cat',
		},
	},
	args: '--animal cat',
	error: 'The option `choices` must be an array. Invalid flags: `--animal`',
});

test('does not throw error when isRequired is false', verifyChoices, {
	flags: {
		animal: {
			isRequired: false,
			choices: ['dog', 'cat', 'unicorn'],
		},
	},
});

test('throw error when isRequired is true', verifyChoices, {
	flags: {
		animal: {
			isRequired: true,
			choices: ['dog', 'cat', 'unicorn'],
		},
	},
	error: 'Flag `--animal` has no value. Value must be one of: [`dog`, `cat`, `unicorn`]',
});

test('success with isMultiple', verifyChoices, {
	flags: {
		animal: {
			type: 'string',
			isMultiple: true,
			choices: ['dog', 'cat', 'unicorn'],
		},
	},
	args: '--animal=dog --animal=unicorn',
	expected: {
		animal: ['dog', 'unicorn'],
	},
});

test('throws with isMultiple, one unknown value', verifyChoices, {
	flags: {
		animal: {
			type: 'string',
			isMultiple: true,
			choices: ['dog', 'cat', 'unicorn'],
		},
	},
	args: '--animal=dog --animal=rabbit',
	error: 'Unknown value for flag `--animal`: `rabbit`. Value must be one of: [`dog`, `cat`, `unicorn`]',
});

test('throws with isMultiple, multiple unknown value', verifyChoices, {
	flags: {
		animal: {
			type: 'string',
			isMultiple: true,
			choices: ['cat', 'unicorn'],
		},
	},
	args: '--animal=dog --animal=rabbit',
	error: 'Unknown values for flag `--animal`: `dog`, `rabbit`. Value must be one of: [`cat`, `unicorn`]',
});

test('throws with multiple flags', verifyChoices, {
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
	args: '--animal=dog --plant=succulent',
	error: stripIndentTrim`
		Unknown value for flag \`--animal\`: \`dog\`. Value must be one of: [\`cat\`, \`unicorn\`]
		Unknown value for flag \`--plant\`: \`succulent\`. Value must be one of: [\`tree\`, \`flower\`]
	`,
});

test('choices must be of the same type', verifyChoices, {
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
	error: oneLine`
		Each value of the option \`choices\` must be of the same type as its flag.
		Invalid flags: (\`--number\`, type: 'number'), (\`--boolean\`, type: 'boolean')
	`,
});

test('success when each value of default exist within the option choices', verifyChoices, {
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

test('throws when default does not only include valid choices', verifyChoices, {
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
	error: oneLine`
		Each value of the option \`default\` must exist within the option \`choices\`.
		Invalid flags: \`--number\`, \`--string\`, \`--multiString\`
	`,
});
