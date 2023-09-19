// External dependencies
const vscode = require('vscode');

// Internal dependencies
const ThemeJSONParser = require('./src/classes/ThemeJSONParser');
const {
	registerAutocompleteProviders,
	findThemeFile,
} = require('./src/util');
const { providerInstance } = require('./src/util/registerAutocompleteProviders');

/**
 * Called when the extension is activated (if the current workspace contains a theme.json file)
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('Activating theme.json autocomplete extension.');
	
	// Add an on update callback to the ThemeJSONParser singleton that refreshes the autocomplete providers when updates are made.
	// TODO: Move this into ThemeJSONParser. It's here currently because we need the extension context.
	ThemeJSONParser.setOnUpdate(() => {
		if (providerInstance) {
			providerInstance.dispose();
		}

		context.subscriptions.push(
			registerAutocompleteProviders(
				ThemeJSONParser.toArray()
			)	
		);
	});
	
	findThemeFile().then((themeJsonPath) => {		
		if (!themeJsonPath) {
			return;
		}
		
		const themeJson = require(themeJsonPath);

		try {
			ThemeJSONParser.update(themeJson);
		} catch (e) {
			vscode.window.showErrorMessage('Error parsing theme.json file. Please check that it is valid JSON.');
		}
	});
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate,
}
