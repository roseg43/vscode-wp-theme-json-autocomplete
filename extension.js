// External dependencies
const vscode = require('vscode');

// Internal dependencies
const ThemeJSONParser = require('./src/classes/ThemeJSONParser');

/**
 * Called when the extension is activated (if the current workspace contains a theme.json file)
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('Activating theme.json autocomplete extension.');
	/*
	From the root of the current workspace/folder, search for a theme.json file.
	If that file isn't found, check display a notification to the user: "theme.json file not found! Please set your workspace root to the root of your WordPress theme, or customize the path to search for in the extension settings."
	If the file is found, parse it.
	*/
	const currentEditor = vscode.window.activeTextEditor;
	if (!currentEditor) {
		vscode.workspace.findFiles('**/theme.json', '**/node_modules/**', 1).then(
			(files) => {
				if (!files.length) {
					vscode.window.showErrorMessage('theme.json file not found! Please set your workspace root to the root of your WordPress theme, or customize the path to search for in the extension settings.');
				}
			}
		);
	}

	if (!currentEditor.document) {
		return;
	}

	const currentFilename = currentEditor.document.fileName;

	// Check if the current file path is somewhere inside of a theme directory
	const isFileInTheme = currentFilename.match(/(.*\/wp-content\/themes\/[^\/]+\/)/)?.length;
	let themeJsonPath = '';

	if (isFileInTheme) {
		// Get the path to the theme.json file
		themeJsonPath = currentFilename.match(/(.*\/wp-content\/themes\/[^\/]+\/)/)[0] + 'theme.json';
	}

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
