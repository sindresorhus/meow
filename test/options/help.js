import test from 'ava';
import indentString from 'indent-string';
import {stripIndent} from 'common-tags';
import meow from '../../source/index.js';
import {spawnFixture, stripIndentTrim} from '../_utils.js';

const importMeta = import.meta;

const verifyHelp = test.macro(async (t, {cli: cliArguments, args, expected}) => {
	const assertions = await t.try(async tt => {
		if (args) {
			const {stdout} = await spawnFixture(args.split(' '));

			tt.log('help text:\n', stdout);
			tt.is(stdout, expected);
		} else {
			const cli = Array.isArray(cliArguments)
				? meow(cliArguments.at(0), {importMeta, ...cliArguments.at(1)})
				: meow({importMeta, ...cliArguments});

			tt.log('help text:\n', cli.help);
			tt.is(cli.help, expected);
		}
	});

	assertions.commit({retainLogs: !assertions.passed});
});

test('support help shortcut', verifyHelp, {
	cli: [`
		unicorn
		cat
	`],
	expected: indentString('\nCLI app helper\n\nunicorn\ncat\n', 2),
});

test('spawn cli and show help screen', verifyHelp, {
	args: '--help',
	expected: indentString('\nCustom description\n\nUsage\n  foo <input>\n\n', 2),
});

test('spawn cli and disabled autoHelp', verifyHelp, {
	args: '--help --no-auto-help',
	expected: stripIndentTrim`
		help
		autoHelp
		meow
		camelCaseOption
	`,
});

test('spawn cli and not show help', verifyHelp, {
	args: '--help=all',
	expected: stripIndentTrim`
		help
		meow
		camelCaseOption
	`,
});

test('single line help messages are not indented', verifyHelp, {
	cli: {
		description: false,
		help: 'single line',
	},
	expected: stripIndent`

		single line
	`,
});

test('descriptions with no help are not indented', verifyHelp, {
	cli: {
		help: false,
		description: 'single line',
	},
	expected: stripIndent`

		single line
	`,

});

test('support help shortcut with no indentation', verifyHelp, {
	cli: [`
		unicorn
		cat
	`, {
		helpIndent: 0,
	}],
	expected: stripIndent`

		CLI app helper

		unicorn
		cat
	`,
});

test('no description and no indentation', verifyHelp, {
	cli: [`
		unicorn
		cat
	`, {
		helpIndent: 0,
		description: false,
	}],
	expected: stripIndent`

		unicorn
		cat
	`,
});
