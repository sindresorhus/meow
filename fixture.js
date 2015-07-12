#!/usr/bin/env node
'use strict';
var meow = require('./');

var cli = meow({
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
