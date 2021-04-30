import meow from '../index.js';

meow(
	`
		Usage
		  $ estest <input>

		Options
		  --rainbow, -r  Include a rainbow

		Examples
		  $ estest unicorns --rainbow
		  🌈 unicorns 🌈
	`,
	{
		importMeta: import.meta,
		flags: {
			rainbow: {
				type: 'boolean',
				alias: 'r'
			}
		}
	}
);
