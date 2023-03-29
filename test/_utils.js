import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execa} from 'execa';

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getFixture = fixture => path.join(__dirname, 'fixtures', fixture);

export const spawnFixture = async (fixture = 'fixture.js', args = []) => {
	// Allow calling with args first
	if (Array.isArray(fixture)) {
		args = fixture;
		fixture = 'fixture.js';
	}

	return execa(getFixture(fixture), args);
};
