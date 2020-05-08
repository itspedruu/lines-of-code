const sloc = require('../lib/index.js');

test('Parse Project', async () => {
	const data = await sloc.parseProject([], []);

	expect(data).toHaveProperty('totalLines');
});