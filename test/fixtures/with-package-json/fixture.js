#!/usr/bin/env node
import process from 'node:process';
import meow from '../../../index.js';

meow({
	importMeta: import.meta,
});

console.log(process.title);
