const vscode = require('vscode');

let providerInstance;

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

				// If no values are passed, return an empty array.
				return [];
			}
		},
		'--'
	);

	providerInstance = provider;
	
	return providerInstance;
}

module.exports = {
	registerAutocompleteProviders,
	providerInstance,
};