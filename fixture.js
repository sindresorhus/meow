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
	default: {meow: 'dog', camelCaseOption: 'foo'}
});

if (cli.flags.camelCaseOption !== 'foo') {
	console.log(cli.flags.camelCaseOption)
} else {
	Object.keys(cli.flags).forEach(function (el) {
		console.log(el);
	});
}

