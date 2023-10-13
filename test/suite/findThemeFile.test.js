const assert = require('assert');
const findThemeFile = require('../../src/util/findThemeFile');
const sinon = require('sinon');
const vscode = require('vscode');

suite('theme.json file locator', () => {
    test('Uses the user-defined path if one is set in extension settings', async () => {
        
        // Mock the vscode.workspace.getConfiguration method to return the user-defined path.
        sinon.stub(vscode.workspace, 'getConfiguration').returns({
            ...vscode.workspace.getConfiguration.prototype,
            get: () => '/path/to/theme.json',
        });
        const result = await findThemeFile();

        assert.strictEqual(result, '/path/to/theme.json');
  }); 
});