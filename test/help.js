import test from 'ava';
import meow from '..';

const inputHelpText = `
	Usage: unicorn [options] <file>

	Example: unicorn path/to/file.js
`;

test('when no arguments and options', t => {
	const cli = meow();
	t.is(cli.help, `
  CLI app helper

  Options:
    --help    Show help
`);
});

test('when shortcut and no description', t => {
	const cli = meow(inputHelpText);
	t.is(cli.help, `
  CLI app helper

  Usage: unicorn [options] <file>

  Example: unicorn path/to/file.js
`);
});

test('when no shortcut and description:false', t => {
	const cli = meow({description: false});
	t.is(cli.help, `
  Options:
    --help    Show help
`);
});

test('when shortcut and description', t => {
	const cli = meow(inputHelpText, {description: 'A command for unicorns'});
	t.is(cli.help, `
  A command for unicorns

  Usage: unicorn [options] <file>

  Example: unicorn path/to/file.js
`);
});

test('when shortcut and description:false', t => {
	const cli = meow(inputHelpText, {description: false});
	t.is(cli.help, `
  Usage: unicorn [options] <file>

  Example: unicorn path/to/file.js
`);
});

test('when help:<string> and no description', t => {
	const cli = meow({help: inputHelpText});
	t.is(cli.help, `
  CLI app helper

  Usage: unicorn [options] <file>

  Example: unicorn path/to/file.js
`);
});

test('when help:<string> and description:false', t => {
	const cli = meow({help: inputHelpText, description: false});
	t.is(cli.help, `
  Usage: unicorn [options] <file>

  Example: unicorn path/to/file.js
`);
});

test('when help:<string> and description:<string>', t => {
	const cli = meow({help: inputHelpText, description: 'A command for unicorns'});
	t.is(cli.help, `
  A command for unicorns

  Usage: unicorn [options] <file>

  Example: unicorn path/to/file.js
`);
});

test('when description and flags', t => {
	const cli = meow({
		description: inputHelpText,
		flags: {
			format: 'string',
			output: {
				type: 'string',
				alias: 'o'
			},
			input: {
				type: 'string',
				default: 'stdin',
				description: 'Input file path'
			},
			indent: {
				type: 'number',
				alias: 'i',
				default: 2,
				description: 'Indent level'
			},
			verbose: {
				type: 'boolean',
				default: false,
				description: 'Turn on verbose mode'
			},
			longLongOption: {
				type: 'string',
				alias: 'llo',
				default: 'none',
				description: 'A long long option.\nThis is the second line.'
			}
		}
	});
	t.is(cli.help, `
  Usage: unicorn [options] <file>

  Example: unicorn path/to/file.js

  Options:
    --format <string>
    --output, -o <string>
    --input <string>                     Input file path  [default: stdin]
    --indent, -i <number>                Indent level  [default: 2]
    --verbose                            Turn on verbose mode  [default: false]
    --long-long-option, -llo <string>    A long long option.
                                         This is the second line.  [default: none]
    --help                               Show help
`);
});

test('when no description and flags', t => {
	const cli = meow({
		flags: {
			input: {
				type: 'string',
				description: 'Input file path'
			}
		}
	});
	t.is(cli.help, `
  CLI app helper

  Options:
    --input <string>    Input file path
    --help              Show help
`);
});

test('when a help function is given', t => {
	const cli = meow({
		help: ({wholeText, flagLines, description, options}) => {
			return `
**********
${wholeText}
**********
${flagLines.join('\n')}
**********
${description}
**********
pkg.name: ${JSON.stringify(options.pkg.name)}
argv: ${JSON.stringify(options.argv)}
flags.input.description: ${JSON.stringify(options.flags.input.description)}
inferType: ${JSON.stringify(options.inferType)}
input: ${JSON.stringify(options.input)}
autoHelp: ${JSON.stringify(options.autoHelp)}
autoVersion: ${JSON.stringify(options.autoVersion)}
`;
		},
		flags: {
			input: {
				type: 'string',
				description: 'Input file path'
			}
		}
	});
	t.is(cli.help, `
**********

  CLI app helper

  Options:
    --input <string>    Input file path
    --help              Show help

**********
--input <string>    Input file path
--help              Show help
**********
CLI app helper
**********
pkg.name: "meow"
argv: ["undefined"]
flags.input.description: "Input file path"
inferType: false
input: "string"
autoHelp: true
autoVersion: true
`);
});
