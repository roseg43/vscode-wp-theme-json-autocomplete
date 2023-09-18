const { register } = require('module');
const { registerAutocompleteProviders } = require('../util');

let instance = null;

/**
 * Class: Parses the theme.json file and converts values to CSS Custom Properties.
 * 
 * @param {Object} options
 * @param {Object} options.json The theme.json file contents.
 * @param {function} options.onUpdate A callback function to be called when the theme.json file is updated.
 * 
 * @property {Object} theme The theme.json file contents.
 * @property {Object} properties An object containing arrays of CSS Custom Property tokens.
 * @property {Array} properties.color An array of CSS Custom Property tokens for color values.
 * @property {Array} properties.custom An array of CSS Custom Property tokens for custom values.
 * @property {Array} properties.spacing An array of CSS Custom Property tokens for spacing values.
 * @property {Array} properties.fontFamily An array of CSS Custom Property tokens for font family values.
 * @property {function} onUpdate A callback function to be called when the theme.json file is updated.
 */
class ThemeJSONParser {
    theme;
    properties = {
        color: [],
        custom: [],
        spacing: [],
        fontFamily: [],
    };
    onUpdate = Object.create(Function);


    constructor({json = null, onUpdate = () => {}} = {}) {
        if (instance) {
            return instance;
        }
        
        if (!json) {
            return;
        }
        this.onUpdate = onUpdate;
        this.update(json)

        instance = this;
    }

    getInstance() {
        return instance;
    }

    /**
     * Checks the object's properties and sees if the schema matches an property and not further nested objects.
     * TODO: Move labels into their own class.
     * @param {*} obj 
     * 
     * @returns {Object|Boolean} Returns an object with a `label` and `value` property if the object matches a property schema. Returns `false` if not.
     */
    #maybeGetObjectLabelAndValues(obj) {
        if (obj.name && obj.size) {
            // settings.spacing.spacingSizes, settings.typography.fontSizes
            return {
                label: obj.slug,
                value: obj.size,
            };
        } else if (obj.slug && obj.color) {
            //settings.color.pallete
            return {
                label: obj.slug,
                value: obj.color,
            };
        } else if (obj.fontFamily) {
            // settings.typography.fontFamilies
            return {
                label: obj.slug,
                value: obj.fontFamily,
            };
        } else {
            return false;
        }
    }

    /**
     * Method: Loop through an object recursively. For each level, add an additional `--${key}` to the final CSS Custom Property name.
     * When hitting a key with a string value, add `--${key}: ${value};` to the final CSS Custom Property name, and push it to the `properties.custom` array.
     * 
     * @param {Object|Array} objOrArray The object or array to loop through
     * @param {String} prefix The prefix to add to the CSS Custom Property name. Used to recursively construct strings like `--font--size--small`
     * @param {String} propertyCategory The category string WordPress uses to generate this property. Example values: `preset`, `custom`
     * 
     * @returns {Array} An array of CSS Custom Property tokens
     */
    toCssCustomPropertyString = (objOrArray, prefix = '', propertyCategory = 'custom') => {
        let parsedProperties = [];
        for (const key in objOrArray) {
            // Store a modified version of the key, adding a single `-` character after any numbers.
            // This is used when converting the object keys to CSS Custom Properties, as WordPress adds a single `-` character after any numbers.
            let modifiedKey = key.replace(/(\d)/g, '$1-');

            if (typeof objOrArray[key] === 'object') {
               // Check if this object matches a property schema and get the label and value if so.
                const maybeProperty = this.#maybeGetObjectLabelAndValues(objOrArray[key]);
                
                if (!maybeProperty) {
                    // Continue iterating. Merge the results of the next call to this function with the current array of CSS Custom Properties.
                    parsedProperties = [...parsedProperties, ...this.toCssCustomPropertyString(objOrArray[key], `${prefix}--${modifiedKey}`, propertyCategory)];
                } else {
                    // Object matches a theme.json property schema, add it to the array of CSS Custom Properties.
                    const cssCustomProperty = {
                        name: `wp--${propertyCategory}${prefix}--${maybeProperty.label}`,
                        value:  maybeProperty.value,
                    };
                    parsedProperties.push(cssCustomProperty);
                }
            } else {

                const cssCustomProperty = {
                    name: `wp--${propertyCategory}${prefix}--${modifiedKey}`,
                    value:  objOrArray[key],
                };

                parsedProperties.push(cssCustomProperty);
            }
        }
        return parsedProperties;
    }
    
    /**
     * Loops through the `custom` property of theme.json and converts values to CSS Custom Properties
     * Format: `--wp--custom--{key1}--{key2}--{key3}: {value};`
     * TODO: Make a more generic version of this function that can be used for all properties
     * 
     * @returns {Array} An array of CSS Custom Property tokens
     */
    parseCustomProperties() {
        const {
            settings: {
                custom: customProperties
            }
         } = this.theme;
        if (!customProperties) {
            return;
        }

        return this.toCssCustomPropertyString(customProperties);        
    }

    /**
     * Parses the `color` property of theme.json and converts values to CSS Custom Properties.
     * 
     * @returns {Array} An array of CSS Custom Property tokens
     */
    parseColors() {
        const {
            settings: {
                color: {
                    palette: colorPalette
                }
            }
        } = this.theme;

        if (!colorPalette) {
            return;
        }

        return this.toCssCustomPropertyString(colorPalette, '--color', 'preset');
    }

    /**
     * Parses the `spacing.spacingSizes` property of theme.json and converts values to CSS Custom Properties.
     * @returns {Array} An array of CSS Custom Property tokens
     */
    parseSpacing() {
        const {
            settings: {
                spacing: {
                    spacingSizes
                }
            }
        } = this.theme;

        if (!spacingSizes) {
            return;
        }

        return this.toCssCustomPropertyString(spacingSizes, '--spacing', 'preset');
    }

    /**
     * Parses the `typography.fontFamilies` property of theme.json and converts values to CSS Custom Properties.
     * @returns {Array} An array of CSS Custom Property tokens
     */
    parseFontFamilies() {
        const {
            settings: {
                typography: {
                    fontFamilies
                }
            }
        } = this.theme;

        if (!fontFamilies) {
            return;
        }

        return this.toCssCustomPropertyString(fontFamilies, '--font-family', 'preset');
    }

    /**
     * Converts the `properties` object into an array of CSS Custom Properties
     */
    toArray() {
        const properties = [];
        for (const key in this.properties) {
            if (this.properties[key] && this.properties[key].length) {
                properties.push(...this.properties[key]);
            }
        }
        return properties;
    }

    /**
     * Updates the theme property and parses the theme.json file. Registers autocomplete providers.
     * 
     * @param {*} themeJson The theme.json file contents.
     */
    update(themeJson = {}) {
        if (!themeJson) {
            return;
        }

        this.theme = themeJson;
        this.properties = {
            ...this.properties,
            custom: this.parseCustomProperties(),
            color: this.parseColors(),
            spacing: this.parseSpacing(),
            fontFamily: this.parseFontFamilies(),
        };
        
        if (this.onUpdate && typeof this.onUpdate === 'function') {
            this.onUpdate();
        }
    }

    /**
     * Sets this.onUpdate to the callback function passed in.
     * 
     * @param {function} callback The function to be called when the theme.json file is updated.
     * @returns {void}
     */
        setOnUpdate(callback) {
            // If not a function, return
            if (typeof callback !== 'function') {
                return;
            }

            this.onUpdate = callback;
        }

    }

const singletonThemeParser = new ThemeJSONParser();
module.exports = singletonThemeParser;