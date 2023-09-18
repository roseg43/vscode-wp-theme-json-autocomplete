// External dependencies
const vscode = require('vscode');

// Internal dependencies
const ThemeJSONParser = require('./src/classes/ThemeJSONParser');
const findThemeFile = require('./src/util/findThemeFile');

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
		
		console.log('Attempting to parse theme.json file and register autocomplete providers.');
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

/**
 * Creates the autocomplete provider for CSS files.
 * @param {Array} values Array of values to be added to autocomplete suggestions.
 * @returns {vscode.Disposable} A disposable object that will dispose the provider when it is no longer needed.
 */
function registerAutocompleteProviders(values = []) {
	// Register a completion items provider for CSS files.
	const provider = vscode.languages.registerCompletionItemProvider(
		{
			// Pattern match css, sass, scss, and less files
			pattern: '**/*.{css,sass,scss,less}',
		},
		{
			provideCompletionItems(document, position) {
				if (values.length) {
					return values.map(
						(value, index) => new vscode.CompletionItem({
							label: value.name,
							description: `${value.value}`,
						}, vscode.CompletionItemKind.Variable)
					);
				}

				return [ 
					new vscode.CompletionItem('Hello World!'),
				]
			}
		},
		'--'
	);

	return provider;
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
