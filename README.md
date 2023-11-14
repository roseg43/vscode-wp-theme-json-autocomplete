# (VS Code) WordPress theme.json CSS Autosuggest
![wp-theme-json-vsc-example-1](https://github.com/roseg43/vscode-wp-theme-json-autocomplete/assets/7225212/ae739c34-fc5b-4d91-9000-bf35e007e0a3)

This extension for Visual Studio Code simplifies working with design tokens defined in the `theme.json` file used by WordPress themes. It solves the problem of having to constantly refer back to your `theme.json` file for design token names, as well as having to remember all of the prefixes WordPress uses for different settings when they get converted to CSS Custom Properties.

## Features
- Automatically finds any `theme.json` files in your workspace. If multiple files are detected, you'll be asked to select a `theme.json` file to use for autosuggestions. In a future version this extension will automatically find the `theme.json` file nearest to the file you're working in.
- Updates suggestions whenever `theme.json` is saved.
- Provides property value details in suggestions so that you can see what values are set in `theme.json` at a glance

## Installation
The extension can be installed in two ways: manually via the `.vsix` file included in all releases, and through the [Extension Marketplace](https://marketplace.visualstudio.com/items?itemName=GabrielRose.wordpress-theme-json-css-autosuggest)

## Requirements
This extension will only work inside of a folder or file workspace.

## Extension Settings
This extension contributes the following settings:

* `wordpressThemeJsonCssAutosuggest.enable`: Enable/disable this extension.
* `wordpressThemeJsonCssAutosuggest.themeJsonPath`: The path to the theme directory. Leave blank to use the workspace root.

## Known Issues

- Currently, the only way to change which `theme.json` file to use in a multi-theme workspace is to clear out `wordpressThemeJsonCssAutosuggest.themeJsonPath` manually.

