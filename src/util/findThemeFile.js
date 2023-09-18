const vscode = require('vscode');
const { multipleThemeFilePrompt } = require('./userPrompts');

/**
 * 1. Checks to see if a user-defined path is set in the extension settings.
 *    - If so, searches that path for a theme.json file and return it if found.
 * 2. If no user defined settings, searches the workspace for a theme.json file.
 * 
 * @returns {Promise} A Promise that resolves to path to the theme.json file, or an empty string if no theme.json file is found.
 */
async function getUserDefinedOrWorkspaceThemeFilePath() {
    const themeJsonPath = vscode.workspace.getConfiguration('themeJsonAutocomplete').get('themeJsonPath') || '';

    // Check to see if the path points to a file, or a directory.
    const isThemeFile = themeJsonPath.match(/theme\.json$/)?.length;

    if (isThemeFile) {
        return themeJsonPath;
    }

    // If the path points to a directory, search for a theme.json file inside of it.
    const searchPattern = themeJsonPath ? `${themeJsonPath}/**/theme.json`: '**/theme.json';
    const themeJsonFiles = await vscode.workspace.findFiles(searchPattern);
    
    if (!themeJsonFiles.length) {
        return '';
    }

    if (themeJsonFiles.length === 1) {
        return themeJsonFiles[0].path;
    }

    // If multiple theme.json files are found, display an error with an action to select one via multipleThemeFilePrompt.
    return handleMultipleFilesDetected(themeJsonFiles);
}

/**
 * Handles cases where multiple theme files are detected. Displays an error, and prompts the user to either
 * - Select a theme.json file from the workspace to use for the extension
 * - Disable the extension for the current workspace
 *
 * @param {vscode.Uri[]} themeJsonFiles  An array of paths to theme.json files
 * @returns {Promise} A Promise that resolves to the path to the selected theme.json file, or an empty string if no theme.json file is found.
 */
async function handleMultipleFilesDetected (themeJsonFiles) {
    vscode.window.showErrorMessage(
        'Multiple theme.json files found.',
        'Let me choose which to use',
        'Disable extension for this workspace'
    ).then((action) => {
        switch (action) {
            case 'Let me choose which to use':
                return multipleThemeFilePrompt(themeJsonFiles);

            case 'Disable extension for this workspace':
                vscode.workspace.getConfiguration('wordpressThemeJsonCssAutosuggest').update('enable', false);
                return '';
        }
    });
}

/**
 * Searches the workspace for a theme.json file, or the directory defined in the extension settings.
 * Prescriptive alias for `getUserDefinedOrWorkspaceThemeFilePath`.
 * 
 * @returns {Promise} A Promise that resolves to the path to the theme.json file, or an empty string if no theme.json file is found.
 */
async function findThemeFile() {
    let themeJsonPath = await getUserDefinedOrWorkspaceThemeFilePath();

    if (themeJsonPath) {
        return themeJsonPath;
    }
}

module.exports = findThemeFile;