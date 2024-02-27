import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execa} from 'execa';
import {createTag, stripIndentTransformer, trimResultTransformer} from 'common-tags';

// TODO: URL?
export const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getFixture = fixture => path.join(__dirname, 'fixtures', fixture);

export const spawnFixture = async (fixture = 'fixture.js', arguments_ = [], options = {}) => {
	// Allow calling with arguments first
	if (Array.isArray(fixture)) {
		arguments_ = fixture;
		fixture = 'fixture.js';
	}

	return execa(getFixture(fixture), arguments_, options);
};

// Use old behavior prior to zspecza/common-tags#165
export const stripIndentTrim = createTag(
	stripIndentTransformer(),
	trimResultTransformer(),
);
