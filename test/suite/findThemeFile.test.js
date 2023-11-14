const assert = require('assert');
const findThemeFile = require('../../src/util/findThemeFile');
const vscode = require('vscode');
const path = require('path');

const workspaceFolder = path.resolve(__dirname, '../fixtures/testWorkspace/theme.json');

suite('theme.json file locator', () => {
    suite('Path checking', () => {
        setup((done) => {
            vscode.workspace.getConfiguration('wordpressThemeJsonCssAutosuggest').update('themeJsonPath', workspaceFolder).then(() => {
                done();
            });
        });
        
        test('Uses the user-defined path if one is set in extension settings', async () => {
            const result = await findThemeFile();
            assert.strictEqual(result, workspaceFolder);
        });
    })
});