import meow from '../index.js';

console.log(import.meta.url);

meow(`
	Usage
	  $ estest <input>

	Options
	  --rainbow, -r  Include a rainbow

	Examples
	  $ estest unicorns --rainbow
	  🌈 unicorns 🌈
`,
	{
		flags: {
			rainbow: {
				type: 'boolean',
				alias: 'r'
			}
		}
	}
);
