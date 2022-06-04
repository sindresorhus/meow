// @ts-nocheck

/**
Example subcommands API:

node barista.js
node barista.js brew
node barista.js brew tea
node barista.js brew coffee --temp cold

// Toggle the `allowParentFlags` option:
node barista.js brew coffee --parentFlag

// Set `allowParentFlags` and `allowUnknownFlags` to `true`:
node barista.js --help
node barista.js brew --help
node barista.js brew coffee --help
*/

import meow from "./index.js";
import redent from 'redent';

const cli = meow({
	importMeta: import.meta,
  allowParentFlags: true,
	allowUnknownFlags: false,
	description: "Your friendly neighborhood barista",
	help: redent(`
	  Usage:
	    barista brew <beverage> <options>`, 2),
	flags: {
		parentFlag: { type: "boolean" },
	},
	commands: {
		brew: {
			description: "A prompt to select what to brew",
			help: redent(`
			  Usage:
				  barista brew <beverage> <options>`, 2),
			flags: {
				temp: { type: "string", default: "hot" },
			},
			handler: () => console.log("What do you want to brew?"),
			commands: {
				coffee: {
					description: "Brew coffee",
					help: redent(`
					  Usage:
						  barista brew coffee <options>`, 2),
					handler: (cli) => console.log(`Here's your ${cli.flags.temp} coffee!`),
				},
				tea: {
					description: "Brew tea",
					help: redent(`
						Usage:
						  barista brew tea <options>`, 2),
					handler: (cli) => console.log(`Here's your ${cli.flags.temp} tea!`),
				},
			},
		},
	},
});

cli.command.options.handler?.(cli)

/**
Example output:

cli.command === {
	args: ['brew', 'coffee'],
	options: {
		description: "Brew coffee",
		help: `...`
		handler: (cli) => console.log(`Here's your ${cli.flags.temp} coffee!`),
	}
}
*/
