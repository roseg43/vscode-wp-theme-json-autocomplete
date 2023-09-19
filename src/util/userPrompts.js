const vscode = require('vscode');

/**
 * Prompts the user to select a theme.json file from the workspace to use for the extension
 * when multiples are found.
 * @param {vscode.Uri[]} uris An array of paths to theme.json files
 * @returns {Promise} A promise that resolves to the selected path.
 */
async function multipleThemeFilePrompt(uris) {    
    const options = uris.map((uri) => {
        return {
            label: uri.path,
            description: 'theme.json'
        }
    });

    const selectionToken = await vscode.window.showQuickPick(options, {
        placeHolder: 'Multiple theme.json files found. Please select one to use for the extension.'
    });
    
    // Set the selected path in the extension settings.
    vscode.workspace.getConfiguration('wordpressThemeJsonCssAutosuggest').update('themeJsonPath', selectionToken.label);
    
    const themeJson = require(selectionToken.label);
    const ThemeJSONParser = require('../classes/ThemeJSONParser');

    if (ThemeJSONParser?.update) {
       ThemeJSONParser.update(themeJson);
    }

    return selectionToken.label;
}

module.exports = {
    multipleThemeFilePrompt
};
