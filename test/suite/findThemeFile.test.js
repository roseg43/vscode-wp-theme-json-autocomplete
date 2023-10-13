const assert = require('assert');
const findThemeFile = require('../../src/util/findThemeFile');
const sinon = require('sinon');
const vscode = require('vscode');

suite('theme.json file locator', () => {
    test('Uses the user-defined path if one is set in extension settings', async () => {
        
        // Stub vscode.workspace.getConfiguration method to return the user-defined path.
        const workspaceGetStub = sinon.stub();
        workspaceGetStub.withArgs('themeJsonPath').returns('/path/to/theme.json');

        const workspaceStub = sinon.stub(vscode.workspace, 'getConfiguration');
        workspaceStub.withArgs('wordpressThemeJsonCssAutosuggest').returns({
            ...vscode.workspace.getConfiguration.prototype,
            get: workspaceGetStub,
        });

        const result = await findThemeFile();

        assert.strictEqual(result, '/path/to/theme.json');
  }); 
});