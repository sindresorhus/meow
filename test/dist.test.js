import {resolve} from 'path';
import meow from '../dist';
import test from '.';

const fixturePath = resolve(__dirname, 'fixtures', 'dist.js');

test(meow, fixturePath);
