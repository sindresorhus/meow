#!/usr/bin/env node
import process from 'node:process';
import meow from '../../../source/index.js';

meow({
	importMeta: import.meta,
});

console.log(process.title);
