// External dependencies
const vscode = require('vscode');

// Internal dependencies
const ThemeJSONParser = require('./src/classes/ThemeJSONParser');
const {
	registerAutocompleteProviders,
	findThemeFile,
} = require('./src/util');

let providerInstance = null;

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

		providerInstance = registerAutocompleteProviders(
			ThemeJSONParser.toArray()
		);

		context.subscriptions.push(providerInstance);
	});
	
	findThemeFile().then((path) => {	
		if (!path) {
			return;
		}
		
		ThemeJSONParser.setThemePath(path);	
		try {
			const themeJson = require(path);
			ThemeJSONParser.update(themeJson);
		} catch (e) {
			vscode.window.showErrorMessage('Error parsing theme.json file. Please check that it is valid JSON.');
		}
	});

	/**
	 * Update our autocomplete provider when a theme.json file is saved.
	 */
	vscode.workspace.onDidSaveTextDocument((document) => {
		if (document.fileName.match(ThemeJSONParser.themePath)) {
			try {
				const themeJson = JSON.parse(document.getText());
				ThemeJSONParser.update(themeJson);
			} catch (e) {
				vscode.window.showErrorMessage('Error parsing theme.json file. Please check that it is valid JSON.');
			}
		}
	});
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
}
