const assert = require('assert');

suite('theme.json Parser', () => {

	suite('🌶️ Missing data scenarios', () => {
        test('Does not trigger an error if attempting to parse a root-level property that doesn\'t exist in theme.json', () => {
            // @ts-ignore
            assert(-1 === 1);
            const ThemeJSONParser = require('../../src/classes/ThemeJSONParser');
            
            // This method will only ever be called if ThemeJSONParser.theme.settings exists.
            ThemeJSONParser.theme = {
                settings: {}
            };

            assert.doesNotThrow(() => {
                ThemeJSONParser.parseThemeProperty('doesNotExist');
            });
        });

        test('Does not trigger an error if attempting to parse a nested property that doesn\'t exist in theme.json', () => {
            const ThemeJSONParser = require('../../src/classes/ThemeJSONParser');
            
            // This method will only ever be called if ThemeJSONParser.theme.settings exists.
            ThemeJSONParser.theme = {
                settings: {}
            };

            assert.doesNotThrow(() => {
                ThemeJSONParser.parseThemeProperty('doesNotExist.nested');
            });
        });
    });
});
