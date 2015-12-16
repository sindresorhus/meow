#!/usr/bin/env node
'use strict';
var meow = require('./');

var cli = meow({
	description: 'Custom description',
	help: [
		'Usage',
		'  foo <input>'
	]
}, {
	alias: {u: 'unicorn'},
	default: {meow: 'dog'}
});

Object.keys(cli.flags).forEach(function (el) {
	console.log(el);
});

cli.stdinOrInput()
	.then(function (input) {
		input.forEach(function (element) {
			console.log(element);
		});
	})
	.catch(function (err) {
		console.error(err.message);
		process.exit(1);
	});
