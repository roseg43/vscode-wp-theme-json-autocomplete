// External dependencies
const vscode = require('vscode');

// Internal dependencies
const ThemeJSONParser = require('./src/classes/ThemeJSONParser');
const {
	registerAutocompleteProviders,
	findThemeFile,
} = require('./src/util');

/**
 * Called when the extension is activated (if the current workspace contains a theme.json file)
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('Activating theme.json autocomplete extension.');
	
	findThemeFile().then((themeJsonPath) => {
		// If we haven't found a theme.json path by now, the active file is not in a theme directory.
		if (!themeJsonPath) {
			return;
		}

		const themeJson = require(themeJsonPath);
		
		// Parse the theme file and register autocomplete providers.
		try {
			const themeParser = new ThemeJSONParser(themeJson);
			
			context.subscriptions.push(
				registerAutocompleteProviders(
					themeParser.toArray()
				)
			);
		} catch (e) {
			vscode.window.showErrorMessage('Error parsing theme.json file. Please check that it is valid JSON.');
		}
	});
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
