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
    const themeJsonPath = vscode.workspace.getConfiguration('themeJsonAutocomplete').get('themeJsonPath');


    // If the path is not set, return an empty string.
    if (!themeJsonPath) {
        return '';
    }

    // Check to see if the path points to a file, or a directory.
    const isThemeFile = themeJsonPath.match(/theme\.json$/)?.length;

    if (isThemeFile) {
        return themeJsonPath;
    }

    // If the path points to a directory, search for a theme.json file inside of it.
    const searchPattern = themeJsonPath ? `${themeJsonPath}/**/theme.json`: '**/theme.json';
    const themeJsonFiles = await vscode.workspace.findFiles(searchPattern, '**/node_modules/**', 1);
    if (!themeJsonFiles.length) {
        return '';
    }

    if (themeJsonFiles.length === 1) {
        return themeJsonFiles[0].path;
    }

    // If multiple theme.json files are found, prompt the user to select one. Store the selected path in the extension settings, and return the selected option.
    const themeSelection = await multipleThemeFilePrompt(themeJsonFiles);

    return themeSelection;
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