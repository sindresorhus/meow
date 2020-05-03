import {createRequire} from 'module';

const meow = createRequire(import.meta.url)('../index.js');

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
