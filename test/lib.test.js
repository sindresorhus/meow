import {resolve} from 'path';
import meow from '../lib';
import test from '.';

const fixturePath = resolve(__dirname, 'fixtures', 'lib.js');

test(meow, fixturePath);
