/*! 
VERSION: 0.0.26 
For license information, see http://www.raptor-editor.com/license
*/
(function($, window, rangy, undefined) {/**
 * @name $
 * @namespace jQuery
 */

/**
 * jQuery UI Editor
 *
 * <p>
 * Events:
 * <dl>
 *   <dt>resize</dt>
 *     <dd>Triggers when the page, or an element is resized to allow plugins to adjust their position</dt>
 *   <dt>change</dt>
 *     <dd>Triggers when ever the element content is change, or the selection is changed</dt>
 *   <dt>ready</dt>
 *     <dd>Triggers after the editor has been initialised, (but possibly before the editor is shown and enabled)</dt>
 *   <dt>show</dt>
 *     <dd>Triggers when the toolbar/dialog is shown</dt>
 *   <dt>hide</dt>
 *     <dd>Triggers when the toolbar/dialog is hidden</dt>
 *   <dt>enabled</dt>
 *     <dd>Triggers when the editing is enabled on the element</dt>
 *   <dt>disabled</dt>
 *     <dd>Triggers when the editing is disabled on the element</dt>
 * </dl>
 * </p>
 *
 * Naming Conventions:
 * In function names and parameters the following keywords mean:
 *  - node: A DOM node
 *  - tag: The tag name, e.g. h1, h2, p, a, etc
 *  - element: A jQuery element, selector, not HTML string (use $.parseHTML instead)
 *
 * @name $.editor
 * @class
 */

/**
 * @name $.ui
 * @namespace  jQuery UI
 */

/**
 * jQuery UI Editor
 * @name $.ui.editor
 * @namespace jQuery UI Editor
 */

/**
 * Default settings for the jQuery UI Editor widget
 * @name $.editor#options
 * @property {boolean} options
 */

/**
 * @name $.editor#reiniting
 * @property {boolean} reiniting
 */

/**
 * @name $.editor#ready
 * @property {boolean} ready
 */

/**
 * @name $.editor#element
 * @property {jQuery} element
 */

/**
 * @name $.editor#toolbar
 * @property {jQuery} toolbar
 */

/**
 * @name $.editor#events
 * @property {Object} events
 */

/**
 * @name $.editor#ui
 * @property {Object} ui
 */

/**
 * @name $.editor#plugins
 * @property {Object} plugins
 */

/**
 * @name $.editor#templates
 * @property {Object} templates
 */

/**
 * @name $.editor#history
 * @property {String[]} history
 */

/**
 * @name $.editor#present
 * @property {int} present
 */

/**
 * Switch to temporarly disable history function. Used when the history is being
 * traversed.
 *
 * @name $.editor#historyEnabled
 * @property {boolean} historyEnabled
 */

/**
 * @name $.editor#originalHtml
 * @property {String} originalHtml
 */

/**
 * @name $.editor.ui
 * @namespace Namespace beneath which all ui components reside
 */

/**
 * @name $.editor.plugin
 * @namespace Namespace beneath which all plugins reside
 *//**
 * @fileOverview This file has contains functions for making adjustments to the
 *      DOM based on ranges, selections, etc.
 * @author David Neilsen - david@panmedia.co.nz
 * @author Michael Robinson - michael@panmedia.co.nz
 * @version 0.2
 */

/**
 * Functions attached to the editor object during editor initialisation. Usage example:
 * <pre>selectionSave();
// Perform actions that could remove focus from editing element
selectionRestore();
selectionReplace('&lt;p&gt;Replace selection with this&lt;/p&gt;');</pre>
 * @namespace
 */
var domTools = {

    unwrapParentTag: function(tag) {
        selectionGetElements().each(function(){
            if ($(this).is(tag)) {
                $(this).replaceWith($(this).html());
            }
        });
    },

    /**
     * Wrapper function for document.execCommand().
     * @public @static
     */
    execCommand: function(command, arg1, arg2) {
        try {
            document.execCommand(command, arg1, arg2);
        } catch (exception) { }
    },

    /**
     * Creates a new elements and inserts it at the start of each range in a selection.
     *
     * @public @static
     * @param {String} tagName
     * @param {RangySelection} [sel] A RangySelection, or by default, the current selection.
     */
    insertTag: function(tagName, sel) {
        selectionEachRange(function(range) {
            range.insertNode($('<' + tagName + '/>')[0]);
        }, sel, this);
    },

    /**
     * Creates a new elements and inserts it at the end of each range in a selection.
     *
     * @public @static
     * @param {String} tagName
     * @param {RangySelection} [sel] A RangySelection, or by default, the current selection.
     */
    insertTagAtEnd: function(tagName, sel) {
        selectionEachRange(function(range) {
            range.insertNodeAtEnd($('<' + tagName + '/>')[0]);
        }, sel, this);
    },

    /**
     * Inserts a element at the start of each range in a selection. If the clone
     * parameter is true (default) then the each node in the element will be cloned
     * (copied). If false, then each node will be moved.
     *
     * @public @static
     * @param {jQuerySelector|jQuery|Element} element The jQuery element to insert
     * @param {boolean} [clone] Switch to indicate if the nodes chould be cloned
     * @param {RangySelection} [sel] A RangySelection, or by default, the current selection.
     */
    insertElement: function(element, clone, sel) {
        selectionEachRange(function(range) {
            $(element).each(function() {
                range.insertNode(clone === false ? this : this.cloneNode(true));
            });
        }, sel, this);
    },

    /**
     * Inserts a element at the end of each range in a selection. If the clone
     * paramter is true (default) then the each node in the element will be cloned
     * (copied). If false, then each node will be moved.
     *
     * @public @static
     * @param {jQuerySelector|jQuery|Element} element The jQuery element to insert
     * @param {boolean} [clone] Switch to indicate if the nodes chould be cloned
     * @param {RangySelection} [selection] A RangySelection, or by default, the current selection.
     */
    insertElementAtEnd: function(element, clone, sel) {
        selectionEachRange(function(range) {
            $(element).each(function() {
                range.insertNodeAtEnd(clone === false ? this : this.cloneNode(true));
            });
        }, sel, this);
    },

    /**
     *
     */
    inverseWrapWithTagClass: function(tag1, class1, tag2, class2) {
        selectionSave();
        // Assign a temporary tag name (to fool rangy)
        var id = 'domTools' + Math.ceil(Math.random() * 10000000);

        selectionEachRange(function(range) {
            var applier2 = rangy.createCssClassApplier(class2, {
                elementTagName: tag2
            });

            // Check if tag 2 is applied to range
            if (applier2.isAppliedToRange(range)) {
                // Remove tag 2 to range
                applier2.toggleSelection();
            } else {
                // Apply tag 1 to range
                rangy.createCssClassApplier(class1, {
                    elementTagName: id
                }).toggleSelection();
            }
        }, null, this);

        // Replace the temparay tag with the correct tag
        $(id).each(function() {
            $(this).replaceWith($('<' + tag1 + '/>').addClass(class1).html($(this).html()));
        });

        selectionRestore();
    }

};
/**
 * @fileOverview Editor internationalization (i18n) private functions and properties.
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 */

/**
 * @type String|null
 */
var currentLocale = null;

/**
 * @type Object
 */
var locales = {};

/**
 * @type Object
 */
var localeNames = {};

/**
 *
 * @static
 * @param {String} name
 * @param {String} nativeName
 * @param {Object} strings
 */
function registerLocale(name, nativeName, strings) {
    // <strict/>

    locales[name] = strings;
    localeNames[name] = nativeName;
    if (!currentLocale) currentLocale = name;
}

/**
 * @param {String} key
 */
function setLocale(key) {
    if (currentLocale !== key) {
        // <debug/>

        currentLocale = key;
        $.ui.editor.eachInstance(function() {
            this.reinit();
        });
    }
}

/**
 * Internationalisation function. Translates a string with tagged variable
 * references to the current locale.
 *
 * <p>
 * Variable references should be surrounded with double curly braces {{ }}
 *      e.g. "This string has a variable: {{my.variable}} which will not be translated"
 * </p>
 *
 * @static
 * @param {String} string
 * @param {Object} variables
 */
function _(string, variables) {
    // Get the current locale translated string
    if (currentLocale &&
            locales[currentLocale] &&
            locales[currentLocale][string]) {
        string = locales[currentLocale][string];
    }

    // Convert the variables
    if (!variables) {
        return string;
    } else {
        for (var key in variables) {
            string = string.replace('{{' + key + '}}', variables[key]);
        }
        return string;
    }
}
// <debug/>


// <strict/>


$(function() {
    // Initialise rangy
    if (!rangy.initialized) {
        rangy.init();
    }

    // Add helper method to rangy
    if (!$.isFunction(rangy.rangePrototype.insertNodeAtEnd)) {
        rangy.rangePrototype.insertNodeAtEnd = function(node) {
            var range = this.cloneRange();
            range.collapse(false);
            range.insertNode(node);
            range.detach();
            this.setEndAfter(node);
        };
    }
});

// Select menu close event (triggered when clicked off)
$('html').click(function(event) {
    $('.ui-editor-selectmenu-visible')
        .removeClass('ui-editor-selectmenu-visible');
});
/**
 *
 * @author David Neilsen - david@panmedia.co.nz
 * @author Michael Robinson - michael@panmedia.co.nz
 * @version 0.1
 * @requires jQuery
 * @requires jQuery UI
 * @requires Rangy
 */

$.widget('ui.editor',
    /**
     * @lends $.editor.prototype
     */
    {

    /**
     * Constructor
     */
    _init: function() {
        // Add the editor instance to the global list of instances
        if ($.inArray(this, $.ui.editor.instances) === -1) {
            $.ui.editor.instances.push(this);
        }

        var currentInstance = this;
        // <strict/>

        this.options = $.extend({}, $.ui.editor.defaults, this.options);

        // Set the options after the widget initialisation, because jQuery UI widget tries to extend the array (and breaks it)
        this.options.uiOrder = this.options.uiOrder || [
            ['logo'],
            ['save', 'cancel'],
            ['dock', 'showGuides', 'clean'],
            ['viewSource'],
            ['undo', 'redo'],
            ['alignLeft', 'alignCenter', 'alignJustify', 'alignRight'],
            ['textBold', 'textItalic', 'textUnderline', 'textStrike'],
            ['textSuper', 'textSub'],
            ['listUnordered', 'listOrdered'],
            ['hr', 'quoteBlock'],
            ['fontSizeInc', 'fontSizeDec'],
            ['colorPickerBasic'],
            ['clearFormatting'],
            ['link', 'unlink'],
            ['embed'],
            ['floatLeft', 'floatNone', 'floatRight'],
            ['tagMenu'],
            ['i18n'],
            ['raptorize'],
            ['statistics'],
            ['debugReinit', 'debugDestroy']
        ];

        // Give the element a unique ID
        if (!this.element.attr('id')) {
            this.element.attr('id', this.getUniqueId());
        }

        // Initialise properties
        this.ready = false;
        this.events = {};
        this.ui = {};
        this.plugins = {};
        this.templates = $.extend({}, $.ui.editor.templates);
        this.target = null;

        // jQuery DOM elements
        this.wrapper = null;
        this.toolbar = null;
        this.toolbarWrapper = null;
        this.path = null;

        // True if editing is enabled
        this.enabled = false;

        // True if the toolbar has been loaded and displayed
        this.visible = false;

        // List of UI objects bound to the editor
        this.uiObjects = {};

        // List of hotkeys bound to the editor
        this.hotkeys = {};
        // If hotkeys are enabled, register any custom hotkeys provided by the user
        if (this.options.enableHotkeys) {
            this.registerHotkey(this.hotkeys);
        }

        // Bind default events
        for (var name in this.options.bind) {
            this.bind(name, this.options.bind[name]);
        }

        // Undo stack, redo pointer
        this.history = [];
        this.present = 0;
        this.historyEnabled = true;

        // Check for browser support
        if (!isSupported(this)) {
            // @todo If element isn't a textarea, replace it with one
            return;
        }

        // Clone the DOM tools functions
        this.cloneDomTools();

        // Store the original HTML
        this.setOriginalHtml(this.element.is(':input') ? this.element.val() : this.element.html());

        // Replace textareas & inputs with a div
        if (this.element.is(':input')) {
            this.replaceOriginal();
        }

        // Attach core events
        this.attach();

        // Load plugins
        this.loadPlugins();

        // Stores if the current state of the content is clean
        this.dirty = false;

        // Stores the previous state of the content
        this.previousContent = null;

        // Stores the previous selection
        this.previousSelection = null;

        // Set the initial locale
        var locale = this.persist('locale') || this.options.initialLocale;
        setLocale(locale);

        // Fire the ready event
        this.ready = true;
        this.fire('ready');

        // Automatically enable the editor if autoEnable is true
        if (this.options.autoEnable) {
            $(function() {
                currentInstance.showToolbar();
                currentInstance.enableEditing();
            });
        }
    },

    /*========================================================================*\
     * Core functions
    \*========================================================================*/

    /**
     * Attaches the editors internal events.
     */
    attach: function() {
        this.bind('change', this.historyPush);
        this.bind('selectionChange', this.updateTagTree);
        this.bind('show', this.updateTagTree);

        var change = $.proxy(this.checkChange, this);

        this.getElement().find('img').bind('click.' + this.widgetName, $.proxy(function(event){
            selectionSelectOuter(event.target);
        }, this));

        this.getElement().bind('mouseup.' + this.widgetName, change);
        this.getElement().bind('keyup.' + this.widgetName, change);

        // Unload warning
        $(window).bind('beforeunload', $.proxy($.ui.editor.unloadWarning, $.ui.editor));

        // Trigger editor resize when window is resized
        var editor = this;
        $(window).resize(function(event) {
            editor.fire('resize');
        });
    },

    /**
     * Reinitialises the editor, unbinding all events, destroys all UI and plugins
     * then recreates them.
     */
    reinit: function() {
        if (!this.ready) {
            // If the edit is still initialising, wait until its ready
            var reinit;
            reinit = function() {
                // Prevent reinit getting called twice
                this.unbind('ready', reinit);
                this.reinit();
            };
            this.bind('ready', reinit);
            return;
        }
        // <debug/>

        // Store the state of the editor
        var enabled = this.enabled,
            visible = this.visible;

        // We are ready, so we can run reinit now
        this.destruct(true);
        this._init();

        // Restore the editor state
        if (enabled) {
            this.enableEditing();
        }

        if (visible) {
            this.showToolbar();
        }
    },

    /**
     * Returns the current content editable element, which will be either the
     * orignal element, or the div the orignal element was replaced with.
     * @returns {jQuery} The current content editable element
     */
    getElement: function() {
        return this.target ? this.target : this.element;
    },

    /**
     *
     */
    getOriginalElement: function() {
        return this.element;
    },

    /**
     * Replaces the original element with a content editable div. Typically used
     * to replace a textarea.
     */
    replaceOriginal: function() {
        if (this.target) return;

        // Create the replacement div
        var target = $('<div/>')
            // Set the HTML of the div to the HTML of the original element, or if the original element was an input, use its value instead
            .html(this.element.val())
            // Insert the div before the original element
            .insertBefore(this.element)
            // Give the div a unique ID
            .attr('id', this.getUniqueId())
            // Copy the original elements class(es) to the replacement div
            .addClass(this.element.attr('class'));

        var style = elementGetStyles(this.element);
        for (var i = 0; i < this.options.replaceStyle.length; i++) {
            target.css(this.options.replaceStyle[i], style[this.options.replaceStyle[i]]);
        }

        this.element.hide();
        this.bind('change', function() {
            if (this.getOriginalElement().is(':input')) {
                this.getOriginalElement().val(this.getHtml());
            } else {
                this.getOriginalElement().html(this.getHtml());
            }
        });

        this.target = target;
    },

    /**
     * Clones all of the DOM tools functions, and constrains the selection before
     * calling.
     */
    cloneDomTools: function() {
        for (var i in this.options.domTools) {
            if (!this[i]) {
                this[i] = (function(i) {
                    return function() {
                        selectionConstrain(this.getElement());
                        var html = this.getHtml();
                        var result = this.options.domTools[i].apply(this.options.domTools, arguments);
                        if (html !== this.getHtml()) {
                            // <debug/>
                            this.change();
                        }
                        return result;
                    };
                })(i);
            }
        }
    },

    /**
     * Determine whether the editing element's content has been changed.
     */
    checkChange: function() {
        // Check if the caret has changed position
        var currentSelection = rangy.serializeSelection();
        if (this.previousSelection !== currentSelection) {
            this.fire('selectionChange');
        }
        this.previousSelection = currentSelection;

        // Get the current content
        var currentHtml = this.getCleanHtml();

        // Check if the dirty state has changed
        var wasDirty = this.dirty;

        // Check if the current content is different from the original content
        this.dirty = this.getOriginalHtml() !== currentHtml;

        // If the current content has changed since the last check, fire the change event
        if (this.previousHtml !== currentHtml) {
            this.previousHtml = currentHtml;
            this.change();

            // If the content was changed to its original state, fire the cleaned event
            if (wasDirty !== this.dirty) {
                if (this.dirty) {
                    this.fire('dirty');
                } else {
                    this.fire('cleaned');
                }
            }
        }
    },

    change: function() {
        this.fire('change');
    },

    /*========================================================================*\
     * Destructor
    \*========================================================================*/

    /**
     * Hides the toolbar, disables editing, and fires the destroy event, and unbinds any events.
     * @public
     */
    destruct: function(reinitialising) {
        if (!reinitialising) {
            this.hideToolbar();
        }

        this.disableEditing();

        // Trigger destroy event, for plugins to remove them selves
        this.fire('destroy', false);

        // Remove all event bindings
        this.events = {};

        // Unbind all events
        this.getElement().unbind('.' + this.widgetName);

        if (this.getOriginalElement().is(':input')) {
            this.target.remove();
            this.target = null;
            this.element.show();
        }

        // Remove element
        if (this.wrapper) {
            this.wrapper.remove();
        }
    },

    /**
     * Runs destruct, then calls the UI widget destroy function.
     * @see $.
     */
    destroy: function() {
        this.destruct();
        $.Widget.prototype.destroy.call(this);
    },

    /*========================================================================*\
     * Persistance Functions
    \*========================================================================*/

    /**
     * @param {String} key
     * @param {mixed} [value]
     * @returns {mixed}
     */
    persist: function(key, value) {
        if (!this.options.persistence) return null;
        return $.ui.editor.persist(key, value, this.options.namespace);
    },

    /*========================================================================*\
     * Other Functions
    \*========================================================================*/

    /**
     *
     */
    enableEditing: function() {
        // Check if the toolbar is yet to be loaded
        if (!this.isToolbarLoaded()) {
            this.loadToolbar();
        }

        if (!this.enabled) {
            this.enabled = true;
            this.getElement().addClass(this.options.baseClass + '-editing');

            if (this.options.partialEdit) {
                this.getElement().find(this.options.partialEdit).attr('contenteditable', true);
            } else {
                this.getElement().attr('contenteditable', true);
            }

            this.execCommand('enableInlineTableEditing', false, false);
            this.execCommand('styleWithCSS', true, true);

            this.bindHotkeys();

            this.fire('enabled');
            this.fire('resize');
        }
    },

    /**
     *
     */
    disableEditing: function() {
        if (this.enabled) {
            this.enabled = false;
            this.getElement().attr('contenteditable', false)
                        .removeClass(this.options.baseClass + '-editing');
            rangy.getSelection().removeAllRanges();
            this.fire('disabled');
        }
    },

    /**
     *
     * @returns {boolean}
     */
    isEditing: function() {
        return this.enabled;
    },

    /**
     *
     */
    updateTagTree: function() {
        if (!this.isEditing()) return;

        var editor = this;
        var title = '';

        // An array of ranges (by index), each with a list of elements in the range
        var lists = [];
        var i = 0;

        // Loop all selected ranges
        selectionEachRange(function(range) {
            // Get the selected nodes common parent
            var node = range.commonAncestorContainer;

            var element;
            if (node.nodeType === 3) {
                // If nodes common parent is a text node, then use its parent
                element = $(node).parent();
            } else {
                // Or else use the node
                element = $(node);
            }

            // Ensure the element is the editing element or a child of the editing element
            if (!editor.isRoot(element) && !$.contains(editor.getElement().get(0), element.get(0))) {
                element = editor.getElement();
            }

            var list = [];
            lists.push(list);
            // Loop until we get to the root element, or the body tag
            while (element[0] && !editor.isRoot(element) && element[0].tagName.toLowerCase() !== 'body') {
                // Add the node to the list
                list.push(element);
                element = element.parent();
            }
            list.reverse();

            if (title) title += ' | ';
            title += this.getTemplate('root');
            for (var j = 0; j < list.length; j++) {
                title += this.getTemplate('tag', {
                    element: list[j][0].tagName.toLowerCase(),
                    // Create a data attribute with the index to the range, and element (so [0,0] will be the first range/first element)
                    data: '[' + i + ',' + j + ']'
                });
            }
            i++;
        }, null, this);

        if (!title) title = this.getTemplate('root');
        this.path
            .html(title)
            .find('a')
            .click(function() {
                // Get the range/element data attribute
                var i = $(this).data('ui-editor-selection');
                if (i) {
                    // Get the element from the list array
                    selectionSelectOuter(lists[i[0]][i[1]]);
                    editor.updateTagTree();
                } else {
                    selectionSelectOuter(editor.getElement());
                }
            });

        this.fire('tagTreeUpdated');
    },

    /**
     * @param {jQuerySelector|jQuery|Element} element
     * @returns {boolean}
     */
    isRoot: function(element) {
        return this.getElement()[0] === $(element)[0];
    },

    /**
     * @param {function} callback
     * @param {boolean} [callSelf]
     */
    unify: function(callback, callSelf) {
        if (callSelf !== false) callback(this);
        if (this.options.unify) {
            var currentInstance = this;
            $.ui.editor.eachInstance(function(instance) {
                if (instance === currentInstance) {
                    return;
                }
                if (instance.options.unify) {
                    callback(instance);
                }
            });
        }
    },

    /**
     * @returns {String}
     */
    getUniqueId: function() {
        return $.ui.editor.getUniqueId();
    },

    /*========================================================================*\
     * Messages
    \*========================================================================*/

    /**
     *
     */
    loadMessages: function() {
        this.messages = $(this.getTemplate('messages')).appendTo(this.wrapper);
    },

    /**
     * @param {String} type
     * @param {String[]} messages
     */
    showMessage: function(type, message, options) {
        options = $.extend({}, this.options.message, options);

        var messageObject;
        messageObject = {
            timer: null,
            editor: this,
            show: function() {
                this.element.slideDown();
                this.timer = window.setTimeout(function() {
                    this.timer = null;
                    messageObject.hide();
                }, options.delay, this);
            },
            hide: function() {
                if (this.timer) {
                    window.clearTimeout(this.timer);
                    this.timer = null;
                }
                this.element.stop().slideUp($.proxy(function() {
                    if ($.isFunction(options.hide)) {
                        options.hide.call(this);
                    }
                    this.element.remove();
                }, this));
            }
        };

        messageObject.element =
            $(this.getTemplate('message', {
                type: type,
                message: message
            }))
            .hide()
            .appendTo(this.messages)
            .find('.ui-editor-message-close')
                .click(function() {
                    messageObject.hide();
                })
            .end();

        messageObject.show();

        return messageObject;
    },

    /**
     * @param {String[]} messages
     */
    showLoading: function(message, options) {
        return this.showMessage('clock', message, options);
    },

    /**
     * @param {String[]} messages
     */
    showInfo: function(message, options) {
        return this.showMessage('info', message, options);
    },

    /**
     * @param {String[]} messages
     */
    showError: function(message, options) {
        return this.showMessage('circle-close', message, options);
    },

    /**
     * @param {String[]} messages
     */
    showConfirm: function(message, options) {
        return this.showMessage('circle-check', message, options);
    },

    /**
     * @param {String[]} messages
     */
    showWarning: function(message, options) {
        return this.showMessage('alert', message, options);
    },

    /*========================================================================*\
     * Toolbar
    \*========================================================================*/
    /**
     *
     */
    loadToolbar: function() {
        // <strict/>

        // <debug/>

        var toolbar = this.toolbar = $('<div/>')
            .addClass(this.options.baseClass + '-toolbar');
        var toolbarWrapper = this.toolbarWrapper = $('<div/>')
            .addClass(this.options.baseClass + '-toolbar-wrapper')
            .addClass('ui-widget-content')
            .append(toolbar);
        var path = this.path = $('<div/>')
            .addClass(this.options.baseClass + '-path')
            .addClass('ui-widget-header')
            .html(this.getTemplate('root'));
        var wrapper = this.wrapper = $('<div/>')
            .addClass(this.options.baseClass + '-wrapper')
            .css('display', 'none')
            .append(path)
            .append(toolbarWrapper);

        if ($.fn.draggable && this.options.draggable) {
            // <debug/>

            wrapper.draggable({
                cancel: 'a, button',
                cursor: 'move',
                // @todo Cancel drag when docked
                // @todo Move draggable into plugin
                // @todo Move tag menu/list into plugin
                handle: '.ui-editor-path',
                stop: $.proxy(function() {
                    // Save the persistant position
                    var pos = this.persist('position', [
                        wrapper.css('top'),
                        wrapper.css('left')
                    ]);
                    wrapper.css({
                        top: Math.abs(pos[0]),
                        left: Math.abs(pos[1])
                    });

                    // <debug/>
                }, this)
            });

            // Remove the relative position
            wrapper.css('position', '');

            // Set the persistant position
            var pos = this.persist('position') || this.options.dialogPosition;

            if (!pos) {
                pos = [10, 10];
            }

            // <debug/>

            if (parseInt(pos[0], 10) + wrapper.outerHeight() > $(window).height()) {
                pos[0] = $(window).height() - wrapper.outerHeight();
            }
            if (parseInt(pos[1], 10) + wrapper.outerWidth() > $(window).width()) {
                pos[1] = $(window).width() - wrapper.outerWidth();
            }

            wrapper.css({
                top: Math.abs(parseInt(pos[0], 10)),
                left: Math.abs(parseInt(pos[1], 10))
            });

            // Load the message display widget
            this.loadMessages();
        }

        $(function() {
            wrapper.appendTo('body');
        });

        this.loadUi();
    },

    isToolbarLoaded: function() {
        return this.wrapper !== null;
    },

    /**
     * Show the toolbar for the current element.
     * @param  {Range} [range] a native range to select after the toolbar has been shown
     */
    showToolbar: function(range) {
        // this.loadMessages();
        if (!this.isToolbarLoaded()) {
            this.loadToolbar();
        }

        if (!this.visible) {
            // <debug/>

            // If unify option is set, hide all other toolbars first
            if (this.options.unify) {
                this.hideOtherToolbars(true);
            }

            // Store the visible state
            this.visible = true;

            this.wrapper.css('display', '');

            this.fire('resize');
            if (typeof this.getElement().attr('tabindex') === 'undefined') {
                this.getElement().attr('tabindex', -1);
            }

            if (range) {
                if (range.select) { // IE
                    range.select();
                } else { // Others
                    var selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }

            var editor = this;
            $(function() {
                editor.fire('show');
                // Only focus element if the element is not a textarea / input
                if (!editor.element.is(':input')) {
                    editor.getElement().focus();
                }
            });
        }
    },

    /**
     *
     */
    hideToolbar: function() {
        if (this.visible) {
            this.visible = false;
            this.wrapper.hide();

            if (this.element.is(':input')) {
                this.element.show();
            }

            this.fire('hide');
            this.fire('resize');
        }
    },

    /**
     * @param {boolean} [instant]
     */
    hideOtherToolbars: function() {
        this.unify(function(editor) {
            editor.hideToolbar();
        }, false);
    },

    /**
     *
     * @returns {boolean}
     */
    isVisible: function() {
        return this.visible;
    },

    /*========================================================================*\
     * Template functions
    \*========================================================================*/

    /**
     * @param {String} name
     * @param {Object} variables
     */
    getTemplate: function(name, variables) {
        var template;
        if (!this.templates[name]) {
            template = $.ui.editor.getTemplate(name, this.options.urlPrefix);
        } else {
            template = this.templates[name];
        }
        // Translate template
        template = template.replace(/_\(['"]{1}(.*?)['"]{1}\)/g, function(match, string) {
            string = string.replace(/\\(.?)/g, function (s, slash) {
                switch (slash) {
                    case '\\':return '\\';
                    case '0':return '\u0000';
                    case '':return '';
                    default:return slash;
                }
            });
            return _(string);
        });
        // Replace variables
        variables = $.extend({}, this.options, variables || {});
        variables = this.getTemplateVars(variables);
        template = template.replace(/\{\{(.*?)\}\}/g, function(match, variable) {
            return variables[variable];
        });
        return template;
    },

    /**
     * @param {Object} variables
     * @param {String} prefix
     */
    getTemplateVars: function(variables, prefix, depth) {
        prefix = prefix ? prefix + '.' : '';
        var maxDepth = 5;
        if (!depth) depth = 1;
        var result = {};
        for (var name in variables) {
            if (typeof variables[name] === 'object' && depth < maxDepth) {
                var inner = this.getTemplateVars(variables[name], prefix + name, ++depth);
                for (var innerName in inner) {
                    result[innerName] = inner[innerName];
                }
            } else {
                result[prefix + name] = variables[name];
            }
        }
        return result;
    },

    /*========================================================================*\
     * History functions
    \*========================================================================*/
    /**
     *
     */
    historyPush: function() {
        if (!this.historyEnabled) return;
        var html = this.getHtml();
        if (html !== this.historyPeak()) {
            // Reset the future on change
            if (this.present !== this.history.length - 1) {
                this.history = this.history.splice(0, this.present + 1);
            }

            // Add new HTML to the history
            this.history.push(this.getHtml());

            // Mark the persent as the end of the history
            this.present = this.history.length - 1;
        }
    },

    /**
     * @returns {String|null}
     */
    historyPeak: function() {
        if (!this.history.length) return null;
        return this.history[this.present];
    },

    /**
     *
     */
    historyBack: function() {
        if (this.present > 0) {
            this.present--;
            this.setHtml(this.history[this.present]);
            this.historyEnabled = false;
            this.change();
            this.historyEnabled = true;
        }
    },

    /**
     *
     */
    historyForward: function() {
        if (this.present < this.history.length - 1) {
            this.present++;
            this.setHtml(this.history[this.present]);
            this.historyEnabled = false;
            this.change();
            this.historyEnabled = true;
        }
    },

    /*========================================================================*\
     * Hotkeys
    \*========================================================================*/

    /**
     * @param {Array|String} mixed The hotkey name or an array of hotkeys
     * @param {Object} The hotkey object or null
     */
    registerHotkey: function(mixed, actionData, context) {
        // Allow array objects, and single plugins
        if (typeof(mixed) === 'string') {

            // <strict/>

            this.hotkeys[mixed] = $.extend({}, {
                context: context,
                restoreSelection: true
            }, actionData);

        } else {
            for (var name in mixed) {
                this.registerHotkey(name, mixed[name], context);
            }
        }
    },

    bindHotkeys: function() {
        for (var keyCombination in this.hotkeys) {
            var editor = this,
                force = this.hotkeys[keyCombination].force || false;

            if (!this.options.enableHotkeys && !force) {
                continue;
            }

            this.getElement().bind('keydown.' + this.widgetName, keyCombination, function(event) {
                selectionSave();
                var object = editor.hotkeys[event.data];
                // Returning true from action will allow event bubbling
                if (object.action.call(object.context) !== true) {
                    event.preventDefault();
                }
                if (object.restoreSelection) {
                    selectionRestore();
                }
                editor.checkChange();
            });
        }
    },

    /*========================================================================*\
     * Buttons
    \*========================================================================*/

    uiEnabled: function(ui) {
        // Check if we are not automatically enabling UI, and if not, check if the UI was manually enabled
        if (this.options.enableUi === false &&
                typeof this.options.ui[ui] === 'undefined' ||
                this.options.ui[ui] === false) {
            // <debug/>
            return false;
        }

        // Check if we have explicitly disabled UI
        if ($.inArray(ui, this.options.disabledUi) !== -1) {
            return false;
        }

        return true;
    },

    /**
     * @param  {String} ui Name of the UI object to be returned.
     * @return {Object|null} UI object referenced by the given name.
     */
    getUi: function(ui) {
        return this.uiObjects[ui];
    },

    /**
     *
     */
    loadUi: function() {
        // Loop the UI order option
        for (var i = 0, l = this.options.uiOrder.length; i < l; i++) {
            var uiSet = this.options.uiOrder[i];
            // Each element of the UI order should be an array of UI which will be grouped
            var uiGroup = $('<div/>');

            // Loop each UI in the array
            for (var j = 0, ll = uiSet.length; j < ll; j++) {

                if (!this.uiEnabled(uiSet[j])) continue;

                var baseClass = uiSet[j].replace(/([A-Z])/g, function(match) {
                    return '-' + match.toLowerCase();
                });

                // Check the UI has been registered
                if ($.ui.editor.ui[uiSet[j]]) {
                    // Clone the UI object (which should be extended from the defaultUi object)
                    var uiObject = $.extend({}, $.ui.editor.ui[uiSet[j]]);

                    var options = $.extend(true, {}, this.options, {
                        baseClass: this.options.baseClass + '-ui-' + baseClass
                    }, uiObject.options, this.options.ui[uiSet[j]]);

                    uiObject.editor = this;
                    uiObject.options = options;
                    uiObject.ui = uiObject.init(this, options);

                    // Bind hotkeys
                    if (uiObject.hotkeys) {
                        this.registerHotkey(uiObject.hotkeys, null, uiObject);
                        // Add hotkeys to title
                        uiObject.ui.title += ' (' + $.map(uiObject.hotkeys, function(value, index) {
                                return index;
                            })[0] + ')';
                    }

                    // Append the UI object to the group
                    uiObject.ui.init(uiSet[j], this, options, uiObject).appendTo(uiGroup);

                    // Add the UI object to the editors list
                    this.uiObjects[uiSet[j]] = uiObject;
                }
                // <strict/>
            }

            uiGroup
                .addClass('ui-buttonset')
                .addClass(this.options.baseClass + '-buttonset');

            // Append the UI group to the editor toolbar
            if (uiGroup.children().length > 0) {
                uiGroup.appendTo(this.toolbar);
            }
        }
        $('<div/>').css('clear', 'both').appendTo(this.toolbar);
    },

    /**
     * @param {Object} options
     */
    uiButton: function(options) {
        return $.extend({
            button: null,
            options: {},
            init: function(name, editor, options, object) {
                var baseClass = name.replace(/([A-Z])/g, function(match) {
                    return '-' + match.toLowerCase();
                });
                // Extend options overriding editor < base class < supplied options < user options
                options = $.extend({}, editor.options, {
                    baseClass: editor.options.baseClass + '-' + baseClass + '-button'
                }, this.options, editor.options.ui[name]);
                // Default title if not set in plugin
                if (!this.title) this.title = _('Unnamed Button');

                // Create the HTML button
                this.button = $('<div/>')
                    .html(this.label || this.title)
                    .addClass(options.baseClass)
                    .attr('name', name)
                    .attr('title', this.title)
                    .val(name);

                if (options.classes) this.button.addClass(options.classes);

                // Prevent losing the selection on the mouse down
                this.button.bind('mousedown.' + object.editor.widgetName, function(e) {
                    e.preventDefault();
                });

                // Bind the click event
                var button = this;
                this.button.bind('mouseup.' + object.editor.widgetName, function(e) {
                    // Prevent losing the selection on the mouse up
                    e.preventDefault();
                    // Call the click event function
                    button.click.apply(object, arguments);
                    editor.checkChange();
                });

                editor.bind('destroy', $.proxy(function() {
                    this.button.button('destroy').remove();
                }, this));

                // Create the jQuery UI button
                this.button.button({
                    icons: {
                        primary: this.icon || 'ui-icon-' + baseClass
                    },
                    disabled: options.disabled ? true : false,
                    text: this.text || false,
                    label: this.label || null
                });

                this.ready.call(object);

                return this.button;
            },
            disable: function() {
                this.button.button('option', 'disabled', true);
            },
            enable: function() {
                this.button.button('option', 'disabled', false);
            },
            ready: function() {},
            click: function() {}
        }, options);
    },

    /**
     * @param {Object} options
     */
    uiSelectMenu: function(options) {
        return $.extend({
            // HTML select
            select: null,

            // HTML replacements
            selectMenu: null,
            button: null,
            menu: null,

            // Options passed but the plugin
            options: {},

            init: function(name, editor) {
                var ui = this;

                // Disable HTML select to prevent submission of select values
                ui.select.attr('disabled', 'disabled');

                var baseClass = name.replace(/([A-Z])/g, function(match) {
                    return '-' + match.toLowerCase();
                });

                // Extend options overriding editor < base class < supplied options < user options
                var options = $.extend({}, editor.options, {
                    baseClass: editor.options.baseClass + baseClass + '-select-menu'
                }, ui.options, editor.options.ui[name]);

                // Default title if not set in plugin
                if (!ui.title) ui.title = _('Unnamed Select Menu');

                ui.wrapper =  $('<div class="ui-editor-selectmenu-wrapper"/>')
                    .append(ui.select.hide())
                    .addClass(ui.select.attr('class'));

                ui.selectMenu = $('<div class="ui-editor-selectmenu"/>')
                    .appendTo(ui.wrapper);

                ui.menu = $('<div class="ui-editor-selectmenu-menu ui-widget-content ui-corner-bottom ui-corner-tr"/>')
                    .appendTo(ui.wrapper);

                ui.select.find('option, .ui-editor-selectmenu-option').each(function() {
                    var option = $('<div/>')
                        .addClass('ui-editor-selectmenu-menu-item')
                        .addClass('ui-corner-all')
                        .html($(this).html())
                        .appendTo(ui.menu)
                        .bind('mouseenter.' + editor.widgetName, function() {
                            $(this).addClass('ui-state-focus');
                        })
                        .bind('mouseleave.' + editor.widgetName, function() {
                            $(this).removeClass('ui-state-focus');
                        })
                        .bind('mousedown.' + editor.widgetName, function() {
                            // Prevent losing focus on editable region
                            return false;
                        })
                        .bind('click.' + editor.widgetName, function() {
                            var option = ui.select.find('option, .ui-editor-selectmenu-option').eq($(this).index());
                            var value = option.attr('value') || option.val();
                            ui.select.val(value);
                            ui.update();
                            ui.wrapper.removeClass('ui-editor-selectmenu-visible');
                            ui.button.addClass('ui-corner-all')
                                  .removeClass('ui-corner-top');
                            ui.change(value);
                            return false;
                        });
                });


                var text = $('<div/>')
                    .addClass('ui-editor-selectmenu-text');
                var icon = $('<div/>')
                    .addClass('ui-icon ui-icon-triangle-1-s');
                ui.button = $('<div/>')
                    .addClass('ui-editor-selectmenu-button ui-editor-selectmenu-button ui-button ui-state-default')
                    .attr('title', ui.title)
                    .append(text)
                    .append(icon)
                    .prependTo(ui.selectMenu);
                ui.button
                    .bind('mousedown.' + editor.widgetName, function() {
                        // Prevent losing focus on editable region
                        return false;
                    })
                    .bind('click.' + editor.widgetName, function() {
                        // Do not fire click event when disabled
                        if ($(this).hasClass('ui-state-disabled')) {
                            return;
                        }
                        if (parseInt(ui.menu.css('min-width'), 10) < ui.button.outerWidth() + 10) {
                            ui.menu.css('min-width', ui.button.outerWidth() + 10);
                        }
                        ui.wrapper.toggleClass('ui-editor-selectmenu-visible');
                        return false;
                    })
                    .bind('mouseenter.' + editor.widgetName, function() {
                        if (!$(this).hasClass('ui-state-disabled')) {
                            $(this).addClass('ui-state-hover', $(this).hasClass('ui-state-disabled'));
                        }
                    })
                    .bind('mouseleave.' + editor.widgetName, function() {
                        $(this).removeClass('ui-state-hover');
                    });

                var selected = ui.select.find('option[value=' + this.select.val() + '], .ui-editor-selectmenu-option[value=' + this.select.val() + ']').html() ||
                    ui.select.find('option, .ui-editor-selectmenu-option').first().html();
                ui.button.find('.ui-editor-selectmenu-text').html(selected);

                return ui.wrapper;
            },
            update: function(value) {
                var selected = this.select.find('option[value=' + this.select.val() + '], .ui-editor-selectmenu-option[value=' + this.select.val() + ']').html();
                this.button.find('.ui-editor-selectmenu-text').html(selected);
            },
            val: function() {
                var result = this.select.val.apply(this.select, arguments);
                this.update();
                return result;
            },
            change: function() {
            }
        }, options);
    },

    /*========================================================================*\
     * Plugins
    \*========================================================================*/
    /**
     * @param {String} name
     * @return {Object|undefined} plugin
     */
    getPlugin: function(name) {
        return this.plugins[name];
    },

    /**
     *
     */
    loadPlugins: function() {
        var editor = this;
        if (!this.options.plugins) this.options.plugins = {};
        for (var name in $.ui.editor.plugins) {
            // Check if we are not automaticly enabling plugins, and if not, check if the plugin was manually enabled
            if (this.options.enablePlugins === false &&
                    typeof this.options.plugins[name] === 'undefined' ||
                    this.options.plugins[name] === false) {
                // <debug/>
                continue;
            }

            // Check if we have explicitly disabled the plugin
            if ($.inArray(name, this.options.disabledPlugins) !== -1) continue;

            // Clone the plugin object (which should be extended from the defaultPlugin object)
            var pluginObject = $.extend({}, $.ui.editor.plugins[name]);

            var baseClass = name.replace(/([A-Z])/g, function(match) {
                return '-' + match.toLowerCase();
            });

            var options = $.extend(true, {}, editor.options, {
                baseClass: editor.options.baseClass + '-' + baseClass
            }, pluginObject.options, editor.options.plugins[name]);

            pluginObject.editor = editor;
            pluginObject.options = options;
            pluginObject.init(editor, options);

            if (pluginObject.hotkeys) {
                this.registerHotkey(pluginObject.hotkeys, null, pluginObject);
            }

            editor.plugins[name] = pluginObject;
        }
    },

    /*========================================================================*\
     * Content accessors
    \*========================================================================*/

    /**
     * @returns {boolean}
     */
    isDirty: function() {
        return this.dirty;
    },

    /**
     * @returns {String}
     */
    getHtml: function() {
        var content = this.getElement().html();

        // Remove saved rangy ranges
        content = $('<div/>').html(content);
        content.find('.rangySelectionBoundary').remove();
        content = content.html();

        return content;
    },

    getCleanHtml: function() {
        this.fire('clean');
        var content = this.getElement().html();
        this.fire('restore');

        // Remove saved rangy ranges
        content = $('<div/>').html(content);
        content.find('.rangySelectionBoundary').remove();
        content = content.html();

        return content;
    },

    /**
     * @param {String} html
     */
    setHtml: function(html) {
        this.getElement().html(html);
        this.fire('html');
        this.change();
    },

    /**
     *
     */
    resetHtml: function() {
        this.setHtml(this.getOriginalHtml());
        this.fire('cleaned');
    },

    /**
     * @returns {String}
     */
    getOriginalHtml: function() {
        return this.originalHtml;
    },

    /**
     *
     */
    save: function() {
        var html = this.getCleanHtml();
        this.fire('save');
        this.setOriginalHtml(html);
        this.fire('saved');
        this.fire('cleaned');
        return html;
    },

    /**
     * @param {String} html
     */
    setOriginalHtml: function(html) {
        this.originalHtml = html;
    },

    /*========================================================================*\
     * Event handling
    \*========================================================================*/
    /**
     * @param {String} name
     * @param {function} callback
     * @param {Object} [context]
     */
    bind: function(name, callback, context) {
        // <strict/>
        var events = this.events;
        $.each(name.split(','), function(i, name) {
            name = $.trim(name);
            if (!events[name]) events[name] = [];
            events[name].push({
                context: context,
                callback: callback
            });
        });
    },

    /**
     * @param {String} name
     * @param {function} callback
     * @param {Object} [context]
     */
    unbind: function(name, callback, context) {

        for (var i = 0, l = this.events[name].length; i < l; i++) {
            if (this.events[name][i] &&
                this.events[name][i].callback === callback &&
                this.events[name][i].context === context) {
                this.events[name].splice(i, 1);
            }
        }
    },

    /**
     * @param {String} name
     * @param {boolean} [global]
     * @param {boolean} [sub]
     */
    fire: function(name, global, sub) {
        // Fire before sub-event
        if (!sub) this.fire('before:' + name, global, true);

        // <debug/>

        if (this.events[name]) {
            for (var i = 0, l = this.events[name].length; i < l; i++) {
                var event = this.events[name][i];
                if (typeof event.callback !== 'undefined') {
                    event.callback.call(event.context || this);
                }
            }
        }
        // Also trigger the global editor event, unless specified not to
        if (global !== false) {
            $.ui.editor.fire(name);
        }

        // Fire after sub-event
        if (!sub) this.fire('after:' + name, global, true);
    }

});

/*============================================================================*\
 * Global static class definition
\*============================================================================*/
$.extend($.ui.editor,
    /** @lends $.ui.editor */
    {

    // <expose>
    elementRemoveComments: elementRemoveComments,
    elementRemoveAttributes: elementRemoveAttributes,
    elementBringToTop: elementBringToTop,
    elementOuterHtml: elementOuterHtml,
    elementOuterText: elementOuterText,
    elementIsBlock: elementIsBlock,
    elementDefaultDisplay: elementDefaultDisplay,
    elementIsValid: elementIsValid,
    elementGetStyles: elementGetStyles,
    elementWrapInner: elementWrapInner,
    elementToggleStyle: elementToggleStyle,
    elementSwapStyles: elementSwapStyles,
    fragmentToHtml: fragmentToHtml,
    fragmentInsertBefore: fragmentInsertBefore,
    rangeExpandToParent: rangeExpandToParent,
    rangeGetCommonAncestor: rangeGetCommonAncestor,
    rangeIsEmpty: rangeIsEmpty,
    selectionSave: selectionSave,
    selectionRestore: selectionRestore,
    selectionDestroy: selectionDestroy,
    selectionEachRange: selectionEachRange,
    selectionReplace: selectionReplace,
    selectionSelectInner: selectionSelectInner,
    selectionSelectOuter: selectionSelectOuter,
    selectionSelectEdge: selectionSelectEdge,
    selectionSelectEnd: selectionSelectEnd,
    selectionSelectStart: selectionSelectStart,
    selectionGetHtml: selectionGetHtml,
    selectionGetElements: selectionGetElements,
    selectionToggleWrapper: selectionToggleWrapper,
    selectionExists: selectionExists,
    selectionReplaceSplittingSelectedElement: selectionReplaceSplittingSelectedElement,
    selectionReplaceWithinValidTags: selectionReplaceWithinValidTags,
    selectionToggleBlockStyle: selectionToggleBlockStyle,
    stringStripTags: stringStripTags,
    typeIsNumber: typeIsNumber,
    // </expose>

    /** @namespace Default options for Raptor Editor */
    defaults: {

        /** @type {Object} Plugins option overrides */
        plugins: {},

        /** @type {Object} UI option overrides */
        ui: {},

        /** @type {Object} Default events to bind */
        bind: {},

        /**
         * @deprecated
         * @type {Object}
         */
        domTools: domTools,

        /**
          * @type {String} Namespace used to persistence to prevent conflicting
          * stored values.
          */
        namespace: null,

        /**
         * @type {Boolean} Switch to indicated that some events should be
         * automatically applied to all editors that are unified.
         */
        unify: true,

        /**
         * @type {Boolean} Switch to indicate weather or not to stored persistent
         * values, if set to false the persist function will always return null.
         */
        persistence: true,

        /** @type {String} The name to store persistent values under */
        persistenceName: 'uiEditor',

        /**
         * @type {Boolean} Switch to indicate weather or not to a warning should
         * pop up when the user navigates away from the page when unsaved changes
         * exist.
         */
        unloadWarning: true,

        /**
         * @type {Boolean} Switch to automatically enabled editing on the element.
         */
        autoEnable: false,

        /**
         * @type {Selector} Only enable editing on certain parts of the element.
         */
        partialEdit: false,

        /**
         * @type {Boolean} Switch to specify if the editor should automatically
         * enable all plugins, if set to false, only the plugins specified in
         * the {@link $.ui.editor.defaults.plugins} option object will be enabled.
         */
        enablePlugins: true,

        /**
         * @type {String[]} An array of explicitly disabled plugins.
         */
        disabledPlugins: [],

        /**
         * @type {String[]} And array of arrays denoting the order and grouping
         * of UI elements in the toolbar.
         */
        uiOrder: null,

        /**
         * @type {Boolean} Switch to specify if the editor should automatically
         * enable all UI, if set to false, only the UI specified in the {@link $.ui.editor.defaults.ui}
         * option object will be enabled.
         */
        enableUi: true,

        /**
         * @type {String[]} An array of explicitly disabled UI elements.
         */
        disabledUi: [],

        /**
         * @type {Object} Default message options.
         */
        message: {
            delay: 5000
        },

        /**
         * @type {String[]} A list of styles that will be copied from a replaced
         * textarea and applied to the editor replacement element.
         */
        replaceStyle: [
            'display', 'position', 'float', 'width',
            'padding-left', 'padding-right', 'padding-top', 'padding-bottom',
            'margin-left', 'margin-right', 'margin-top', 'margin-bottom'
        ],

        /** @type {String} The base class name to use on elements created by the editor. */
        baseClass: 'ui-editor',

        /** @type {String} CSS class prefix that is prepended to inserted elements classes. */
        cssPrefix: 'cms-',

        /** @type {Boolean} True if the editor should be draggable. */
        draggable: true,

        /** @type {Boolean} True to enable hotkeys */
        enableHotkeys: true,

        /** @type {Object} Custom hotkeys */
        hotkeys: {},

        /**
         * @type {String} Applied to elements that should not be stripped during
         * normal use, but do not belong in the final content.
         */
        supplementaryClass: 'supplementary-element-class',

        /**
         * @type {String} Locale to use by default. If
         * {@link $.ui.editor.options.persistence} is set to true and the user has
         * changed the locale, then the user's locale choice will be used.
         */
        initialLocale: 'en'
    },

    /** @property {Object} events Events added via $.ui.editor.bind */
    events: {},

    /** @property {Object} plugins Plugins added via $.ui.editor.registerPlugin */
    plugins: {},

    /**
     * UI added via $.ui.editor.registerUi
     * @property {Object} ui
     */
    ui: {},

    /**
     * @property {$.ui.editor[]} instances
     */
    instances: [],

    /**
     * @returns {$.ui.editor[]}
     */
    getInstances: function() {
        return this.instances;
    },

    eachInstance: function(callback) {
        for (var i = 0; i < this.instances.length; i++) {
            callback.call(this.instances[i], this.instances[i]);
        }
    },

    /*========================================================================*\
     * Templates
    \*========================================================================*/
    /**
     * @property {String} urlPrefix
     */
    urlPrefix: '/raptor/',

    /**
     * @property {Object} templates
     */
    templates: { 'paste.dialog': "<div class=\"ui-editor-paste-panel ui-dialog-content ui-widget-content\">\n    <div class=\"ui-editor-paste-panel-tabs ui-tabs ui-widget ui-widget-content ui-corner-all\">\n        <ul class=\"ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all\">\n            <li class=\"ui-state-default ui-corner-top ui-tabs-selected ui-state-active\"><a>_('Plain Text')<\/a><\/li>\n            <li class=\"ui-state-default ui-corner-top\"><a>_('Formatted &amp; Cleaned')<\/a><\/li>\n            <li class=\"ui-state-default ui-corner-top\"><a>_('Formatted Unclean')<\/a><\/li>\n            <li class=\"ui-state-default ui-corner-top\"><a>_('Source Code')<\/a><\/li>\n        <\/ul>\n        <div class=\"ui-editor-paste-plain-tab\">\n            <textarea class=\"ui-editor-paste-area ui-editor-paste-plain\">{{plain}}<\/textarea>\n        <\/div>\n        <div class=\"ui-editor-paste-markup-tab\" style=\"display: none\">\n            <div contenteditable=\"true\" class=\"ui-editor-paste-area ui-editor-paste-markup\">{{markup}}<\/div>\n        <\/div>\n        <div class=\"ui-editor-paste-rich-tab\" style=\"display: none\">\n            <div contenteditable=\"true\" class=\"ui-editor-paste-area ui-editor-paste-rich\">{{html}}<\/div>\n        <\/div>\n        <div class=\"ui-editor-paste-source-tab\" style=\"display: none\">\n            <textarea class=\"ui-editor-paste-area ui-editor-paste-source\">{{html}}<\/textarea>\n        <\/div>\n    <\/div>\n<\/div>\n",'imageresize.manually-resize-image': "<div>\n    <fieldset>\n        <label for=\"{{baseClass}}-width\">_('Image width')<\/label>\n        <input id=\"{{baseClass}}-width\" name=\"width\" type=\"text\" value=\"{{width}}\" placeholder=\"_('Image width')\"\/>\n    <\/fieldset>\n    <fieldset>\n        <label for=\"{{baseClass}}-height\">_('Image height')<\/label>\n        <input id=\"{{baseClass}}-height\" name=\"height\" type=\"text\" value=\"{{height}}\" placeholder=\"_('Image height')\"\/>\n    <\/fieldset>\n<\/div>",'viewsource.dialog': "<div style=\"display:none\" class=\"{{baseClass}}-dialog\">\n    <div class=\"{{baseClass}}-plain-text\">\n        <textarea>{{source}}<\/textarea>\n    <\/div>\n<\/div>\n",'statistics.dialog': "<div>\n    <ul>\n        <li>{{characters}}<\/li>\n        <li>{{words}}<\/li>\n        <li>{{sentences}}<\/li>\n        <li>{{truncation}}<\/li>\n    <\/ul>\n<\/div>\n",'i18n.menu': "<select autocomplete=\"off\" name=\"tag\" class=\"ui-editor-tag-select\">\n    <option value=\"na\">_('N\/A')<\/option>\n    <option value=\"p\">_('Paragraph')<\/option>\n    <option value=\"h1\">_('Heading&nbsp;1')<\/option>\n    <option value=\"h2\">_('Heading&nbsp;2')<\/option>\n    <option value=\"h3\">_('Heading&nbsp;3')<\/option>\n    <option value=\"div\">_('Divider')<\/option>\n<\/select>\n",'link.label': "<label>\n    <input class=\"{{classes}}\" type=\"radio\" value=\"{{type}}\" name=\"link-type\" autocomplete=\"off\"\/>\n    <span>{{title}}<\/span>\n<\/label>\n",'link.email': "<h2>_('Link to an email address')<\/h2>\n<fieldset class=\"{{baseClass}}-email\">\n    <label for=\"{{baseClass}}-email\">_('Email')<\/label>\n    <input id=\"{{baseClass}}-email\" name=\"email\" type=\"text\" placeholder=\"_('Enter email address')\"\/>\n<\/fieldset>\n<fieldset class=\"{{baseClass}}-email\">\n    <label for=\"{{baseClass}}-email-subject\">_('Subject (optional)')<\/label>\n    <input id=\"{{baseClass}}-email-subject\" name=\"subject\" type=\"text\" placeholder=\"_('Enter subject')\"\/>\n<\/fieldset>\n",'link.error': "<div style=\"display:none\" class=\"ui-widget {{baseClass}}-error-message {{messageClass}}\">\n    <div class=\"ui-state-error ui-corner-all\"> \n        <p>\n            <span class=\"ui-icon ui-icon-alert\"><\/span> \n            {{message}}\n        <\/p>\n    <\/div>\n<\/div>",'link.dialog': "<div style=\"display:none\" class=\"{{baseClass}}-panel\">\n    <div class=\"{{baseClass}}-menu\">\n        <p>_('Choose a link type:')<\/p>\n        <fieldset><\/fieldset>\n    <\/div>\n    <div class=\"{{baseClass}}-wrap\">\n        <div class=\"{{baseClass}}-content\"><\/div>\n    <\/div>\n<\/div>\n",'link.file-url': "<h2>_('Link to a document or other file')<\/h2>\n<fieldset>\n    <label for=\"{{baseClass}}-external-href\">_('Location')<\/label>\n    <input id=\"{{baseClass}}-external-href\" value=\"http:\/\/\" name=\"location\" class=\"{{baseClass}}-external-href\" type=\"text\" placeholder=\"_('Enter your URL')\" \/>\n<\/fieldset>\n<h2>_('New window')<\/h2>\n<fieldset>\n    <label for=\"{{baseClass}}-external-target\">\n        <input id=\"{{baseClass}}-external-target\" name=\"blank\" type=\"checkbox\" \/>\n        <span>_('Check this box to have the file open in a new browser window')<\/span>\n    <\/label>\n<\/fieldset>\n<h2>_('Not sure what to put in the box above?')<\/h2>\n<ol>\n    <li>_('Ensure the file has been uploaded to your website')<\/li>\n    <li>_('Open the uploaded file in your browser')<\/li>\n    <li>_(\"Copy the file's URL from your browser's address bar and paste it into the box above\")<\/li>\n<\/ol>\n",'link.external': "<h2>_('Link to a page on this or another website')<\/h2>\n<fieldset>\n    <label for=\"{{baseClass}}-external-href\">_('Location')<\/label>\n    <input id=\"{{baseClass}}-external-href\" value=\"http:\/\/\" name=\"location\" class=\"{{baseClass}}-external-href\" type=\"text\" placeholder=\"_('Enter your URL')\" \/>\n<\/fieldset>\n<h2>_('New window')<\/h2>\n<fieldset>\n    <label for=\"{{baseClass}}-external-target\">\n        <input id=\"{{baseClass}}-external-target\" name=\"blank\" type=\"checkbox\" \/>\n        <span>_('Check this box to have the link open in a new browser window')<\/span>\n    <\/label>\n<\/fieldset>\n<h2>_('Not sure what to put in the box above?')<\/h2>\n<ol>\n    <li>_('Find the page on the web you want to link to')<\/li>\n    <li>_('Copy the web address from your browser\'s address bar and paste it into the box above')<\/li>\n<\/ol>\n",'clickbuttontoedit.edit-button': "<button class=\"{{baseClass}}-button\">_('Click to begin editing')<\/button>\n",'embed.dialog': "<div style=\"display:none\" class=\"{{baseClass}}-dialog\">\n    <div class=\"ui-editor-embed-panel-tabs ui-tabs ui-widget ui-widget-content ui-corner-all\">\n        <ul class=\"ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all\">\n            <li class=\"ui-state-default ui-corner-top ui-tabs-selected ui-state-active\"><a>_('Embed Code')<\/a><\/li>\n            <li class=\"ui-state-default ui-corner-top\"><a>_('Preview')<\/a><\/li>\n        <\/ul>\n        <div class=\"ui-editor-embed-code-tab\">\n            <p>_('Paste your embed code into the text area below.')<\/p>\n            <textarea><\/textarea>\n        <\/div>\n        <div class=\"ui-editor-preview-tab\" style=\"display: none\">\n            <p>_('A preview of your embedded object is displayed below.')<\/p>\n            <div class=\"ui-editor-embed-preview\"><\/div>\n        <\/div>\n    <\/div>\n<\/div>\n",'cancel.dialog': "<div>\n    _('Are you sure you want to stop editing?')\n    <br\/><br\/>\n    _('All changes will be lost!')\n<\/div>\n",'tagmenu.menu': "<select autocomplete=\"off\" name=\"tag\" class=\"ui-editor-tag-select\">\n    <option value=\"na\">_('N\/A')<\/option>\n    <option value=\"p\">_('Paragraph')<\/option>\n    <option value=\"h1\">_('Heading&nbsp;1')<\/option>\n    <option value=\"h2\">_('Heading&nbsp;2')<\/option>\n    <option value=\"h3\">_('Heading&nbsp;3')<\/option>\n<\/select>\n",'unsavededitwarning.warning': "<div title=\"_('This block contains unsaved changes')\" class=\"{{baseClass}}\">\n    <span class=\"ui-icon ui-icon-alert\"><\/span>\n    <span>There are unsaved edits on this page<\/span>\n<\/div>",'root': "<a href=\"javascript: \/\/ _('Select all editable content')\" \n   class=\"{{baseClass}}-select-element\"\n   title=\"_('Click to select all editable content')\">_('root')<\/a> \n",'message': "<div class=\"{{baseClass}}-message-wrapper {{baseClass}}-message-{{type}}\">\n    <div class=\"ui-icon ui-icon-{{type}}\" \/>\n    <div class=\"{{baseClass}}-message\">{{message}}<\/div>\n    <div class=\"{{baseClass}}-message-close ui-icon ui-icon-circle-close\"><\/div>\n<\/div>\n",'tag': " &gt; <a href=\"javascript: \/\/ _('Select {{element}} element')\" \n         class=\"{{baseClass}}-select-element\"\n         title=\"_('Click to select the contents of the '{{element}}' element')\"\n         data-ui-editor-selection=\"{{data}}\">{{element}}<\/a> \n",'unsupported': "<div class=\"{{baseClass}}-unsupported-overlay\"><\/div>\n<div class=\"{{baseClass}}-unsupported-content\">\n    It has been detected that you a using a browser that is not supported by Raptor, please\n    use one of the following browsers:\n\n    <ul>\n        <li><a href=\"http:\/\/www.google.com\/chrome\">Google Chrome<\/a><\/li>\n        <li><a href=\"http:\/\/www.firefox.com\">Mozilla Firefox<\/a><\/li>\n        <li><a href=\"http:\/\/www.google.com\/chromeframe\">Internet Explorer with Chrome Frame<\/a><\/li>\n    <\/ul>\n\n    <div class=\"{{baseClass}}-unsupported-input\">\n        <button class=\"{{baseClass}}-unsupported-close\">Close<\/button>\n        <input name=\"{{baseClass}}-unsupported-show\" type=\"checkbox\" \/>\n        <label>Don't show this message again<\/label>\n    <\/div>\n<div>",'messages': "<div class=\"{{baseClass}}-messages\" \/>\n" },

    /**
     * @param {String} name
     * @returns {String}
     */
    getTemplate: function(name, urlPrefix) {
        var template;
        if (!this.templates[name]) {
            // Parse the URL
            var url = urlPrefix || this.urlPrefix;
            var split = name.split('.');
            if (split.length === 1) {
                // URL is for and editor core template
                url += 'templates/' + split[0] + '.html';
            } else {
                // URL is for a plugin template
                url += 'plugins/' + split[0] + '/templates/' + split.splice(1).join('/') + '.html';
            }

            // Request the template
            $.ajax({
                url: url,
                type: 'GET',
                async: false,
                // <debug/>
                // 15 seconds
                timeout: 15000,
                error: function() {
                    template = null;
                },
                success: function(data) {
                    template = data;
                }
            });
            // Cache the template
            this.templates[name] = template;
        } else {
            template = this.templates[name];
        }
        return template;
    },

    /*========================================================================*\
     * Helpers
    \*========================================================================*/
    /**
     * @returns {String}
     */
    getUniqueId: function() {
        var id = $.ui.editor.defaults.baseClass + '-uid-' + new Date().getTime() + '-' + Math.floor(Math.random() * 100000);
        while ($('#' + id).length) {
            id = $.ui.editor.defaults.baseClass + '-uid-' + new Date().getTime() + '-' + Math.floor(Math.random() * 100000);
        }
        return id;
    },

    /**
     * @returns {boolean}
     */
    isDirty: function() {
        var instances = this.getInstances();
        for (var i = 0; i < instances.length; i++) {
            if (instances[i].isDirty()) return true;
        }
        return false;
    },

    /**
     *
     */
    unloadWarning: function() {
        var instances = this.getInstances();
        for (var i = 0; i < instances.length; i++) {
            if (instances[i].isDirty() &&
                    instances[i].isEditing() &&
                    instances[i].options.unloadWarning) {
                return _('\nThere are unsaved changes on this page. \nIf you navigate away from this page you will lose your unsaved changes');
            }
        }
    },

    /*========================================================================*\
     * Plugins as UI
    \*========================================================================*/

    /**
     * @name $.ui.editor.defaultUi
     * @class The default UI component
     * @property {Object} defaultUi
     */
    defaultUi: /** @lends $.ui.editor.defaultUi.prototype */ {
        ui: null,

        /**
         * The {@link $.ui.editor} instance
         * @type {Object}
         */
        editor: null,

        /**
         * @type {Object}
         */
        options: null,

        /**
         * Initialise & return an instance of this UI component
         * @param  {$.editor} editor  The editor instance
         * @param  {$.ui.editor.defaults} options The default editor options extended with any overrides set at initialisation
         * @return {Object} An instance of the ui component
         */
        init: function(editor, options) {},

        /**
         * @param  {String} key   The key
         * @param  {[String|Object|int|float]} value A value to be stored
         * @return {String|Object|int|float} The stored value
         */
        persist: function(key, value) {
            return this.editor.persist(key, value);
        },

        /**
         * @param  {String}   name
         * @param  {Function} callback
         * @param  {String}   context
         */
        bind: function(name, callback, context) {
            this.editor.bind(name, callback, context || this);
        },

        /**
         * @param  {String}   name
         * @param  {Function} callback
         * @param  {Object}   context
         */
        unbind: function(name, callback, context) {
            this.editor.unbind(name, callback, context || this);
        }
    },

    /**
     *
     * @param {Object|String} mixed
     * @param {Object} [ui]
     */
    registerUi: function(mixed, ui) {
        // Allow array objects, and single plugins
        if (typeof(mixed) === 'string') {
            // <strict/>
            this.ui[mixed] = $.extend({}, this.defaultUi, ui);
        } else {
            for (var name in mixed) {
                this.registerUi(name, mixed[name]);
            }
        }
    },

    /**
     * @name $.ui.editor.defaultPlugin
     * @class The default plugin
     * @property {Object} defaultPlugin
     */
    defaultPlugin: /** @lends $.ui.editor.defaultPlugin.prototype */ {

        /**
         * The {@link $.ui.editor} instance
         * @type {Object}
         */
        editor: null,

        /**
         * @type {Object}
         */
        options: null,

        /**
         * Initialise & return an instance of this plugin
         * @param  {$.editor} editor  The editor instance
         * @param  {$.ui.editor.defaults} options The default editor options extended with any overrides set at initialisation
         * @return {Object} An instance of the ui component
         */
        init: function(editor, options) {},

        /**
         * @param  {String} key   The key
         * @param  {[String|Object|int|float]} value A value to be stored
         * @return {String|Object|int|float} The stored value
         */
        persist: function(key, value) {
            return this.editor.persist(key, value);
        },

        /**
         * @param  {String}   name
         * @param  {Function} callback
         * @param  {String}   context
         */
        bind: function(name, callback, context) {
            this.editor.bind(name, callback, context || this);
        },

        /**
         * @param  {String}   name
         * @param  {Function} callback
         * @param  {Object}   context
         */
        unbind: function(name, callback, context) {
            this.editor.unbind(name, callback, context || this);
        }
    },

    /**
     *
     * @param {Object|String} mixed
     * @param {Object} [plugin]
     */
    registerPlugin: function(mixed, plugin) {
        // Allow array objects, and single plugins
        if (typeof(mixed) === 'string') {
            // <strict/>

            this.plugins[mixed] = $.extend({}, this.defaultPlugin, plugin);
        } else {
            for (var name in mixed) {
                this.registerPlugin(name, mixed[name]);
            }
        }
    },

    /*========================================================================*\
     * Events
    \*========================================================================*/

    /**
     * @param {String} name
     * @param {function} callback
     */
    bind: function(name, callback) {
        if (!this.events[name]) this.events[name] = [];
        this.events[name].push(callback);
    },

    /**
     * @param {function} callback
     */
    unbind: function(callback) {
        $.each(this.events, function(name) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] === callback) {
                    this.events[name].splice(i,1);
                }
            }
        });
    },

    /**
     * @param {String} name
     */
    fire: function(name) {
        // <debug/>
        if (!this.events[name]) return;
        for (var i = 0, l = this.events[name].length; i < l; i++) {
            this.events[name][i].call(this);
        }
    },

    /*========================================================================*\
     * Persistance
    \*========================================================================*/
    /**
     * @param {String} key
     * @param {mixed} value
     * @param {String} namespace
     */
    persist: function(key, value, namespace) {
        key = namespace ? namespace + '.' + key : key;
        if (localStorage) {
            var storage;
            if (localStorage.uiWidgetEditor) {
                storage = JSON.parse(localStorage.uiWidgetEditor);
            } else {
                storage = {};
            }
            if (value === undefined) return storage[key];
            storage[key] = value;
            localStorage.uiWidgetEditor = JSON.stringify(storage);
        }

        return value;
    }

});
var supported, ios;

function isSupported(editor) {
    if (supported === undefined) {
        supported = true;

        // <ios>
        ios = /(iPhone|iPod|iPad).*AppleWebKit/i.test(navigator.userAgent);
        if (ios) {
            $('html').addClass(editor.options.baseClass + '-ios');

            // Fixed position hack
            if (ios) {
                $(document).bind('scroll', function(){
                    setInterval(function() {
                        $('body').css('height', '+=1').css('height', '-=1');
                    }, 0);
                });
            }
        }
        // </ios>

        if ($.browser.mozilla) {
            $('html').addClass(editor.options.baseClass + '-ff');
        }

        // <ie>
        if ($.browser.msie && $.browser.version < 9) {
            supported = false;

            // Create message modal
            var message = $('<div/>')
                .addClass(editor.options.baseClass + '-unsupported')
                .html(editor.getTemplate('unsupported'))
                .appendTo('body');

            elementBringToTop(message);

            // Close event
            message.find('.' + editor.options.baseClass + '-unsupported-close').click(function() {
                message.remove();
            });
        }
        // </ie>
    }
    return supported;
}
/**
 * @fileOverview Text alignment ui components
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */
$.ui.editor.registerUi({

    /**
     * @name $.editor.ui.alignLeft
     * @augments $.ui.editor.defaultUi
     * @class Aligns text left within the selected or nearest block-level element.
     * <br/>
     * Toggles <tt>text-align: left</tt>
     */
    alignLeft: /** @lends $.editor.ui.alignLeft.prototype */ {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor) {
            return editor.uiButton({
                title: _('Left Align'),
                click: function() {
                    selectionToggleBlockStyle({
                        'text-align': 'left'
                    }, editor.getElement());
                }
            });
        }
    },

    /**
     * @name $.editor.ui.alignJustify
     * @augments $.ui.editor.defaultUi
     * @class Justifies text within the selected or nearest block-level element.
     * <br/>
     * Toggles <tt>text-align: justify</tt>
     */
    alignJustify: /** @lends $.editor.ui.alignJustify.prototype */ {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor) {
            return editor.uiButton({
                title: _('Justify'),
                click: function() {
                    selectionToggleBlockStyle({
                        'text-align': 'justify'
                    }, editor.getElement());
                }
            });
        }
    },

    /**
     * @name $.editor.ui.alignCenter
     * @augments $.ui.editor.defaultUi
     * @class Centers text within the selected or nearest block-level element.
     * <br/>
     * Toggles: <tt>text-align: center</tt>
     */
    alignCenter: /** @lends $.editor.ui.alignCenter.prototype */  {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor) {
            return editor.uiButton({
                title: _('Center Align'),
                click: function() {
                    selectionToggleBlockStyle({
                        'text-align': 'center'
                    }, editor.getElement());
                }
            });
        }
    },

    /**
     * @name $.editor.ui.alignRight
     * @augments $.ui.editor.defaultUi
     * @class Aligns text right within the selected or nearest block-level element.
     * <br/>
     * Toggles <tt>text-align: right</tt>
     */
    alignRight: /** @lends $.editor.ui.alignRight.prototype */  {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor) {
            return editor.uiButton({
                title: _('Right Align'),
                click: function() {
                    selectionToggleBlockStyle({
                        'text-align': 'right'
                    }, editor.getElement());
                }
            });
        }
    }
});
/**
 * @fileOverview Basic text styling ui components
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

$.ui.editor.registerUi({

    /**
     * @name $.editor.ui.textBold
     * @augments $.ui.editor.defaultUi
     * @class Wraps (or unwraps) the selection with &lt;strong&gt; tags
     * <br/>
     * Applies either {@link $.ui.editor.defaults.cssPrefix} + 'bold' or a custom class (if present) to the &lt;strong&gt; element
     */
    textBold: /** @lends $.editor.ui.textBold.prototype */ {

        hotkeys: {
            'ctrl+b': {
                'action': function() {
                    this.ui.click();
                }
            }
        },

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor, options) {
            return this.editor.uiButton({
                title: _('Bold'),
                click: function() {
                    selectionToggleWrapper('strong', { classes: options.classes || options.cssPrefix + 'bold' });
                }
            });
        }
    },

    /**
     * @name $.editor.ui.textItalic
     * @augments $.ui.editor.defaultUi
     * @class Wraps (or unwraps) the selection with &lt;em&gt; tags
     * <br/>
     * Applies either {@link $.ui.editor.defaults.cssPrefix} + 'italic' or a custom class (if present) to the &lt;em&gt; element
     */
    textItalic: /** @lends $.editor.ui.textItalic.prototype */ {

        hotkeys: {
            'ctrl+i': {
                'action': function() {
                    this.ui.click();
                }
            }
        },

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor, options) {
            return editor.uiButton({
                title: _('Italic'),
                click: function() {
                    selectionToggleWrapper('em', { classes: options.classes || options.cssPrefix + 'italic' });
                }
            });
        }
    },

    /**
     * @name $.editor.ui.textUnderline
     * @augments $.ui.editor.defaultUi
     * @class Wraps (or unwraps) the selection with &lt;u&gt; tags
     * <br/>
     * Applies either {@link $.ui.editor.defaults.cssPrefix} + 'underline' or a custom class (if present) to the &lt;u&gt; element
     */
    textUnderline: /** @lends $.editor.ui.textUnderline.prototype */ {

        hotkeys: {
            'ctrl+u': {
                'action': function() {
                    this.ui.click();
                }
            }
        },

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor, options) {
            return editor.uiButton({
                title: _('Underline'),
                click: function() {
                    selectionToggleWrapper('u', { classes: options.classes || options.cssPrefix + 'underline' });
                }
            });
        }
    },

    /**
     * @name $.editor.ui.textStrike
     * @augments $.ui.editor.defaultUi
     * @class  Wraps (or unwraps) the selection with &lt;del&gt; tags
     * <br/>
     * Applies either {@link $.ui.editor.defaults.cssPrefix} + 'strike' or a custom class (if present) to the &lt;del&gt; element
     */
    textStrike: /** @lends $.editor.ui.textStrike.prototype */ {

        hotkeys: {
            'ctrl+k': {
                'action': function() {
                    this.ui.click();
                }
            }
        },

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor, options) {
            return editor.uiButton({
                title: _('Strikethrough'),
                click: function() {
                    selectionToggleWrapper('del', { classes: options.classes || options.cssPrefix + 'strike' });
                }
            });
        }
    },

    /**
     * @name $.editor.ui.textSub
     * @augments $.ui.editor.defaultUi
     * @class Wraps (or unwraps) the selection with &lt;sub&gt; tags
     * <br/>
     * Applies either {@link $.ui.editor.defaults.cssPrefix} + 'sub' or a custom class (if present) to the &lt;sub&gt; element
     */
    textSub: /** @lends $.editor.ui.textSub.prototype */ {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor, options) {
            return editor.uiButton({
                title: _('Sub script'),
                click: function() {
                    selectionToggleWrapper('sub', { classes: options.classes || options.cssPrefix + 'sub' });
                }
            });
        }
    },

    /**
     * @name $.editor.ui.textSuper
     * @augments $.ui.editor.defaultUi
     * @class Wraps (or unwraps) the selection with &lt;sup&gt; tags
     * <br/>
     * Applies either {@link $.ui.editor.defaults.cssPrefix} + 'super' or a custom class (if present) to the &lt;sub&gt; element
     */
    textSuper: /** @lends $.editor.ui.textSuper.prototype */ {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor, options) {
            return editor.uiButton({
                title: _('Super script'),
                click: function() {
                    selectionToggleWrapper('sup', { classes: options.classes || options.cssPrefix + 'super' });
                }
            });
        }
    }
});
/**
 * @fileOverview Blockquote ui component
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

 $.ui.editor.registerUi({
   /**
    * @name $.editor.ui.quoteBlock
    * @augments $.ui.editor.defaultUi
    * @class Wraps (or unwraps) selection in &lt;blockquote&gt; tags
    * <br/>
    * Applies either {@link $.ui.editor.defaults.cssPrefix} + 'blockquote' or a custom class (if present) to the &lt;blockquote&gt; element
    */
    quoteBlock: /** @lends $.editor.ui.quoteBlock.prototype */ {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor, options) {
            return editor.uiButton({
                title: _('Blockquote'),
                icon: 'ui-icon-quote',
                click: function() {
                    selectionToggleWrapper('blockquote', { classes: options.classes || options.cssPrefix + 'blockquote' });
                }
            });
        }
    }
});
/**
 * @fileOverview Cancel plugin & ui component
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

 /**
  * @name $.editor.ui.cancel
  * @augments $.ui.editor.defaultUi
  * @class Cancels editing
  */
$.ui.editor.registerUi({
    cancel: /** @lends $.editor.ui.cancel.prototype */ {

        hotkeys: {
            'esc': {
                'action': function() {
                    this.confirm();
                }
            }
        },

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor) {
            return editor.uiButton({
                name: 'cancel',
                title: _('Cancel'),
                icons: { primary: 'ui-icon-cancel' },
                dialog: null,
                click: function() {
                    this.confirm();
                }
            });
        },

        /**
         * If the editor is dirty, inform the user that to cancel editing will discard their unsaved changes.
         * If the user accepts of if the editor is not dirty, cancel editing.
         */
        confirm: function() {
            var plugin = this.editor.getPlugin('cancel');
            var editor = this.editor;
            if (!editor.isDirty()) {
                plugin.cancel();
            } else {
                if (!this.dialog) this.dialog = $(editor.getTemplate('cancel.dialog'));
                this.dialog.dialog({
                    modal: true,
                    resizable: false,
                    title: _('Confirm Cancel Editing'),
                    dialogClass: editor.options.dialogClass + ' ' + editor.options.baseClass,
                    show: editor.options.dialogShowAnimation,
                    hide: editor.options.dialogHideAnimation,
                    buttons: [
                        {
                            text: _('OK'),
                            click: function() {
                                plugin.cancel();
                                $(this).dialog('close');
                            }
                        },
                        {
                            text: _('Cancel'),
                            click: function() {
                                $(this).dialog('close');
                            }
                        }
                    ],
                    open: function() {
                        // Apply custom icons to the dialog buttons
                        var buttons = $(this).parent().find('.ui-dialog-buttonpane');
                        buttons.find('button:eq(0)').button({ icons: { primary: 'ui-icon-circle-check' }});
                        buttons.find('button:eq(1)').button({ icons: { primary: 'ui-icon-circle-close' }});
                    },
                    close: function() {
                        $(this).dialog('destroy').remove();
                    }
                });
            }
        }

    }
});

$.ui.editor.registerPlugin({
  /**
    * @name $.editor.plugin.cancel
    * @augments $.ui.editor.defaultPlugin
    * @class Plugin providing cancel functionality
    */
   cancel: /** @lends $.editor.plugin.cancel.prototype */ {

        /**
         * Cancel editing
         * by resetting the editor's html its pre-intitialisation state, hiding the toolbar and disabling editing on the element
         */
        cancel: function() {
            this.editor.unify(function(editor) {
                editor.fire('cancel');
                editor.resetHtml();
                editor.hideToolbar();
                editor.disableEditing();
                selectionDestroy();
            });
        }
   }
});
/**
 * @fileOverview Clean plugin & ui component
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

 /**
  * @name $.editor.plugin.clean
  * @augments $.ui.editor.defaultPlugin
  * @class Strips empty tags and unwanted attributes from editing element
  */
  $.ui.editor.registerPlugin('clean', /** @lends $.editor.plugin.clean.prototype */ {

    /** @type {Object} Attributes to be stripped, empty tags to be removed & attributes to be removed if empty */
    options: {

        /** @type {Array} Attributes to be completely removed */
        stripAttrs: ['_moz_dirty'],

        /** @type {Object} Attribute contents to be stripped */
        stripAttrContent: {
            type: '_moz'
        },

        /** @type {String[]} Tags to be removed if empty */
        stripEmptyTags: [
            'span', 'h1', 'h2', 'h3', 'h4', 'h5',  'h6',
            'p', 'b', 'i', 'u', 'strong', 'em',
            'big', 'small', 'div'
        ],

        /** @type {String[]} Attributes to be removed if empty */
        stripEmptyAttrs: [
            'class', 'id', 'style'
        ],

        /** @type {Object[]} Tag attributes to remove the domain part of a URL from. */
        stripDomains: [
            {selector: 'a', attributes: ['href']},
            {selector: 'img', attributes: ['src']}
        ]
    },

    /**
     * Binds {@link $.editor.plugin.clean#clean} to the change event
     * @see $.ui.editor.defaultPlugin#init
     */
    init: function(editor, options) {
        editor.bind('change', this.clean, this);
    },

    /**
     * Removes empty tags and unwanted attributes from the element
     */
    clean: function() {
        var i;
        var editor = this.editor;
        for (i = 0; i < this.options.stripAttrs.length; i++) {
            editor.getElement()
                .find('[' + this.options.stripAttrs[i] + ']')
                .removeAttr(this.options.stripAttrs[i]);
        }
        for (i = 0; i < this.options.stripAttrContent.length; i++) {
            editor.getElement()
                .find('[' + i + '="' + this.options.stripAttrs[i] + '"]')
                .removeAttr(this.options.stripAttrs[i]);
        }
        for (i = 0; i < this.options.stripEmptyTags.length; i++) {
            editor.getElement()
                .find(this.options.stripEmptyTags[i])
                .filter(function() {
                    // Do not remove ignored elements. Inserter is responsible for these.
                    if ($(this).hasClass(editor.options.supplementaryClass)) {
                        return false;
                    }
                    // Do not clear selection markers if the editor has it in use
                    if ($(this).hasClass('rangySelectionBoundary') && selectionSaved() === false) {
                        return true;
                    }
                    // Finally, remove empty elements
                    if ($.trim($(this).html()) === '') {
                        return true;
                    }
                })
                .remove();
        }
        for (i = 0; i < this.options.stripEmptyAttrs.length; i++) {
            var attr = this.options.stripEmptyAttrs[i];
            editor.getElement()
                .find('[' + this.options.stripEmptyAttrs[i] + ']')
                .filter(function() {
                    return $.trim($(this).attr(attr)) === '';
                }).removeAttr(this.options.stripEmptyAttrs[i]);
        }

        // Strip domains
        var origin = window.location.protocol + '//' + window.location.host,
            protocolDomain = '//' + window.location.host;
        for (i = 0; i < this.options.stripDomains.length; i++) {
            var def = this.options.stripDomains[i];

            // Clean only elements within the editing element
            this.editor.getElement().find(def.selector).each(function() {
                for (var j = 0; j < def.attributes.length; j++) {
                    var attr = $(this).attr(def.attributes[j]);
                    // Do not continue if there are no attributes
                    if (typeof attr === 'undefined') {
                        continue;
                    }
                    if (attr.indexOf(origin) === 0) {
                        $(this).attr(def.attributes[j], attr.substr(origin.length));
                    } else if (attr.indexOf(protocolDomain) === 0) {
                        $(this).attr(def.attributes[j], attr.substr(protocolDomain.length));
                    }
                }
            });
        }

        // Ensure ul, ol content is wrapped in li's
        this.editor.getElement().find('ul, ol').each(function() {
            $(this).find(' > :not(li)').each(function() {
                if (elementDefaultDisplay($(this).attr('tag'))) {
                    $(this).replaceWith($('<li>' + $(this).html() + '</li>').appendTo('body'));
                } else {
                    $(this).wrap($('<li>'));
                }
            });
        });
    }
});

$.ui.editor.registerUi({
    /**
      * @name $.editor.ui.clean
      * @augments $.ui.editor.defaultUi
      * @class UI component that calls {@link $.editor.plugin.clean#clean} when clicked
      */
    clean: /** @lends $.editor.ui.clean.prototype */ {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor) {
            return editor.uiButton({
                title: _('Remove unnecessary markup from editor content'),
                click: function() {
                    editor.getPlugin('clean').clean();
                }
            });
        }
    }
});
/**
 * @fileOverview
 * @author David Neilsen david@panmedia.co.nz
 */

$.ui.editor.registerUi({

    /**
     * @name $.editor.ui.clearFormatting
     * @augments $.ui.editor.defaultUi
     * @class Removes all formatting (wrapping tags) from the selected text.
     */
    clearFormatting: /** @lends $.editor.ui.clearFormatting.prototype */ {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor, options) {
            return this.editor.uiButton({
                title: _('Clear Formatting'),
                click: function() {
                    var sel = rangy.getSelection();
                    if (sel.rangeCount > 0) {
                        // Create a copy of the selection range to work with
                        var range = sel.getRangeAt(0).cloneRange();

                        // Get the selected content
                        var content = range.extractContents();

                        // Expand the range to the parent if there is no selected content
                        if (fragmentToHtml(content) === '') {
                            editor.expandToParent(range);
                            sel.setSingleRange(range);
                            content = range.extractContents();
                        }

                        content = $('<div/>').append(fragmentToHtml(content)).text();

                        // Get the containing element
                        var parent = range.commonAncestorContainer;
                        while (parent && parent.parentNode != editor.getElement().get(0)) {
                            parent = parent.parentNode;
                        }

                        if (parent) {
                            // Place the end of the range after the paragraph
                            range.setEndAfter(parent);

                            // Extract the contents of the paragraph after the caret into a fragment
                            var contentAfterRangeStart = range.extractContents();

                            // Collapse the range immediately after the paragraph
                            range.collapseAfter(parent);

                            // Insert the content
                            range.insertNode(contentAfterRangeStart);

                            // Move the caret to the insertion point
                            range.collapseAfter(parent);
                            range.insertNode(document.createTextNode(content));
                        } else {
                            range.insertNode(document.createTextNode(content));
                        }
                    }


/**
 * If a entire heading is selected, replace it with a p
 *
 * If part of a heading is selected, remove all inline styles, and disallowed tags from the selection.
 *
 * If content inside a p remove all inline styles, and disallowed tags from the selection.
 *
 * If the selection starts in a heading, then ends in another element, convert all headings to a p.
 *
 */

//                    selectionEachRange(function(range) {
//                        if (range.collapsed) {
//                            // Expand to parent
//                            rangeExpandTo(range, [editor.getElement(), 'p, h1, h2, h3, h4, h5, h6']);
//                        }
//
//                        if (rangeIsWholeElement(range)) {
//
//                        }
//
//                        if (range.endOffset === 0) {
//                            range.setEndBefore(range.endContainer);
//                            console.log(range.endContainer);
//                        }
//                        range.refresh();
//                        console.log(range);
//
////                        console.log(range);
////                        console.log(range.toHtml(), range.toString());
////                        console.log($(range.commonAncestorContainer).html(), $(range.commonAncestorContainer).text());
////                        console.log($(range.toHtml()));
////                        range.splitBoundaries();
////                        console.log(range);
////                        var nodes = range.getNodes([3]);
////                        console.log(nodes);
////                        for (var i = nodes.length - 1; i >= 0; i--) {
////                            console.log(nodes[i]);
////                            console.log($.trim(nodes[i].nodeValue) === '');
////                            //console.log(nodes[i].nodeValue, $.trim(nodes[i].nodeValue));
////                        }
//                        selectionSet(range);
//                    });

                    editor.checkChange();
                }
            });
        }
    }

});
/**
 * @fileOverview Click button to edit plugin.
 * @author Michael Robinson michael@panmedia.co.nz
 * @author David Neilsen david@panmedia.co.nz
 */

$.ui.editor.registerPlugin({

     /**
      * @name $.editor.plugin.clickButtonToEdit
      * @augments $.ui.editor.defaultPlugin
      * @see $.editor.plugin.clickButtonToEdit.options
      * @class Shows a button at the center of an editable block,
      * informing the user that they may click said button to edit the block contents.
      */
    clickButtonToEdit: /** @lends $.editor.plugin.clickButtonToEdit.prototype */ {

        hovering: false,

        buttonClass: null,
        buttonSelector: null,
        button: false,

        /**
         * @name $.editor.plugin.clickButtonToEdit.options
         * @namespace Default click button to edit options.
         * @see $.editor.plugin.clickButtonToEdit
         * @type {Object}
         */
        options: /** @lends $.editor.plugin.clickButtonToEdit.options.prototype */  {
            /**
             * @default
                <pre>{
                    text: true,
                    icons: {
                        primary: 'ui-icon-pencil'
                    }
                }</pre>
             * @type {Object} jQuery UI button options
             */
            button: {
                text: true,
                icons: {
                    primary: 'ui-icon-pencil'
                }
            }
        },

        /**
         * Initialize the click button to edit plugin.
         * @see $.ui.editor.defaultPlugin#init
         * @param  {$.editor} editor The Raptor Editor instance.
         * @param  {$.editor.plugin.clickButtonToEdit.options} options The options object.
         * @return {$.editor.defaultPlugin} A new $.ui.editor.plugin.clickButtonToEdit instance.
         */
        init: function(editor, options) {

            var plugin = this;
            var timeoutId = false;
            this.buttonClass = this.options.baseClass + '-button-element';
            this.buttonSelector = '.' + this.buttonClass;

            /**
             * Show the click to edit button.
             */
            this.show = function() {
                if (editor.isEditing()) return;
                editor.getElement().addClass(options.baseClass + '-highlight');
                editor.getElement().addClass(options.baseClass + '-hover');

                var editButton = plugin.getButton();

                var visibleRect = elementVisibleRect(editor.getElement());
                editButton.css({
                    position: 'absolute',
                    // Calculate offset center for the button
                    top: visibleRect.top + ((visibleRect.height / 2) - ($(editButton).outerHeight() / 2)),
                    left: visibleRect.left + (visibleRect.width / 2) - ($(editButton).outerWidth() / 2)
                });
            };

            /**
             * Hide the click to edit button.
             * @param  {Event} event The event triggering this function.
             */
            this.hide = function(event) {
                var editButton = plugin.getButton();
                if((event &&
                        (event.relatedTarget === editButton.get(0) ||
                         editButton.get(0) === $(event.relatedTarget).parent().get(0)))) {
                    return;
                }
                editor.getElement().removeClass(options.baseClass + '-highlight');
                editor.getElement().removeClass(options.baseClass + '-hover');
                plugin.destroyButton();
            };

            /**
             * Hide the click to edit button and show toolbar.
             */
            this.edit = function() {
                plugin.hide();
                if (!editor.isEditing()) editor.enableEditing();
                if (!editor.isVisible()) editor.showToolbar();
            };

            /**
             * Trigger the $.editor.plugin.clickButtonToEdit#hide function if
             * the user moves the mouse off the too quickly for the element's
             * mouseleave event to fire.
             * @param  {Event} event The event.
             */
            this.buttonOut = function(event) {
                if (event.relatedTarget === plugin.getButton().get(0) ||
                    (event.relatedTarget === editor.getElement().get(0) || $.contains(editor.getElement().get(0), event.relatedTarget))) {
                    return;
                }
                plugin.hide();
            };

            editor.getElement().addClass('ui-editor-click-button-to-edit');

            editor.bind('ready, hide, cancel', function() {
                editor.getElement().bind('mouseenter.' + editor.widgetName, plugin.show);
                editor.getElement().bind('mouseleave.' + editor.widgetName, plugin.hide);
            });

            editor.bind('show', function() {
                plugin.destroyButton();
                editor.getElement().unbind('mouseenter.' + editor.widgetName, plugin.show);
                editor.getElement().unbind('mouseleave.' + editor.widgetName, plugin.hide);
            });
        },

        /**
         * Selects or creates the button and returns it.
         * @return {jQuery} The "click to edit" button.
         */
        getButton: function() {
            if (!$(this.buttonSelector).length) {
                this.button = $(this.editor.getTemplate('clickbuttontoedit.edit-button', this.options))
                    .appendTo('body')
                    .addClass(this.buttonClass);
                this.button.button(this.options.button);
            }

            this.button = $(this.buttonSelector);

            this.button.unbind('click.' + this.editor.widgetName)
                .bind('click.' + this.editor.widgetName, this.edit);
            this.button.unbind('mouseleave.' + this.editor.widgetName)
                .bind('mouseleave.' + this.editor.widgetName, this.buttonOut);

            return this.button;
        },

        /**
         * Destroys the "click to edit button".
         */
        destroyButton: function() {
            if (typeof this.button === 'undefined' || this.button === false) {
                return;
            }
            this.button.button('destroy').remove();
            this.button = false;
        }
    }
});
/**
 * @fileOverview Dock plugin
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * @name $.editor.plugin.dock
 * @augments $.ui.editor.defaultPlugin
 * @see  $.editor.ui.dock
 * @class Allow the user to dock / undock the toolbar from the document body or editing element
 */
$.ui.editor.registerPlugin('dock', /** @lends $.editor.plugin.dock.prototype */ {

    enabled: false,
    docked: false,
    topSpacer: null,
    bottomSpacer: null,

    options: {
        docked: false,
        dockToElement: false,
        dockUnder: false,
        persist: true,
        persistID: null
    },

    /**
     * @see $.ui.editor.defaultPlugin#init
     */
    init: function(editor) {
        this.bind('show', this.show);
        this.bind('resize', this.resize, this);
        this.bind('hide', this.hide);
        this.bind('disabled', this.disable);
        this.bind('cancel', this.cancel);
        this.bind('destroy', this.destroy, this);
    },

    show: function() {
        if (!this.enabled) {
            // When the editor is enabled, if persistent storage or options
            // indicate that the toolbar should be docked, dock the toolbar
            if (this.loadState() || this.options.docked) {
                this.dock();
            }
            this.enabled = true;
        } else if (this.isDocked()) {
            this.showSpacers();
        }
    },

    hide: function() {
        this.hideSpacers();
        this.editor.toolbar
            .css('width', 'auto');
    },

    resize: function() {

        if (!this.editor.toolbar ||
            this.options.dockToElement ||
            !this.editor.toolbar.is(':visible')) {
            return;
        }

        var topSpacer = $('.' + this.options.baseClass + '-top-spacer');
        if (!topSpacer.length) {
            return;
        }

        topSpacer.height(this.editor.toolbar.outerHeight());
    },

    showSpacers: function() {
        if (this.options.dockToElement || !this.editor.toolbar.is(':visible')) {
            return;
        }

        this.topSpacer = $('<div/>')
            .addClass(this.options.baseClass + '-top-spacer')
            .height(this.editor.toolbar.outerHeight())
            .prependTo('body');

        this.bottomSpacer = $('<div/>')
            .addClass(this.options.baseClass + '-bottom-spacer')
            .height(this.editor.path.outerHeight())
            .appendTo('body');

        // Fire resize event to trigger plugins (like unsaved edit warning) to reposition
        this.editor.fire('resize');
    },

    hideSpacers: function() {
        if (this.topSpacer) {
            this.topSpacer.remove();
            this.topSpacer = null;
        }
        if (this.bottomSpacer) {
            this.bottomSpacer.remove();
            this.bottomSpacer = null;
        }

        // Fire resize event to trigger plugins (like unsaved edit warning) to reposition
        this.editor.fire('resize');
    },

    /**
     * Change CSS styles between two values.
     *
     * @param  {Object} to    Map of CSS styles to change to
     * @param  {Object} from  Map of CSS styles to change from
     * @param  {Object} style Map of styles to perform changes within
     * @return {Object} Map of styles that were changed
     */
    swapStyle: function(to, from, style) {
        var result = {};
        for (var name in style) {
            // Apply the style from the 'form' element to the 'to' element
            to.css(name, from.css(name));
            // Save the original style to revert the swap
            result[name] = from.css(name);
            // Apply the reset to the 'from' element'
            from.css(name, style[name]);
        }
        return result;
    },

    /**
     * Set CSS styles to given values.
     *
     * @param  {Object} to    Map of CSS styles to change to
     * @param  {Object} style Map of CSS styles to change within
     */
    revertStyle: function(to, style) {
        for (var name in style) {
            to.css(name, style[name]);
        }
    },

    getDockToElementWrapper: function() {
        var wrapperId = this.options.baseClass + '-docked-to-element-wrapper-' + this.editor.getElement().attr('id');
        wrapper = $('#' + wrapperId);
        if (!wrapper.length) {
            wrapper = $('<div/>')
                .insertBefore(this.editor.getElement())
                .addClass(this.options.baseClass + '-docked-to-element-wrapper')
                .attr('id', wrapperId);
        }
        return wrapper;
    },

    /**
     * Dock the toolbar to the editing element
     */
    dockToElement: function() {
        var plugin = this;

        // <debug/>

        wrapper = this.getDockToElementWrapper();

        this.editor.wrapper
            .appendTo(wrapper);

        this.swapStyle(wrapper, this.editor.getElement(), {
            'display': this.editor.getElement().css('display') || 'block',
            'float': this.editor.getElement().css('float') || 'none',
            'clear': this.editor.getElement().css('clear') || 'none',
            'position': this.editor.getElement().css('position') || 'static',

            /* Margin */
            'margin': this.editor.getElement().css('margin') || 0,
            'margin-left': this.editor.getElement().css('margin-left') || 0,
            'margin-right': this.editor.getElement().css('margin-right') || 0,
            'margin-top': this.editor.getElement().css('margin-top') || 0,
            'margin-bottom': this.editor.getElement().css('margin-bottom') || 0,

            /* Padding */
            'padding': this.editor.getElement().css('padding') || 0,
            'padding-left': this.editor.getElement().css('padding-left') || 0,
            'padding-right': this.editor.getElement().css('padding-right') || 0,
            'padding-top': this.editor.getElement().css('padding-top') || 0,
            'padding-bottom': this.editor.getElement().css('padding-bottom') || 0,

            'outline': this.editor.getElement().css('outline') || 0,
            'width': this.editor.getElement().css('width') || 'auto',
            'border': this.editor.getElement().css('border') || 'none'
        });

        wrapper.css('width', wrapper.width() +
            parseInt(this.editor.getElement().css('padding-left'), 10) +
            parseInt(this.editor.getElement().css('padding-right'), 10));

        this.editor.getElement()
            .appendTo(this.editor.wrapper)
            .addClass(this.options.baseClass + '-docked-element');
    },

    /**
     * Undock toolbar from editing element
     */
    undockFromElement: function() {
        // <debug/>
        this.editor.getElement()
            .insertAfter(this.editor.wrapper)
            .removeClass(this.options.baseClass + '-docked-element');

        this.editor.wrapper
            .appendTo('body')
            .removeClass(this.options.baseClass + '-docked-to-element');

        this.editor.wrapper.css('width', 'auto');
    },

    /**
     * Dock the toolbar to the document body (top of the screen)
     */
    dockToBody: function() {
        // <debug/>

        var top = 0;
        if ($(this.options.dockUnder).length) {
            top = $(this.options.dockUnder).outerHeight();
        }

        this.top = this.editor.toolbarWrapper.css('top');
        this.editor.toolbarWrapper.css('top', top);
        this.editor.wrapper.addClass(this.options.baseClass + '-docked');

        // Position message wrapper below the toolbar
        this.editor.messages.css('top', top + this.editor.toolbar.outerHeight());
    },

    /**
     * Undock toolbar from document body
     */
    undockFromBody: function() {
        // <debug/>

        this.editor.toolbarWrapper.css('top', this.top);
        // Remove the docked class
        this.editor.wrapper.removeClass(this.options.baseClass + '-docked');

        this.hideSpacers();
    },

    /**
     * Dock toolbar to element or body
     */
    dock: function() {
        if (this.docked) return;

        // Save the state of the dock
        this.docked = this.saveState(true);

        if (this.options.dockToElement) {
            this.dockToElement();
        } else {
            this.dockToBody();
        }

        // Change the dock button icon & title
        var button = this.editor.wrapper
            .find('.' + this.options.baseClass + '-button')
            .button({icons: {primary: 'ui-icon-pin-w'}});

        if (button.attr('title')) {
            button.attr('title', this.getTitle());
        } else {
            button.attr('data-title', this.getTitle());
        }

        // Add the header class to the editor toolbar
        this.editor.toolbar.find('.' + this.editor.options.baseClass + '-inner')
            .addClass('ui-widget-header');

        this.showSpacers();
    },

    /**
     * Undock toolbar
     */
    undock: function() {
        if (!this.docked) return;

        // Save the state of the dock
        this.docked = this.destroying ? false : this.saveState(false);

        // Remove the header class from the editor toolbar
        this.editor.toolbar.find('.' + this.editor.options.baseClass + '-inner')
            .removeClass('ui-widget-header');

        // Change the dock button icon & title
        var button = this.editor.wrapper
            .find('.' + this.options.baseClass + '-button')
            .button({icons: {primary: 'ui-icon-pin-s'}});

        if (button.attr('title')) {
            button.attr('title', this.getTitle());
        } else {
            button.attr('data-title', this.getTitle());
        }

        if (this.options.dockToElement) this.undockFromElement();
        else this.undockFromBody();

        // Trigger the editor resize event to adjust other plugin element positions
        this.editor.fire('resize');
    },

    /**
     * @return {Boolean} True if the toolbar is docked to the editing element or document body
     */
    isDocked: function() {
        return this.docked;
    },

    /**
     * @return {String} Title text for the dock ui button, differing depending on docked state
     */
    getTitle: function() {
        return this.isDocked() ? _('Click to detach the toolbar') : _('Click to dock the toolbar');
    },

    saveState: function(state) {
        if (!this.persist) {
            return;
        }
        if (this.persistID) {
            this.persist('docked:' + this.persistID, state);
        } else {
            this.persist('docked', state);
        }
        return state;
    },

    loadState: function() {
        if (!this.persist) {
            return null;
        }
        if (this.persistID) {
            return this.persist('docked:' + this.persistID);
        }
        return this.persist('docked');
    },

    /**
     * Hide the top and bottom spacers when editing is disabled
     */
    disable: function() {
        this.hideSpacers();
    },

    cancel: function() {
        var wrapper = this.getDockToElementWrapper();
        if (wrapper && wrapper.length) {
            wrapper.remove();
        }
    },

    /**
     * Undock the toolbar
     */
    destroy: function() {
        this.destroying = true;
        this.undock();
    }
});

$.ui.editor.registerUi({

    /**
     * @name $.editor.ui.dock
     * @augments $.ui.editor.defaultUi
     * @see  $.editor.plugin.dock
     * @class Interface for the user to dock / undock the toolbar using the {@link $.editor.plugin.dock} plugin
     */
    dock: /** @lends $.editor.ui.dock.prototype */ {

        hotkeys: {
            'ctrl+d': {
                'action': function() {
                    this.ui.click();
                }
            }
        },

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor) {
            return editor.uiButton({
                title: editor.getPlugin('dock').getTitle(),
                icon: editor.getPlugin('dock').isDocked() ? 'ui-icon-pin-w' : 'ui-icon-pin-s',
                click: function() {
                    // Toggle dock on current editor
                    var plugin = editor.getPlugin('dock');

                    if (plugin.isDocked()) plugin.undock();
                    else plugin.dock();

                    // Set (un)docked on all unified editors
                    editor.unify(function(editor) {
                        var plugin = editor.getPlugin('dock');
                        if (plugin.isDocked()) plugin.dock();
                        else plugin.undock();
                    });
                }
            });
        }
    }
});
/**
 * @fileOverview embed UI component
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */
 $.ui.editor.registerUi({

    /**
     * @name $.editor.ui.embed
     * @augments $.ui.editor.defaultUi
     * @class Shows a dialog containing the element's markup, allowing the user to edit the source directly
     */
    embed: /** @lends $.editor.ui.embed.prototype */ {

        /**
         * @type {Object} Reference to the embed dialog. Only one dialog avalible for all editors.
         */
        dialog: null,

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor, options) {
            editor.bind('hide', this.hide, this);
            return editor.uiButton({
                icon: 'ui-icon-youtube',
                title: _('Embed object'),
                click: function() {
                    this.show();
                }
            });
        },

        /**
         * Hide, destroy & remove the embed dialog. Enable the button.
         */
        hide: function() {
            if (this.dialog) $(this.dialog).dialog('destroy').remove();
            this.dialog = null;
            $(this.ui.button).button('option', 'disabled', false);
        },

        /**
         * Show the embed dialog. Disable the button.
         */
        show: function() {
            if (!this.dialog) {
                $(this.ui.button).button('option', 'disabled', true);
                var ui = this;

                selectionSave();

                this.dialog = $(this.editor.getTemplate('embed.dialog'));
                this.dialog.dialog({
                    modal: false,
                    width: 600,
                    height: 400,
                    resizable: true,
                    title: _('Paste Embed Code'),
                    autoOpen: true,
                    dialogClass: ui.options.baseClass + ' ' + ui.options.dialogClass,
                    buttons: [
                        {
                            text: _('Embed Object'),
                            click: function() {
                                selectionRestore();
                                selectionReplace($(this).find('textarea').val());
                                $(this).dialog('close');
                            }
                        },
                        {
                            text: _('Close'),
                            click: function() {
                                ui.hide();
                            }
                        }
                    ],
                    open: function() {
                        var buttons = $(this).parent().find('.ui-dialog-buttonpane');
                        buttons.find('button:eq(0)').button({ icons: { primary: 'ui-icon-circle-check' }});
                        buttons.find('button:eq(1)').button({ icons: { primary: 'ui-icon-circle-close' }});

                        // Create fake jQuery UI tabs (to prevent hash changes)
                        var tabs = $(this).find('.ui-editor-embed-panel-tabs');

                        tabs.find('ul li').click(function() {
                            tabs.find('ul li').removeClass('ui-state-active').removeClass('ui-tabs-selected');
                            $(this).addClass('ui-state-active').addClass('ui-tabs-selected');
                            tabs.children('div').hide().eq($(this).index()).show();
                        });

                        var preview = $(this).find('.ui-editor-embed-preview');
                        $(this).find('textarea').change(function() {
                            $(preview).html($(this).val());
                        });

                    },
                    close: function() {
                        ui.hide();
                    }
                });
            }
        }
    }
});
/**
 * @fileOverview Plugin that wraps naked content.
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * @name $.editor.plugin.emptyElement
 * @augments $.ui.editor.defaultPlugin
 * @class Automatically wraps content inside an editable element with a specified tag if it is empty.
 */
$.ui.editor.registerPlugin('emptyElement', /** @lends $.editor.plugin.emptyElement.prototype */ {

    /**
     * @name $.editor.plugin.emptyElement.options
     * @type {Object}
     * @namespace Default options
     * @see $.editor.plugin.emptyElement
     */
    options: /** @lends $.editor.plugin.emptyElement.options */  {

        /**
         * The tag to wrap bare text nodes with.
         * @type {String}
         */
        tag: '<p/>'
    },

    /**
     * @see $.ui.editor.defaultPlugin#init
     */
    init: function(editor, options) {
        this.bind('change', this.change);
    },

    change: function() {
        var plugin = this;
        this.textNodes(this.editor.getElement()).each(function() {
            $(this).wrap($(plugin.options.tag));
            // Set caret position to the end of the current text node
            selectionSelectEnd(this);
        });
        this.editor.checkChange();
    },

    /**
     * Returns the text nodes of an element (not including child elements), filtering
     * out blank (white space only) nodes.
     *
     * @param {jQuerySelector|jQuery|Element} element
     * @returns {jQuery}
     */
    textNodes: function(element) {
        return $(element).contents().filter(function() {
            return this.nodeType == 3 && $.trim(this.nodeValue).length;
        });
    }

});
/**
 * @fileOverview Float ui components
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

 $.ui.editor.registerUi({

    /**
     * @name $.editor.ui.floatLeft
     * @augments $.ui.editor.defaultUi
     * @class Floats the selected or nearest block-level element left
     * <br/>
     * Toggles <tt>float: left</tt>
     */
    floatLeft: /** @lends $.editor.ui.floatLeft.prototype */ {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor) {
            return editor.uiButton({
                title: _('Float Image Left'),
                click: function() {
                    selectionEachRange(function(range) {
                        $(range.commonAncestorContainer).find('img').css('float', 'left');
                    });
                }
            });
        }
    },

    /**
     * @name $.editor.ui.floatRight
     * @augments $.ui.editor.defaultUi
     * @class Floats the selected or nearest block-level element right
     * <br/>
     * Toggles <tt>float: right</tt>
     */
    floatRight: /** @lends $.editor.ui.floatRight.prototype */ {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor) {
            return editor.uiButton({
                title: _('Float Image Right'),
                click: function() {
                    selectionEachRange(function(range) {
                        $(range.commonAncestorContainer).find('img').css('float', 'right');
                    });
                }
            });
        }
    },

    /**
     * @name $.editor.ui.floatNone
     * @augments $.ui.editor.defaultUi
     * @class Sets float none to the selected or nearest block-level element
     * <br/>
     * Toggles <tt>float: right</tt>
     */
    floatNone: /** @lends $.editor.ui.floatNone.prototype */ {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor) {
            return editor.uiButton({
                title: _('Remove Image Float'),
                click: function() {
                    selectionEachRange(function(range) {
                        $(range.commonAncestorContainer).find('img').css('float', 'none');
                    });
                }
            });
        }
    }
});/**
 * @fileOverview Font size ui components
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

 $.ui.editor.registerUi({

    /**
     * @name $.editor.ui.fontSizeInc
     * @augments $.ui.editor.defaultUi
     * @class Wraps selection with &lt;big&gt; tags or unwraps &lt;small&gt; tags from selection
     */
    fontSizeInc: /** @lends $.editor.ui.fontSizeInc.prototype */ {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor, options) {
            return editor.uiButton({
                title: _('Increase Font Size'),
                click: function() {
                    editor.inverseWrapWithTagClass('big', options.cssPrefix + 'big', 'small', options.cssPrefix + 'small');
                }
            });
        }
    },

    /**
     * @name $.editor.ui.fontSizeDec
     * @augments $.ui.editor.defaultUi
     * @class Wraps selection with &lt;small&gt; tags or unwraps &lt;big&gt; tags from selection
     */
    fontSizeDec: /** @lends $.editor.ui.fontSizeDec.prototype */ {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor, options) {
            return editor.uiButton({
                title: _('Decrease Font Size'),
                click: function() {
                    editor.inverseWrapWithTagClass('small', options.cssPrefix + 'small', 'big', options.cssPrefix + 'big');
                }
            });
        }
    }
});
/**
 * @fileOverview Show guides ui component
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

$.ui.editor.registerUi({

     /**
     * @name $.editor.ui.showGuides
     * @augments $.ui.editor.defaultUi
     * @class Outlines elements contained within the editing element
     */
    showGuides: /** @lends $.editor.ui.showGuides.prototype */ {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor, options) {

            editor.bind('cancel', this.cancel, this);
            editor.bind('destroy', this.cancel, this);

            return editor.uiButton({
                title: _('Show Guides'),
                icon: 'ui-icon-pencil',
                click: function() {
                    editor.getElement().toggleClass(options.baseClass + '-visible');
                }
            });
        },

        cancel: function() {
            this.editor.getElement().removeClass(this.options.baseClass + '-visible');
        }
    }
});
/**
 * @fileOverview History ui components
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

$.ui.editor.registerUi({

    /**
     * @name $.editor.ui.undo
     * @augments $.ui.editor.defaultUi
     * @class Revert most recent change to element content
     */
    undo: /** @lends $.editor.ui.undo.prototype */ {
        options: {
            disabled: true
        },

        hotkeys: {
            'ctrl+z': {
                'action': function() {
                    this.editor.historyBack();
                }
            }
        },

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor) {
            editor.bind('change', this.change, this);

            return editor.uiButton({
                title: _('Step Back'),
                click: function() {
                    editor.historyBack();
                }
            });
        },
        change: function() {
            if (this.editor.present === 0) this.ui.disable();
            else this.ui.enable();
        }
    },

    /**
     * @name $.editor.ui.redo
     * @augments $.ui.editor.defaultUi
     * @class Step forward through the stored history
     */
    redo: /** @lends $.editor.ui.redo.prototype */ {

        options: {
            disabled: true
        },

        hotkeys: {
            'ctrl+shift+z': {
                'action': function() {
                    this.editor.historyForward();
                }
            },
            'ctrl+y': {
                'action': function() {
                    this.editor.historyForward();
                }
            }
        },

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor) {
            editor.bind('change', this.change, this);

            return this.ui = editor.uiButton({
                title: _('Step Forward'),
                click: function() {
                    editor.historyForward();
                }
            });
        },
        change: function() {
            if (this.editor.present === this.editor.history.length - 1) this.ui.disable();
            else this.ui.enable();
        }
    }
});
/**
 * @fileOverview Insert hr ui component
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */
 $.ui.editor.registerUi({

    /**
     * @name $.editor.ui.hr
     * @augments $.ui.editor.defaultUi
     * @class Shows a message at the center of an editable block,
     * informing the user that they may click to edit the block contents
     */
    hr: /** @lends $.editor.ui.hr.prototype */ {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor) {
            return editor.uiButton({
                title: _('Insert Horizontal Rule'),
                click: function() {
                    selectionReplace('<hr/>');
                }
            });
        }
    }
});
/**
 * @fileOverview Internationalization UI component
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */
 $.ui.editor.registerUi({

    /**
     * @name $.editor.ui.i18n
     * @augments $.ui.editor.defaultUi
     * @class Provides a dropdown to allow the user to switch between available localizations
     */
    i18n: /** @lends $.editor.ui.i18n.prototype */ {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor, options) {
            var ui = this;

            var menu = $('<select autocomplete="off" name="i18n"/>');

            for (var key in locales) {
                var option = $('<option value="' + key + '" class="' + key + '"/>');
                option.html(localeNames[key]);

                if (currentLocale === key) {
                    option.attr('selected', 'selected');
                }

                menu.append(option);
            }

            return editor.uiSelectMenu({
                title: _('Change Language'),
                select: menu,
                change: function(value) {
                    setLocale(ui.persist('locale', value));
                }
            });
        }
    }
});
/**
 * @fileOverview German strings file.
 * @author Michael Kessler, michi@netzpiraten.ch, https://mksoft.ch
 */
registerLocale('de', 'Deutsch', {
    "A preview of your embedded object is displayed below.": "Eine Vorschau ihres eingebundenen Objekts wird unterhalb angezeigt.",
    "Added link: {{link}}": "Link hinzugefügt: {{link}}",
    "All changes will be lost!": "Alle Änderungen gehen verloren!",
    "Apply Source": "Quellcode anwenden",
    "Are you sure you want to stop editing?": "Wollen Sie wirklich mit der Bearbeitung aufhören?",
    "Blockquote": "Zitat",
    "Bold": "Fett",
    "Cancel": "Abbrechen",
    "Center Align": "Zentrieren",
    "Change HTML tag of selected element": "HTML Tag des selektierten Elements ändern",
    "Change Language": "Sprache wechseln",
    "Change the color of the selected text.": "Farbe des gewählten Texts ändern.",
    "Check this box to have the file open in a new browser window": "Markieren Sie diese Box um die Datei in einem neuen Browser zu öffnen",
    "Check this box to have the link open in a new browser window": "Markieren Sie diese Box um den Link in einem neuen Browser zu öffnen",
    "Choose a link type:": "Wählen Sie einen Link Typ:",
    "Clear Formatting": "Formatierung löschen",
    "Click to begin editing": "Zum Bearbeiten klicken",
    "Click to detach the toolbar": "Zum Lösen der Werkzeugleiste klicken",
    "Click to dock the toolbar": "Zum Befestigen der Werkzeugleiste klicken",
    "Click to edit the image": "Um das Bild zu bearbeiten klicken",
    "Click to select all editable content": "Um alle bearbeitbaren Elemente zu selektieren klicken",
    "Click to select the contents of the '{{element}}' element": "Um den Inhalt des '{{element}}' Element zu selektieren klicken",
    "Click to view statistics": "Click to view statistics",
    "Close": "Schliessen",
    "Confirm Cancel Editing": "Bearbeitung abbrechen bestätigen",
    "Content Statistics": "Inhaltsstatistik",
    "Content contains more than {{limit}} characters and may be truncated": "Der Inhalt hat mehr als {{limit}} Zeichen und kann gekürzt werden",
    "Content will not be truncated": "Der Inhalt wird nicht gekürzt",
    "Copy the file's URL from your browser's address bar and paste it into the box above": "Kopieren Sie die URL der Datei von der Adressleiste ihres Browser und fügen Sie diese in der Box oberhalb ein",
    "Copy the web address from your browser\'s address bar and paste it into the box above": "Kopieren Sie die URL von der Adressleiste ihres Browser und fügen Sie diese in der Box oberhalb ein",
    "Decrease Font Size": "Schriftgrösse verkleinern",
    "Destroy": "Löschen",
    "Divider": "Trennzeichen",
    "Document or other file": "Dokument oder andere Datei",
    "Edit Link": "Link bearbeiten",
    "Email": "E-Mail",
    "Email address": "E-Mail Adresse",
    "Embed Code": "Quellcode einbinden",
    "Embed Object": "Objekt einbinden",
    "Embed object": "Objekt einbinden",
    "Ensure the file has been uploaded to your website": "Stellen Sie sicher, dass die Datei auf ihre Webseite hochgeladen wurde",
    "Enter email address": "E-Mail Adresse eingeben",
    "Enter subject": "Betreff eingeben",
    "Enter your URL": "Ihre URL eingeben",
    "Failed to save {{failed}} content block(s).": "{{failed}} Inhaltsblöcke konnten nicht gespeichert werden.",
    "Find the page on the web you want to link to": "Finden Sie die Seite im Web welche Sie verlinken wollen",
    "Float Image Left": "Bild nach links stellen",
    "Float Image Right": "Bild nach rechts stellen",
    "Formatted &amp; Cleaned": "Formatiert &amp; Bereinigt",
    "Formatted Unclean": "Formatiert &amp; Unbereinigt",
    "Heading&nbsp;1": "Titel&nbsp;1",
    "Heading&nbsp;2": "Titel&nbsp;2",
    "Heading&nbsp;3": "Titel&nbsp;3",
    "Image height": "Bildhöhe",
    "Image width": "Bildbreite",
    "Increase Font Size": "Schriftgrösse vergrössern",
    "Initializing": "Initialisieren",
    "Insert": "Einfügen",
    "Insert Horizontal Rule": "Horizontale Trennlinie einfügen",
    "Insert Link": "Link einfügen",
    "Insert Snippet": "Schnipsel einfügen",
    "Italic": "Kursiv",
    "Justify": "Bündig",
    "Learn More About the Raptor WYSIWYG Editor": "Erfahren Sie mehr über dem Raptor WYSIWYG Editor",
    "Left Align": "Links ausrichten",
    "Link to a document or other file": "Ein Dokument oder eine Datei verlinken",
    "Link to a page on this or another website": "Eine Seite auf dieser oder einer anderen Webseite verlinken",
    "Link to an email address": "Eine E-Mail Adresse verlinken",
    "Location": "URL",
    "Modify Image Size": "Bildgrösse ändern",
    "N/A": "n.v.",
    "New window": "Neues Fenster",
    "No changes detected to save...": "Keine Änderungen zum Speichern erkannt...",
    "Not sure what to put in the box above?": "Nicht sicher was in die Box oberhalb gehört?",
    "OK": false,
    "Open the uploaded file in your browser": "Öffnen Sie die hochgeladene Datei in ihrem Browser",
    "Ordered List": "Geordnete Liste",
    "Page on this or another website": "Seite auf dieser oder einer anderen Webseite",
    "Paragraph": "Paragraph",
    "Paste Embed Code": "Quellcode einfügen",
    "Paste your embed code into the text area below.": "Fügen Sie ihren Quellcode zum Einbetten des Objektes in das Textfeld unterhalb ein.",
    "Plain Text": "Einfacher Text",
    "Preview": "Vorschau",
    "Raptorize": false,
    "Reinitialise": "Reinitialisieren",
    "Remaining characters before the recommended character limit is reached. Click to view statistics": "Remaining characters before the recommended character limit is reached. Click to view statistics",
    "Remove Image Float": "Bildausrichtung entfernen",
    "Remove Link": "Link entfernen",
    "Remove unnecessary markup from editor content": "Unnötige Markierungselemente im Inhalt entfernen",
    "Resize Image": "Bildgrösse anpassen",
    "Right Align": "Rechts ausrichten",
    "Save": "Speichern",
    "Saved {{saved}} out of {{dirty}} content blocks.": "{{saved}} von {{dirty}} Inhaltsblöcken gespeichert.",
    "Saving changes...": "Änderungen speichern...",
    "Select all editable content": "Alle editierbaren Inhalte auswählen",
    "Select {{element}} element": "{{element}} Element auswählen",
    "Show Guides": "Hilfslinien anzeigen",
    "Source Code": "Quelltext",
    "Step Back": "Schritt zurück",
    "Step Forward": "Schritt vorwärts",
    "Strikethrough": "Durchstreichen",
    "Sub script": "Tiefstellen",
    "Subject (optional)": "Betreff (optional)",
    "Successfully saved {{saved}} content block(s).": "{{saved}} Inhaltsblöcke erfolgreich gespeichert.",
    "Super script": "Hochstellen",
    "The URL does not look well formed": "Die URL scheint nicht gültig zu sein",
    "The email address does not look well formed": "Die E-Mail Adresse scheint nicht gültig zu sein",
    "The image '{{image}}' is too wide for the element being edited.<br/>It will be resized to fit.": "Das Bild '{{image}}' ist zu breit für das gerade editierte Element.<br/>Es wird so geändert, dass es passt.",
    "The url for the file you inserted doesn\'t look well formed": "Die URL der Datei scheint nicht gültig zu sein",
    "The url for the link you inserted doesn\'t look well formed": "Die URL des Links scheint nicht gültig zu sein",
    "This block contains unsaved changes": "Dieser Block enthält ungespeicherte Änderungen",
    "Underline": "Unterstreichen",
    "Unnamed Button": "Knopf ohne Name",
    "Unnamed Select Menu": "Auswahlmenu ohne Name",
    "Unordered List": "Ungeordnete Liste",
    "Update Link": "Link aktualisieren",
    "Updated link: {{link}}": "Link aktualisiert: {{link}}",
    "View / Edit Source": "Quellcode anschauen/editieren",
    "View Source": "Quellcode anschauen",
    "\nThere are unsaved changes on this page. \nIf you navigate away from this page you will lose your unsaved changes": "\nEs gibt ungespeicherte Änderungen auf dieser Seite. \nWenn Sie diese Seite verlassen, werden Sie die ungespeicherten Änderungen verlieren",
    "root": "Grundelement",
    "{{charactersRemaining}} characters over limit": "{{charactersRemaining}} Zeichen über der Limite",
    "{{charactersRemaining}} characters remaining": "{{charactersRemaining}} Zeichen verbleibend",
    "{{characters}} characters": "{{characters}} characters",
    "{{characters}} characters, {{charactersRemaining}} over the recommended limit": "{{characters}} Zeichen, {{charactersRemaining}} über der empfohlenen Limite",
    "{{characters}} characters, {{charactersRemaining}} remaining": "{{characters}} Zeichen, {{charactersRemaining}} verbleibend",
    "{{sentences}} sentences": "{{sentences}} Sätze",
    "{{words}} word": "{{words}} Wort",
    "{{words}} words": "{{words}} Wörter"
});
/**
 * @fileOverview English strings file.
 * @author Raptor, info@raptor-editor.com, http://www.raptor-editor.com/
 */
registerLocale('en', 'English', {
    "A preview of your embedded object is displayed below.": "A preview of your embedded object is displayed below.",
    "Added link: {{link}}": "Added link: {{link}}",
    "All changes will be lost!": "All changes will be lost!",
    "Apply Source": "Apply Source",
    "Are you sure you want to stop editing?": "Are you sure you want to stop editing?",
    "Blockquote": "Blockquote",
    "Bold": "Bold",
    "Cancel": "Cancel",
    "Center Align": "Center Align",
    "Change HTML tag of selected element": "Change HTML tag of selected element",
    "Change Language": "Change Language",
    "Change the color of the selected text.": "Change the color of the selected text.",
    "Check this box to have the file open in a new browser window": "Check this box to have the file open in a new browser window",
    "Check this box to have the link open in a new browser window": "Check this box to have the link open in a new browser window",
    "Choose a link type:": "Choose a link type:",
    "Clear Formatting": "Clear Formatting",
    "Click to begin editing": "Click to begin editing",
    "Click to detach the toolbar": "Click to detach the toolbar",
    "Click to dock the toolbar": "Click to dock the toolbar",
    "Click to edit the image": "Click to edit the image",
    "Click to select all editable content": "Click to select all editable content",
    "Click to select the contents of the '{{element}}' element": "Click to select the contents of the '{{element}}' element",
    "Click to view statistics": "Click to view statistics",
    "Close": "Close",
    "Confirm Cancel Editing": "Confirm Cancel Editing",
    "Content Statistics": "Content Statistics",
    "Content contains more than {{limit}} characters and may be truncated": "Content contains more than {{limit}} characters and may be truncated",
    "Content will not be truncated": "Content will not be truncated",
    "Copy the file's URL from your browser's address bar and paste it into the box above": "Copy the file's URL from your browser's address bar and paste it into the box above",
    "Copy the web address from your browser\'s address bar and paste it into the box above": "Copy the web address from your browser\'s address bar and paste it into the box above",
    "Decrease Font Size": "Decrease Font Size",
    "Destroy": "Destroy",
    "Divider": "Divider",
    "Document or other file": "Document or other file",
    "Edit Link": "Edit Link",
    "Email": "Email",
    "Email address": "Email address",
    "Embed Code": "Embed Code",
    "Embed Object": "Embed Object",
    "Embed object": "Embed object",
    "Ensure the file has been uploaded to your website": "Ensure the file has been uploaded to your website",
    "Enter email address": "Enter email address",
    "Enter subject": "Enter subject",
    "Enter your URL": "Enter your URL",
    "Failed to save {{failed}} content block(s).": "Failed to save {{failed}} content block(s).",
    "Find the page on the web you want to link to": "Find the page on the web you want to link to",
    "Float Image Left": "Float Image Left",
    "Float Image Right": "Float Image Right",
    "Formatted &amp; Cleaned": "Formatted &amp; Cleaned",
    "Formatted Unclean": "Formatted Unclean",
    "Heading&nbsp;1": "Heading&nbsp;1",
    "Heading&nbsp;2": "Heading&nbsp;2",
    "Heading&nbsp;3": "Heading&nbsp;3",
    "Image height": "Image height",
    "Image width": "Image width",
    "Increase Font Size": "Increase Font Size",
    "Initializing": "Initializing",
    "Insert": "Insert",
    "Insert Horizontal Rule": "Insert Horizontal Rule",
    "Insert Link": "Insert Link",
    "Insert Snippet": "Insert Snippet",
    "Italic": "Italic",
    "Justify": "Justify",
    "Learn More About the Raptor WYSIWYG Editor": "Learn More About the Raptor WYSIWYG Editor",
    "Left Align": "Left Align",
    "Link to a document or other file": "Link to a document or other file",
    "Link to a page on this or another website": "Link to a page on this or another website",
    "Link to an email address": "Link to an email address",
    "Location": "Location",
    "Modify Image Size": "Modify Image Size",
    "N/A": "N/A",
    "New window": "New window",
    "No changes detected to save...": "No changes detected to save...",
    "Not sure what to put in the box above?": "Not sure what to put in the box above?",
    "OK": "OK",
    "Open the uploaded file in your browser": "Open the uploaded file in your browser",
    "Ordered List": "Ordered List",
    "Page on this or another website": "Page on this or another website",
    "Paragraph": "Paragraph",
    "Paste Embed Code": "Paste Embed Code",
    "Paste your embed code into the text area below.": "Paste your embed code into the text area below.",
    "Plain Text": "Plain Text",
    "Preview": "Preview",
    "Raptorize": "Raptorize",
    "Reinitialise": "Reinitialise",
    "Remaining characters before the recommended character limit is reached. Click to view statistics": "Remaining characters before the recommended character limit is reached. Click to view statistics",
    "Remove Image Float": "Remove Image Float",
    "Remove Link": "Remove Link",
    "Remove unnecessary markup from editor content": "Remove unnecessary markup from editor content",
    "Resize Image": "Resize Image",
    "Right Align": "Right Align",
    "Save": "Save",
    "Saved {{saved}} out of {{dirty}} content blocks.": "Saved {{saved}} out of {{dirty}} content blocks.",
    "Saving changes...": "Saving changes...",
    "Select all editable content": "Select all editable content",
    "Select {{element}} element": "Select {{element}} element",
    "Show Guides": "Show Guides",
    "Source Code": "Source Code",
    "Step Back": "Step Back",
    "Step Forward": "Step Forward",
    "Strikethrough": "Strikethrough",
    "Sub script": "Sub script",
    "Subject (optional)": "Subject (optional)",
    "Successfully saved {{saved}} content block(s).": "Successfully saved {{saved}} content block(s).",
    "Super script": "Super script",
    "The URL does not look well formed": "The URL does not look well formed",
    "The email address does not look well formed": "The email address does not look well formed",
    "The image '{{image}}' is too wide for the element being edited.<br/>It will be resized to fit.": "The image '{{image}}' is too wide for the element being edited.<br/>It will be resized to fit.",
    "The url for the file you inserted doesn\'t look well formed": "The url for the file you inserted doesn\'t look well formed",
    "The url for the link you inserted doesn\'t look well formed": "The url for the link you inserted doesn\'t look well formed",
    "This block contains unsaved changes": "This block contains unsaved changes",
    "Underline": "Underline",
    "Unnamed Button": "Unnamed Button",
    "Unnamed Select Menu": "Unnamed Select Menu",
    "Unordered List": "Unordered List",
    "Update Link": "Update Link",
    "Updated link: {{link}}": "Updated link: {{link}}",
    "View / Edit Source": "View / Edit Source",
    "View Source": "View Source",
    "\nThere are unsaved changes on this page. \nIf you navigate away from this page you will lose your unsaved changes": "\nThere are unsaved changes on this page. \nIf you navigate away from this page you will lose your unsaved changes",
    "root": "root",
    "{{charactersRemaining}} characters over limit": "{{charactersRemaining}} characters over limit",
    "{{charactersRemaining}} characters remaining": "{{charactersRemaining}} characters remaining",
    "{{characters}} characters": "{{characters}} characters",
    "{{characters}} characters, {{charactersRemaining}} over the recommended limit": "{{characters}} characters, {{charactersRemaining}} over the recommended limit",
    "{{characters}} characters, {{charactersRemaining}} remaining": "{{characters}} characters, {{charactersRemaining}} remaining",
    "{{sentences}} sentences": "{{sentences}} sentences",
    "{{words}} word": "{{words}} word",
    "{{words}} words": "{{words}} words"
});
/**
 * @fileOverview Spanish strings file.
 * @author Francisco Martínez (JnxF), paco.7070@hotmail.com, https://twitter.com/ElJnxF
 */
registerLocale('es', 'Español', {
    "A preview of your embedded object is displayed below.": "A continuación se muestra una vista previa de su objeto incrustado.",
    "Added link: {{link}}": "Enlace añadido: {{link}}",
    "All changes will be lost!": "¡Todos los cambios serán perdidos!",
    "Apply Source": "Aplicar Fuente",
    "Are you sure you want to stop editing?": "¿Está seguro de que desea detener la edición?",
    "Blockquote": "Cita en bloque",
    "Bold": "Negrita",
    "Cancel": "Cancelar",
    "Center Align": "Centrar",
    "Change HTML tag of selected element": "Cambiar la etiqueta HTML del elemento seleccionado",
    "Change Language": "Cambiar Idioma",
    "Change the color of the selected text.": "Change the color of the selected text.",
    "Check this box to have the file open in a new browser window": "Marque esta casilla para que el archivo se abra en una nueva ventana",
    "Check this box to have the link open in a new browser window": "Marque esta casilla para que el enlace se abra en una nueva ventana",
    "Choose a link type:": "Escoja un tipo de enlace:",
    "Clear Formatting": "Limpiar Formato",
    "Click to begin editing": "Haga clic para empezar a editar",
    "Click to detach the toolbar": "Haga clic para desanclar la barra de herramientas",
    "Click to dock the toolbar": "Haga clic para anclar la barra de herramientas",
    "Click to edit the image": "Click to edit the image",
    "Click to select all editable content": "Haga clic para seleccionar todo el contenido editable",
    "Click to select the contents of the '{{element}}' element": "Haga clic para selecionar el contenido del elemento '{{element}}'",
    "Click to view statistics": "Click to view statistics",
    "Close": "Cerrar",
    "Confirm Cancel Editing": "Confirme Cancelar la Edición ",
    "Content Statistics": "Contenidos Estadísticos",
    "Content contains more than {{limit}} characters and may be truncated": "El contenido contiene más de {{limit}} carácteres y debe ser truncado",
    "Content will not be truncated": "El contenido no será truncado",
    "Copy the file's URL from your browser's address bar and paste it into the box above": "Copie la URL de su archivo desde la barra de dirección de su navegador y péguela en la caja superior",
    "Copy the web address from your browser\'s address bar and paste it into the box above": "Copie la dirección web desde la barra de dirección de su navegador y péguela en la caja superior",
    "Decrease Font Size": "Disminuir Tamaño de Fuente",
    "Destroy": "Destruir",
    "Divider": "Divisor",
    "Document or other file": "Documento u otro archivo",
    "Edit Link": "Editar Enlace",
    "Email": "Correo electrónico",
    "Email address": "Dirección de correo electrónico",
    "Embed Code": "Código Incrustado",
    "Embed Object": "Objeto Incrustado",
    "Embed object": "Objeto incrustado",
    "Ensure the file has been uploaded to your website": "Asegúrese de que el archivo ha sido subido a su sitio web",
    "Enter email address": "Introduzca una dirección de correo electrónico",
    "Enter subject": "Introduzca un sujeto",
    "Enter your URL": "Introduzca su URL",
    "Failed to save {{failed}} content block(s).": "Falló al guardar los bloques del cotenido de {{failed}}.",
    "Find the page on the web you want to link to": "Busque la página web a la que desee enlazar",
    "Float Image Left": "Flotar Imagen a la Izquierda",
    "Float Image Right": "Flotar Imagen a la Derecha",
    "Formatted &amp; Cleaned": "Formateado y Limpiado",
    "Formatted Unclean": "Formateado Sucio",
    "Heading&nbsp;1": "Encabezado&nbsp;1",
    "Heading&nbsp;2": "Encabezado&nbsp;2",
    "Heading&nbsp;3": "Encabezado&nbsp;3",
    "Image height": "Altura de imagen",
    "Image width": "Ancho de imagen",
    "Increase Font Size": "Incrementar Tamaño de Fuente",
    "Initializing": "Inicializando",
    "Insert": "Insertar",
    "Insert Horizontal Rule": "Insertar Línea Horizontal",
    "Insert Link": "Insertar Enlace",
    "Insert Snippet": "Insertar Snippet",
    "Italic": "Cursiva",
    "Justify": "Justificar",
    "Learn More About the Raptor WYSIWYG Editor": "Saber más sobre el editor WYSIWYG Raptor",
    "Left Align": "Alinear a la Izquierda",
    "Link to a document or other file": "Enlazar a un documento o a otro archivo",
    "Link to a page on this or another website": "Enlazar a una página en esta u otra página web",
    "Link to an email address": "Enlazar a una dirección de correo electrónico",
    "Location": "Localización",
    "Modify Image Size": "Cambiar Tamaño de Imagen",
    "N/A": false,
    "New window": "Nueva ventana",
    "No changes detected to save...": "No se detectaron cambios para guardar...",
    "Not sure what to put in the box above?": "¿No está seguro de qué poner en la caja anterior?",
    "OK": "Aceptar",
    "Open the uploaded file in your browser": "Abra el archivo cargado en su navegador",
    "Ordered List": "Lista Ordenada",
    "Page on this or another website": "Página en ésta u otra página web",
    "Paragraph": "Párrafo",
    "Paste Embed Code": "Pegar Código Incrustado",
    "Paste your embed code into the text area below.": "Pegue su código incrustado en la caja de texto posterior.",
    "Plain Text": "Texto Llano",
    "Preview": "Previsualizar",
    "Raptorize": "Raptorizar",
    "Reinitialise": "Reinicializar",
    "Remaining characters before the recommended character limit is reached. Click to view statistics": "Remaining characters before the recommended character limit is reached. Click to view statistics",
    "Remove Image Float": "No Flotar Imagen",
    "Remove Link": "Eliminar enlace",
    "Remove unnecessary markup from editor content": "Eliminar marcado innecesario del editor de contenido",
    "Resize Image": "Redimensionar Imagen",
    "Right Align": "Alinear a la Derecha",
    "Save": "Guardar",
    "Saved {{saved}} out of {{dirty}} content blocks.": "Guardados {{saved}} de {{dirty}} bloques de contenido.",
    "Saving changes...": "Guardando cambios...",
    "Select all editable content": "Seleccionar todo el contenido editable",
    "Select {{element}} element": "Seleccionar el elemento {{element}}",
    "Show Guides": "Mostrar Guías",
    "Source Code": "Código Fuente",
    "Step Back": "Deshacer",
    "Step Forward": "Rehacer",
    "Strikethrough": "Tachado",
    "Sub script": "Subíndice",
    "Subject (optional)": "Sujeto (opcional)",
    "Successfully saved {{saved}} content block(s).": "Guardado exitosamente {{saved}} bloque(s) de contenido.",
    "Super script": "Superíndice",
    "The URL does not look well formed": "La URL no parece bien formada",
    "The email address does not look well formed": "El enlace de correo electrónico no parece bien formado",
    "The image '{{image}}' is too wide for the element being edited.<br/>It will be resized to fit.": "The image '{{image}}' is too wide for the element being edited.<br/>It will be resized to fit.",
    "The url for the file you inserted doesn\'t look well formed": "La URL del archivo que ha introducido no parece bien formada",
    "The url for the link you inserted doesn\'t look well formed": "La URL del enlace que ha introducido no parece bien formada",
    "This block contains unsaved changes": "Este bloque tiene cambios sin guardar",
    "Underline": "Subrayar",
    "Unnamed Button": "Botón sin Nombre",
    "Unnamed Select Menu": "Menú de Selección sin Nombre",
    "Unordered List": "Lista Desordenada",
    "Update Link": "Actualizar Enlace",
    "Updated link: {{link}}": "Enlace actualizado: {{link}}",
    "View / Edit Source": "Ver / Editar Código Fuente",
    "View Source": "Ver Código Fuente",
    "\nThere are unsaved changes on this page. \nIf you navigate away from this page you will lose your unsaved changes": "\nHay cambios sin guardar en esta página. \nSi sale de esta página, perderá todos los cambios sin guardar",
    "root": "orígen",
    "{{charactersRemaining}} characters over limit": "{{charactersRemaining}} carácter(es) sobre el límite",
    "{{charactersRemaining}} characters remaining": "Queda(n) {{charactersRemaining}} carácter(es)",
    "{{characters}} characters": "{{characters}} characters",
    "{{characters}} characters, {{charactersRemaining}} over the recommended limit": "{{characters}} carácter(es), {{charactersRemaining}} sobre el límite recomendado",
    "{{characters}} characters, {{charactersRemaining}} remaining": "{{characters}} carácter(es), queda(n) {{charactersRemaining}}",
    "{{sentences}} sentences": "{{sentences}} oraciones",
    "{{words}} word": "{{words}} palabra",
    "{{words}} words": "{{words}} palabras"
});
/**
 * @fileOverview French strings file.
 * @author SebCorbin, seb.corbin@gmail.com, https://github.com/SebCorbin/
 */
registerLocale('fr', 'Français', {
    "A preview of your embedded object is displayed below.": "Un aperçu de votre objet intégré est affiché ci-dessous.",
    "Added link: {{link}}": "Lien ajouté : {{link}}",
    "All changes will be lost!": "Toutes les modifications seront perdues !",
    "Apply Source": "Appliquer la source",
    "Are you sure you want to stop editing?": "Êtes-vous sûr(e) de vouloir arrêter la modification ?",
    "Blockquote": "Citation",
    "Bold": "Gras",
    "Cancel": "Annuler",
    "Center Align": "Aligner au centre",
    "Change HTML tag of selected element": "Modifier la balise HTML de l'élément sélectionné",
    "Change Language": "Changer de langue",
    "Change the color of the selected text.": "Change the color of the selected text.",
    "Check this box to have the file open in a new browser window": "Cochez cette case pour ouvrir le fichier dans une nouvelle fenêtre de navigateur",
    "Check this box to have the link open in a new browser window": "Cochez cette case pour ouvrir le lien dans une nouvelle fenêtre de navigateur",
    "Choose a link type:": "Choisissez un type de lien :",
    "Clear Formatting": "Clear Formatting",
    "Click to begin editing": "Cliquer pour commencer la modification",
    "Click to detach the toolbar": "Cliquer pour détacher la barre d'outils",
    "Click to dock the toolbar": "Cliquer pour ancrer la barre d'outils",
    "Click to edit the image": "Click to edit the image",
    "Click to select all editable content": "Cliquer pour sélectionner tout le contenu modifiable",
    "Click to select the contents of the '{{element}}' element": "Cliquer pour sélectionner le contenu de l'élément '{{element}}'",
    "Click to view statistics": "Click to view statistics",
    "Close": "Fermer",
    "Confirm Cancel Editing": "Confirmer l'annulation des modifications",
    "Content Statistics": "Statistiques de contenu",
    "Content contains more than {{limit}} characters and may be truncated": "Le contenu contient plus de {{limit}} caractères et peut être tronqué",
    "Content will not be truncated": "Le contenu ne sera pas tronqué",
    "Copy the file's URL from your browser's address bar and paste it into the box above": "Copy the file's URL from your browser's address bar and paste it into the box above",
    "Copy the web address from your browser\'s address bar and paste it into the box above": "Copy the web address from your browser\'s address bar and paste it into the box above",
    "Decrease Font Size": "Diminuer la taille de la police",
    "Destroy": "Détruire",
    "Divider": "Div",
    "Document or other file": "Document ou autre fichier",
    "Edit Link": "Modifier le lien",
    "Email": "E-mail",
    "Email address": "Adresse e-mail",
    "Embed Code": "Code intégré",
    "Embed Object": "Intégrer l'objet",
    "Embed object": "Object intégré",
    "Ensure the file has been uploaded to your website": "Vérifiez que le fichier a été transféré vers votre site",
    "Enter email address": "Saisir l'adresse e-mail",
    "Enter subject": "Saisir le sujet",
    "Enter your URL": "Saisir l'URL",
    "Failed to save {{failed}} content block(s).": "Échec d'enregistrement du(des) bloc(s) de contenu {{failed}}.",
    "Find the page on the web you want to link to": "Trouvez la page web que vous voulez lier",
    "Float Image Left": "Float Image Left",
    "Float Image Right": "Float Image Right",
    "Formatted &amp; Cleaned": "Formatté &amp; Nettoyé",
    "Formatted Unclean": "Formatté non nettoyé",
    "Heading&nbsp;1": "Titre&nbsp;1",
    "Heading&nbsp;2": "Titre&nbsp;2",
    "Heading&nbsp;3": "Titre&nbsp;3",
    "Image height": "Image height",
    "Image width": "Image width",
    "Increase Font Size": "Augmenter la taille de la police",
    "Initializing": "Initialisation",
    "Insert": "Insérer",
    "Insert Horizontal Rule": "Insérer une règle horizontale",
    "Insert Link": "Insérer un lien",
    "Insert Snippet": "Insérer un bout de code",
    "Italic": "Italique",
    "Justify": "Justifier",
    "Learn More About the Raptor WYSIWYG Editor": "En savoir plus sur l'éditeur WYSIWYG Raptor",
    "Left Align": "Aligner à gauche",
    "Link to a document or other file": "Lier un document ou un autre fichier",
    "Link to a page on this or another website": "Lier une page ou un autre site",
    "Link to an email address": "Lier une adresse e-mail",
    "Location": "Emplacement",
    "Modify Image Size": "Modify Image Size",
    "N/A": "N/A",
    "New window": "Nouvelle fenêtre",
    "No changes detected to save...": "Aucune modification détectée à enregistrer...",
    "Not sure what to put in the box above?": "Pas sûr(e) de savoir quoi mettre dans le champ ci-dessus ?",
    "OK": "OK",
    "Open the uploaded file in your browser": "Ouvrir le fichier trasnféré dans votre navigateur",
    "Ordered List": "Liste ordonnée",
    "Page on this or another website": "Page sur ce site ou un autre site",
    "Paragraph": "Paragraphe",
    "Paste Embed Code": "Coller le code",
    "Paste your embed code into the text area below.": "Collez votre code intégré dans la zone de texte ci-dessous.",
    "Plain Text": "Texte brut",
    "Preview": "Aperçu",
    "Raptorize": "Raptoriser",
    "Reinitialise": "Réinitialiser",
    "Remaining characters before the recommended character limit is reached. Click to view statistics": "Remaining characters before the recommended character limit is reached. Click to view statistics",
    "Remove Image Float": "Remove Image Float",
    "Remove Link": "Retirer le lien",
    "Remove unnecessary markup from editor content": "Retirer le balisage non nécessaire du contenu de l'éditeur",
    "Resize Image": "Resize Image",
    "Right Align": "Aligner à droite",
    "Save": "Enregistrer",
    "Saved {{saved}} out of {{dirty}} content blocks.": "{{saved}} enregistré sur {{dirty}} blocs de contenu.",
    "Saving changes...": "Enregistrement des modifications...",
    "Select all editable content": "Sélectionner tout le contenu modifiable",
    "Select {{element}} element": "Sélectionner l'élément {{element}}",
    "Show Guides": "Afficher les guides",
    "Source Code": "Code source",
    "Step Back": "En arrière",
    "Step Forward": "En avant",
    "Strikethrough": "Barré",
    "Sub script": "Indice",
    "Subject (optional)": "Sujet (facultatif)",
    "Successfully saved {{saved}} content block(s).": "{{saved}} bloc(s) de contenu enregistré(s) avec succès.",
    "Super script": "Exposant",
    "The URL does not look well formed": "L'URL paraît malformée",
    "The email address does not look well formed": "L'adresse e-mail paraît malformée",
    "The image '{{image}}' is too wide for the element being edited.<br/>It will be resized to fit.": "The image '{{image}}' is too wide for the element being edited.<br/>It will be resized to fit.",
    "The url for the file you inserted doesn\'t look well formed": "The url for the file you inserted doesn\'t look well formed",
    "The url for the link you inserted doesn\'t look well formed": "The url for the link you inserted doesn\'t look well formed",
    "This block contains unsaved changes": "Ce bloc contient des modifications non enregistrées",
    "Underline": "Souligné",
    "Unnamed Button": "Boutton sans nom",
    "Unnamed Select Menu": "Menu de sélection sans nom",
    "Unordered List": "Liste non ordonnée",
    "Update Link": "Mettre à jour le lien",
    "Updated link: {{link}}": "Lien mis à jour : {{link}}",
    "View / Edit Source": "Voir / Modifier la source",
    "View Source": "Voir la source",
    "\nThere are unsaved changes on this page. \nIf you navigate away from this page you will lose your unsaved changes": "\nIl y a des modifications non enregistrées sur cette page. \nSi vous quittez cette page, vous perdrez vos modifications non enregistrées",
    "root": "racine",
    "{{charactersRemaining}} characters over limit": "{{charactersRemaining}} caractères au-dessus de la limite",
    "{{charactersRemaining}} characters remaining": "{{charactersRemaining}} caractères restants",
    "{{characters}} characters": "{{characters}} characters",
    "{{characters}} characters, {{charactersRemaining}} over the recommended limit": "{{characters}} caractères, {{charactersRemaining}} au-dessus de la limite",
    "{{characters}} characters, {{charactersRemaining}} remaining": "{{characters}} caractères, {{charactersRemaining}} restants",
    "{{sentences}} sentences": "{{sentences}} phrases",
    "{{words}} word": "{{words}} mot",
    "{{words}} words": "{{words}} mots"
});
/**
 * @fileOverview Dutch strings file.
 * @author Ruben Vincenten, rubenvincenten@gmail.com, https://github.com/rubenvincenten
 */
registerLocale('nl', 'Nederlands', {
    "A preview of your embedded object is displayed below.": "Een voorbeeldweergave van uw ingenestelde object is hieronder weergeven.",
    "Added link: {{link}}": "Link toegevoegd:: {{link}}",
    "All changes will be lost!": "Alle aanpassingen zullen verloren gaan!",
    "Apply Source": "Broncode toepassen",
    "Are you sure you want to stop editing?": "Weet u zeker dat u wilt stoppen met aanpassen? ",
    "Blockquote": "Blokcitaat",
    "Bold": "Vetgedrukt",
    "Cancel": "Annuleren",
    "Center Align": "Centreren",
    "Change HTML tag of selected element": "Verander type van geselecteerd element",
    "Change Language": "Taal veranderen",
    "Change the color of the selected text.": "Verander de kleur van de geselecteerde tekst.",
    "Check this box to have the file open in a new browser window": "Vink dit aan om het bestand te laten opnenen in een nieuw browser venster",
    "Check this box to have the link open in a new browser window": "Vink dit aan om de link te laten opnenen in een nieuw browser venster",
    "Choose a link type:": "Kies het type link:",
    "Clear Formatting": "Verwijder opmaak",
    "Click to begin editing": "Klik hier voor het beginnen met bewerken",
    "Click to detach the toolbar": "Klik om de werkbalk los te maken",
    "Click to dock the toolbar": "Klik om de werkbalk vast te maken",
    "Click to edit the image": "Klik om de afbeelding te bewerken",
    "Click to select all editable content": "Klik om alle bewerkbare inhoud te selecteren",
    "Click to select the contents of the '{{element}}' element": "Klik om de inhoud te selecteren van het '{{element}}' element",
    "Click to view statistics": "Click to view statistics",
    "Close": "Sluiten",
    "Confirm Cancel Editing": "Bevestig annuleren van bewerken",
    "Content Statistics": "Inhoud Statistieken",
    "Content contains more than {{limit}} characters and may be truncated": "Inhoud bevat meer dan {{limit}} tekens en kan worden ingekort.",
    "Content will not be truncated": "Inhoud wordt niet ingekort",
    "Copy the file's URL from your browser's address bar and paste it into the box above": "Kopieër het internetadres van het bestand uit de adresbalk van uw browser en plak het in het veld hierboven",
    "Copy the web address from your browser\'s address bar and paste it into the box above": "Kopieër het internetadres uit de adresbalk van uw browser en plak het in het veld hierboven",
    "Decrease Font Size": "Groter Lettertype",
    "Destroy": "Verwijder",
    "Divider": "Splitser",
    "Document or other file": "Document of ander bestand",
    "Edit Link": "Link bewerken",
    "Email": "E-mail",
    "Email address": "E-mail adres",
    "Embed Code": "Code Insluiten",
    "Embed Object": "Object Insluiten",
    "Embed object": "Object insluiten",
    "Ensure the file has been uploaded to your website": "Verzeker uzelf ervan dat het bestand op uw website staat",
    "Enter email address": "Voeg het e-mail adres in",
    "Enter subject": "Voeg het onderwerp in",
    "Enter your URL": "Voeg het internetadres in",
    "Failed to save {{failed}} content block(s).": "Kon {{failed}} inhoud blok(ken) niet opslaan.",
    "Find the page on the web you want to link to": "Vind de pagina op het internet waar u naartoe wilt linken",
    "Float Image Left": "Tekst omsluiten rechts van afbeelding",
    "Float Image Right": "Tekst omsluiten links van afbeelding",
    "Formatted &amp; Cleaned": "Geformatteerd &amp; Opgeruimd",
    "Formatted Unclean": "Rommel Opgeruimd",
    "Heading&nbsp;1": "Kopniveau&nbsp;1",
    "Heading&nbsp;2": "Kopniveau&nbsp;2",
    "Heading&nbsp;3": "Kopniveau&nbsp;3",
    "Image height": "Hoogte afbeelding",
    "Image width": "Breedte afbeelding",
    "Increase Font Size": "Kleiner Lettertype",
    "Initializing": "Initialiseren",
    "Insert": "Invoegen",
    "Insert Horizontal Rule": "Horizontale Regel Invoegen",
    "Insert Link": "Link Invoegen",
    "Insert Snippet": "Snippertekst Invoegen",
    "Italic": "Schuingedrukt",
    "Justify": "Uitlijnen aan beide kanten",
    "Learn More About the Raptor WYSIWYG Editor": "Meer leren over Rapor WYSIWYG Editor",
    "Left Align": "Links uitlijnen",
    "Link to a document or other file": "Link naar een document of ander bestand",
    "Link to a page on this or another website": "Link naar een pagina op deze of een andere website",
    "Link to an email address": "Link naar een emailadres",
    "Location": "Locatie",
    "Modify Image Size": "Afbeeldingsgrootte aanpassen",
    "N/A": "n.v.t.",
    "New window": "Nieuw venster",
    "No changes detected to save...": "Er zijn geen aanpassingen om op te slaan...",
    "Not sure what to put in the box above?": "Onzeker over wat er in het veld moet staan hierboven?",
    "OK": false,
    "Open the uploaded file in your browser": "Open het geüploade bestand in uw browser",
    "Ordered List": "Genummerde lijst",
    "Page on this or another website": "Pagina op deze of een andere website",
    "Paragraph": "Alinea",
    "Paste Embed Code": "Plak de insluitcode",
    "Paste your embed code into the text area below.": "Plak de insluitcode in het tekstveld hieronder.",
    "Plain Text": "Tekst zonder opmaak",
    "Preview": "Voorbeeldweergave",
    "Raptorize": false,
    "Reinitialise": "Herinitialiseren",
    "Remaining characters before the recommended character limit is reached. Click to view statistics": "Remaining characters before the recommended character limit is reached. Click to view statistics",
    "Remove Image Float": "Tekst niet omsluiten rondom afbeelding",
    "Remove Link": "Verwijder Link",
    "Remove unnecessary markup from editor content": "Inhoud schoonmaken van overbodige opmaak",
    "Resize Image": "Herschaal Afbeelding",
    "Right Align": "Rechts Uitlijnen",
    "Save": "Opslaan",
    "Saved {{saved}} out of {{dirty}} content blocks.": "{{saved}} van de {{dirty}} inhoudsblokken zijn opgeslagen.",
    "Saving changes...": "Aanpassingen opslaan...",
    "Select all editable content": "Alle aanpasbare inhoud selecteren",
    "Select {{element}} element": "Selecteer {{element}} element",
    "Show Guides": "Rooster Tonen (Onderwatermodus)",
    "Source Code": "Broncode",
    "Step Back": "Herstel",
    "Step Forward": "Opnieuw",
    "Strikethrough": "Doorstrepen",
    "Sub script": "Subscript",
    "Subject (optional)": "Onderwerp (optioneel)",
    "Successfully saved {{saved}} content block(s).": "{{saved}} inhoudsblok(ken) succesvol opgeslagen.",
    "Super script": "Superscript",
    "The URL does not look well formed": "Het lijkt er op dat het internetadres niet correct is",
    "The email address does not look well formed": "Het e-mail adres is incorrect",
    "The image '{{image}}' is too wide for the element being edited.<br/>It will be resized to fit.": "De afbeelding '{{image}}' is te breed voor het element dat wordt bewerkt.<br/>Het wordt geschaald zodat het past.",
    "The url for the file you inserted doesn\'t look well formed": "Het lijkt er op dat het internetadres voor het bestand dat u heeft ingevoegd niet correct is",
    "The url for the link you inserted doesn\'t look well formed": "Het lijkt er op dat het internetadres voor de link die u heeft ingevoegd niet correct is",
    "This block contains unsaved changes": "Dit blok bevat aanpassingen welke niet zijn opgeslagen",
    "Underline": "Onderstrepen",
    "Unnamed Button": "Knop Zonder Naam",
    "Unnamed Select Menu": "Selectiemenu Zonder Naam",
    "Unordered List": "Lijst Van Opsommingstekens",
    "Update Link": "Link Bijwerken",
    "Updated link: {{link}}": "Link bijgewerkt: {{link}}",
    "View / Edit Source": "Broncode Bekijken/Bewerken",
    "View Source": "Broncode Bekijken",
    "\nThere are unsaved changes on this page. \nIf you navigate away from this page you will lose your unsaved changes": "\nEr zijn aanpassingen op deze pagina die niet zijn opgeslagen. \nAls u een andere pagina opnet zult u deze aanpassingen verliezen",
    "root": false,
    "{{charactersRemaining}} characters over limit": "{{charactersRemaining}} karakters over het limiet",
    "{{charactersRemaining}} characters remaining": "{{charactersRemaining}} karakters over",
    "{{characters}} characters": "{{characters}} characters",
    "{{characters}} characters, {{charactersRemaining}} over the recommended limit": "{{characters}} karakters, {{charactersRemaining}} over het aangeraden limiet",
    "{{characters}} characters, {{charactersRemaining}} remaining": "{{characters}} karakters, {{charactersRemaining}} over",
    "{{sentences}} sentences": "{{sentences}} zinnen",
    "{{words}} word": "{{words}} woord",
    "{{words}} words": "{{words}} woorden"
});
/**
 * @fileOverview Simplified Chinese strings file.
 * @author Raptor, info@raptor-editor.com, http://www.raptor-editor.com/
 */
registerLocale('zh-CN', '简体中文', {
    "A preview of your embedded object is displayed below.": "A preview of your embedded object is displayed below.",
    "Added link: {{link}}": "Added link: {{link}}",
    "All changes will be lost!": "All changes will be lost!",
    "Apply Source": "应用源代码",
    "Are you sure you want to stop editing?": "Are you sure you want to stop editing?",
    "Blockquote": "大段引用",
    "Bold": "粗体",
    "Cancel": "取消",
    "Center Align": "中心对齐文本",
    "Change HTML tag of selected element": "Change HTML tag of selected element",
    "Change Language": "改变语言",
    "Change the color of the selected text.": "Change the color of the selected text.",
    "Check this box to have the file open in a new browser window": "Check this box to have the file open in a new browser window",
    "Check this box to have the link open in a new browser window": "Check this box to have the link open in a new browser window",
    "Choose a link type:": "Choose a link type:",
    "Clear Formatting": "Clear Formatting",
    "Click to begin editing": "Click to begin editing",
    "Click to detach the toolbar": "Click to detach the toolbar",
    "Click to dock the toolbar": "Click to dock the toolbar",
    "Click to edit the image": "Click to edit the image",
    "Click to select all editable content": "Click to select all editable content",
    "Click to select the contents of the '{{element}}' element": "Click to select the contents of the '{{element}}' element",
    "Click to view statistics": "Click to view statistics",
    "Close": "Close",
    "Confirm Cancel Editing": "确认取消编辑",
    "Content Statistics": "Content Statistics",
    "Content contains more than {{limit}} characters and may be truncated": "Content contains more than {{limit}} characters and may be truncated",
    "Content will not be truncated": "Content will not be truncated",
    "Copy the file's URL from your browser's address bar and paste it into the box above": "Copy the file's URL from your browser's address bar and paste it into the box above",
    "Copy the web address from your browser\'s address bar and paste it into the box above": "Copy the web address from your browser\'s address bar and paste it into the box above",
    "Decrease Font Size": "Decrease Font Size",
    "Destroy": "Destroy",
    "Divider": "Divider",
    "Document or other file": "Document or other file",
    "Edit Link": "Edit Link",
    "Email": "Email",
    "Email address": "电子邮件",
    "Embed Code": "Embed Code",
    "Embed Object": "Embed Object",
    "Embed object": "Embed object",
    "Ensure the file has been uploaded to your website": "Ensure the file has been uploaded to your website",
    "Enter email address": "Enter email address",
    "Enter subject": "Enter subject",
    "Enter your URL": "Enter your URL",
    "Failed to save {{failed}} content block(s).": "Failed to save {{failed}} content block(s).",
    "Find the page on the web you want to link to": "Find the page on the web you want to link to",
    "Float Image Left": "Float Image Left",
    "Float Image Right": "Float Image Right",
    "Formatted &amp; Cleaned": "Formatted &amp; Cleaned",
    "Formatted Unclean": "Formatted Unclean",
    "Heading&nbsp;1": "Heading&nbsp;1",
    "Heading&nbsp;2": "Heading&nbsp;2",
    "Heading&nbsp;3": "Heading&nbsp;3",
    "Image height": "Image height",
    "Image width": "Image width",
    "Increase Font Size": "Increase Font Size",
    "Initializing": "Initializing",
    "Insert": "Insert",
    "Insert Horizontal Rule": "插入水平线",
    "Insert Link": "Insert Link",
    "Insert Snippet": "Insert Snippet",
    "Italic": "斜体字",
    "Justify": "对齐文字",
    "Learn More About the Raptor WYSIWYG Editor": "Learn More About the Raptor WYSIWYG Editor",
    "Left Align": "左对齐文本",
    "Link to a document or other file": "Link to a document or other file",
    "Link to a page on this or another website": "Link to a page on this or another website",
    "Link to an email address": "Link to an email address",
    "Location": "Location",
    "Modify Image Size": "Modify Image Size",
    "N/A": "N/A",
    "New window": "New window",
    "No changes detected to save...": "No changes detected to save...",
    "Not sure what to put in the box above?": "Not sure what to put in the box above?",
    "OK": "确定",
    "Open the uploaded file in your browser": "Open the uploaded file in your browser",
    "Ordered List": "Ordered List",
    "Page on this or another website": "Page on this or another website",
    "Paragraph": "Paragraph",
    "Paste Embed Code": "Paste Embed Code",
    "Paste your embed code into the text area below.": "Paste your embed code into the text area below.",
    "Plain Text": "Plain Text",
    "Preview": "Preview",
    "Raptorize": "Raptorize",
    "Reinitialise": "Reinitialise",
    "Remaining characters before the recommended character limit is reached. Click to view statistics": "Remaining characters before the recommended character limit is reached. Click to view statistics",
    "Remove Image Float": "Remove Image Float",
    "Remove Link": "Remove Link",
    "Remove unnecessary markup from editor content": "Remove unnecessary markup from editor content",
    "Resize Image": "Resize Image",
    "Right Align": "右对齐文本",
    "Save": "存储",
    "Saved {{saved}} out of {{dirty}} content blocks.": "Saved {{saved}} out of {{dirty}} content blocks.",
    "Saving changes...": "保存更改...",
    "Select all editable content": "Select all editable content",
    "Select {{element}} element": "Select {{element}} element",
    "Show Guides": "纲要",
    "Source Code": "Source Code",
    "Step Back": "Step Back",
    "Step Forward": "Step Forward",
    "Strikethrough": "Strikethrough",
    "Sub script": "Sub script",
    "Subject (optional)": "Subject (optional)",
    "Successfully saved {{saved}} content block(s).": "Successfully saved {{saved}} content block(s).",
    "Super script": "Super script",
    "The URL does not look well formed": "The URL does not look well formed",
    "The email address does not look well formed": "The email address does not look well formed",
    "The image '{{image}}' is too wide for the element being edited.<br/>It will be resized to fit.": "The image '{{image}}' is too wide for the element being edited.<br/>It will be resized to fit.",
    "The url for the file you inserted doesn\'t look well formed": "The url for the file you inserted doesn\'t look well formed",
    "The url for the link you inserted doesn\'t look well formed": "The url for the link you inserted doesn\'t look well formed",
    "This block contains unsaved changes": "This block contains unsaved changes",
    "Underline": "下划线",
    "Unnamed Button": "Unnamed Button",
    "Unnamed Select Menu": "Unnamed Select Menu",
    "Unordered List": "Unordered List",
    "Update Link": "Update Link",
    "Updated link: {{link}}": "Updated link: {{link}}",
    "View / Edit Source": "View / Edit Source",
    "View Source": "View Source",
    "\nThere are unsaved changes on this page. \nIf you navigate away from this page you will lose your unsaved changes": "\nThere are unsaved changes on this page. \nIf you navigate away from this page you will lose your unsaved changes",
    "root": "本",
    "{{charactersRemaining}} characters over limit": "{{charactersRemaining}} characters over limit",
    "{{charactersRemaining}} characters remaining": "{{charactersRemaining}} characters remaining",
    "{{characters}} characters": "{{characters}} characters",
    "{{characters}} characters, {{charactersRemaining}} over the recommended limit": "{{characters}} characters, {{charactersRemaining}} over the recommended limit",
    "{{characters}} characters, {{charactersRemaining}} remaining": "{{characters}} characters, {{charactersRemaining}} remaining",
    "{{sentences}} sentences": "{{sentences}} sentences",
    "{{words}} word": "{{words}} word",
    "{{words}} words": "{{words}} words"
});
/**
 * @name $.editor.plugin.imageResize
 * @augments $.ui.editor.defaultPlugin
 * @class Automatically resize oversized images with CSS and height / width attributes.
 */
$.ui.editor.registerPlugin('imageResize', /** @lends $.editor.plugin.imageResize.prototype */ {

    /**
     * @name $.editor.plugin.imageResize.options
     * @type {Object}
     * @namespace Default options
     * @see $.editor.plugin.imageResize
     */
    options: /** @lends $.editor.plugin.imageResize.options */  {
        allowOversizeImages: false,
        manuallyResizingClass: null,
        resizeButtonClass: null,
        resizingClass: null
    },

    /**
     * @see $.ui.editor.defaultPlugin#init
     */
    init: function(editor, options) {

        this.options = $.extend({}, this.options, {
            manuallyResizingClass: this.options.baseClass + '-manually-resize',
            resizeButtonClass: this.options.baseClass + '-resize-button',
            resizingClass: this.options.baseClass + '-in-progress'
        });

        editor.bind('enabled', this.bind, this);
    },

    /**
     * Bind events
     */
    bind: function() {

        if (!this.options.allowOversizeImages) {
            this.addImageListeners();
            this.editor.bind('change', this.scanForOversizedImages, this);
            this.editor.bind('save', this.save, this);
        }

        this.editor.bind('destroy', this.cancel, this);
        this.editor.bind('cancel', this.cancel, this);

        this.editor.getElement().on('mouseenter.' + this.options.baseClass, 'img', $.proxy(this.imageMouseEnter, this));
        this.editor.getElement().on('mouseleave.' + this.options.baseClass, 'img', $.proxy(this.imageMouseLeave, this));
    },

    /**
     * Remove bindings from editing element.
     */
    unbind: function() {
        if (!this.options.allowOversizeImages) {
            this.removeImageListeners();
            this.editor.unbind('change', this.scanForOversizedImages, this);
        }
        this.editor.getElement().off('mouseenter.' + this.options.baseClass, 'img');
        this.editor.getElement().off('mouseleave.' + this.options.baseClass, 'img');
    },

    /**
     * Add custom image change listeners to editing element's image elements.
     */
    addImageListeners: function() {
        // If the function addEventListener exists, bind our custom image resized event
        this.resized = $.proxy(this.imageResizedByUser, this);
        var plugin = this;
        this.editor.getElement().find('img').each(function(){
            if (this.addEventListener) {
                this.addEventListener('DOMAttrModified', plugin.resized, false);
            }
            if (this.attachEvent) {  // Internet Explorer and Opera
                this.attachEvent('onpropertychange', plugin.resized);
            }
        });
    },

    /**
     * Remove custom image change listeners to editing element's image elements.
     */
    removeImageListeners: function() {
        var plugin = this;
        this.editor.getElement().find('img').each(function(){
            if (this.removeEventListener) {
                this.addEventListener('DOMAttrModified', plugin.resized, false);
            }
            if (this.detachEvent) {
                this.detachEvent('onpropertychange', plugin.resized);
            }
        });
    },

    /**
     * Handler simulating a 'resize' event for image elements
     * @param {Object} event
     */
    imageResizedByUser: function(event) {
        var target = $(event.target);
        if(target.is('img') &&
            target.attr('_moz_resizing') &&
            event.attrName == 'style' &&
            event.newValue.match(/width|height/)) {
            this.editor.fire('change');
        }
    },

    /**
     * Check for oversize images within the editing element
     */
    scanForOversizedImages: function() {
        var element = this.editor.getElement();
        var plugin = this;
        var images = [];
        $(element.find('img')).each(function() {
            // Only resize images automatically if they're too wide
            if (element.width() < $(this).outerWidth()) {
                images.push($(this));
            }
        });

        if (images.length) {
            plugin.resizeOversizedImages(images, element.width());
        }
    },

    /**
     * Proportionately resizes the image, applying width CSS style.
     * @param  {String[]} image The images to be resized
     * @param  {int} maxWidth The editing element's maximum width
     * @param  {int} maxHeight The editing element's maximum height
     */
    resizeOversizedImages: function(images, maxWidth) {

        // Prepare a link to be included in any messages
        var imageLink = $('<a>', {
            href: '',
            target: '_blank'
        });

        for (var i = 0; i < images.length; i++) {

            var image = images[i];
            var width = image.outerWidth();
            var height = image.outerHeight();
            var ratio = Math.min(maxWidth / width);

            width = Math.round(Math.abs(ratio * (width - (image.outerWidth() - image.width()))));

            image.addClass(this.options.resizingClass);

            imageLink = imageLink.html(image.attr('title') || image.attr('src').substr(image.attr('src').lastIndexOf('/') + 1)).
                    attr('href', image.attr('src'));

            // Resize the image with CSS / attributes
            $(image).css({ width: width });

            var plugin = this;
            this.showOversizeWarning(elementOuterHtml($(imageLink)), {
                hide: function() {
                    image.removeClass(plugin.options.resizingClass);
                }
            });
        }
    },

    cancel: function() {
        this.removeClasses();
        this.removeToolsButtons();
        this.unbind();
    },

    /**
     * Remove resizingClass.
     */
    save: function() {
        this.removeClasses(this.options.resizingClass);
        this.removeToolsButtons();
        this.unbind();
    },

    /**
     * Helper method for showing information about an oversized image to the user
     * @param  {anchor} imageLink link to the subject image
     * @param  {map} options options to be passed to editor.showInfo
     */
    showOversizeWarning: function(imageLink, options) {
        this.editor.showInfo(_("The image '{{image}}' is too wide for the element being edited.<br/>It will be resized to fit.", {
            image: imageLink
        }), options);
    },

    /**
     * Remove any temporary classes from the editing element's images.
     * @param  {array} classNames to be removed
     */
    removeClasses: function(classNames) {
        if (!classNames) classNames = [this.options.resizingClass, this.options.manuallyResizingClass];
        if (!$.isArray(classNames)) classNames = [classNames];
        for (var i = 0; i < classNames.length; i++) {
            this.editor.getElement().find('img.' + classNames[i]).removeClass(classNames[i]);
        }
    },

    /**
     * Display a dialog containing width / height text inputs allowing the user to manually resize the selected image.
     */
    manuallyResizeImage: function(event) {
        this.removeToolsButtons();
        var image = this.editor.getElement().find('img.' + this.options.manuallyResizingClass);
        var originalWidth = $(image).innerWidth(),
            originalHeight = $(image).innerHeight(),
            widthInputSelector = '#' + this.options.baseClass + '-width',
            heightInputSelector = '#' + this.options.baseClass + '-height',
            plugin = this;

        var updateImageSize = function(width) {
            width = Math.round((width || $(widthInputSelector).val())) + 'px';
            $(image).css({ width: width });
        };

        var dialog = $(this.editor.getTemplate('imageresize.manually-resize-image', {
            width: originalWidth,
            height: originalHeight,
            baseClass: this.options.baseClass
        }));

        dialog.dialog({
            modal: true,
            resizable: false,
            title: _('Modify Image Size'),
            autoOpen: true,
            buttons: [
                {
                    text: _('Resize Image'),
                    click: function() {
                        updateImageSize($(this).find(widthInputSelector).val());
                        $(this).dialog('close');
                    }
                },
                {
                    text: _('Cancel'),
                    click: function() {
                        updateImageSize(originalWidth);
                        $(this).dialog('close');
                    }
                }
            ],
            close: function() {
                plugin.editor.checkChange();
                $(dialog).remove();
            },
            open: function() {
                var widthInput = $(this).find(widthInputSelector);
                var heightInput = $(this).find(heightInputSelector);
                widthInput.keyup(function() {
                    heightInput.val(Math.round(Math.abs((originalHeight / originalWidth) * $(this).val())));
                    updateImageSize();
                });
                heightInput.keyup(function() {
                    widthInput.val(Math.round(Math.abs((originalWidth / originalHeight) * $(this).val())));
                    updateImageSize();
                });
            }
        });

        event.preventDefault();
        return false;
    },

    /**
     * Create & display a 'tools' button in the top right corner of the image.
     * @param  {jQuery|Element} image The image element to display the button relative to.
     */
    displayToolsButtonRelativeToImage: function(image) {

        var resizeButton = $('<button>' + _('Click to edit the image') + '</button>')
            .appendTo('body')
            .addClass(this.options.resizeButtonClass)
            .button({
                text: false,
                icons: {
                    primary: 'ui-icon-tools'
                }
            });

        resizeButton.css({
                position: 'absolute',
                left: ($(image).position().left + $(image).innerWidth() - $(resizeButton).outerWidth() - 10) + 'px',
                top: ($(image).position().top + 10) + 'px'
            })
            .attr('contenteditable', false)
            .click($.proxy(this.manuallyResizeImage, this));

        resizeButton.addClass(this.editor.options.supplementaryClass)
            .find('span').addClass(this.editor.options.supplementaryClass);

        $(image).before(resizeButton);
    },

    /**
     * Remove any tools buttons inside the editing element.
     */
    removeToolsButtons: function() {
        this.editor.getElement().find('.' + this.options.resizeButtonClass).each(function() {
            $(this).remove();
        });
    },

    /**
     * Handle the mouse enter event.
     * @param  {Event} event The event.
     */
    imageMouseEnter: function(event) {
        $(event.target).addClass(this.options.manuallyResizingClass);
        this.displayToolsButtonRelativeToImage(event.target);
    },

    /**
     * Handle the mouse leave event. If the mouse has left but the related target is a resize button,
     * do not remove the button or the manually resizing class from the image.
     * @param  {Event} event The event.
     */
    imageMouseLeave: function(event) {
        if (!$(event.relatedTarget).hasClass(this.options.resizeButtonClass)) {
            $(event.target).removeClass(this.options.manuallyResizingClass);
            this.removeToolsButtons();
        }
    }
});
/**
 * @fileOverview Link insertion plugin & ui component
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * @name $.editor.plugin.link
 * @augments $.ui.editor.defaultPlugin
 * @see  $.editor.ui.link
 * @see  $.editor.ui.unlink
 * @class Allow the user to wrap the selection with a link or insert a new link
 */
 $.ui.editor.registerPlugin('link', /** @lends $.editor.plugin.link.prototype */ {
    visible: null,
    dialog: null,
    types: {},

    /**
     * Array of default link types
     * @type {Array}
     */
    defaultLinkTypes: [

        /**
         * @name $.editor.plugin.link.defaultLinkTypes.page
         * @class
         * @extends $.editor.plugin.link.baseLinkType
         */
        /** @lends $.editor.plugin.link.defaultLinkTypes.page.prototype */ {

            /**
             * @see $.editor.plugin.link.baseLinkType#type
             */
            type: 'external',

            /**
             * @see $.editor.plugin.link.baseLinkType#title
             */
            title: _('Page on this or another website'),

            /**
             * @see $.editor.plugin.link.baseLinkType#focusSelector
             */
            focusSelector: 'input[name="location"]',

            /**
             * @see $.editor.plugin.link.baseLinkType#init
             */
            init: function() {
                this.content = this.plugin.editor.getTemplate('link.external', this.options);
                return this;
            },

            /**
             * @see $.editor.plugin.link.baseLinkType#show
             */
            show: function(panel, edit) {

                var link = this;
                panel.find('input[name="location"]').bind('keyup', function(){
                    link.validate(panel);
                });

                if (edit) {
                    panel.find('input[name="location"]').val(this.plugin.selectedElement.attr('href')).
                        trigger('keyup');

                    if (this.plugin.selectedElement.attr('target') === '_blank') {
                        panel.find('input[name="blank"]').attr('checked', 'checked');
                    }

                }

                return this;
            },

            /**
             * @see $.editor.plugin.link.baseLinkType#attributes
             */
            attributes: function(panel) {
                var attributes = {
                    href: panel.find('input[name="location"]').val()
                };

                if (panel.find('input[name="blank"]').is(':checked')) attributes.target = '_blank';

                if (!this.options.regexLink.test(attributes.href)) {
                    this.plugin.editor.showWarning(_('The url for the link you inserted doesn\'t look well formed'));
                }

                return attributes;
            },

            /**
             * @return {Boolean} True if the link is valid
             */
            validate: function(panel) {

                var href = panel.find('input[name="location"]').val();
                var errorMessageSelector = '.' + this.options.baseClass + '-error-message-url';
                var isValid = true;

                if (!this.options.regexLink.test(href)) {
                    if (!panel.find(errorMessageSelector).size()) {
                        panel.find('input[name="location"]').after(this.plugin.editor.getTemplate('link.error', $.extend({}, this.options, {
                            messageClass: this.options.baseClass + '-error-message-url',
                            message: _('The URL does not look well formed')
                        })));
                    }
                    panel.find(errorMessageSelector).not(':visible').show();
                    isValid = false;
                } else {
                    panel.find(errorMessageSelector).has(':visible').hide();
                }

                return isValid;
            }
        },

        /**
         * @name $.editor.plugin.link.defaultLinkTypes.email
         * @class
         * @extends $.editor.plugin.link.baseLinkType
         */
        /** @lends $.editor.plugin.link.defaultLinkTypes.email.prototype */  {

            /**
             * @see $.editor.plugin.link.baseLinkType#type
             */
            type: 'email',

            /**
             * @see $.editor.plugin.link.baseLinkType#title
             */
            title: _('Email address'),

            /**
             * @see $.editor.plugin.link.baseLinkType#focusSelector
             */
            focusSelector: 'input[name="email"]',

            /**
             * @see $.editor.plugin.link.baseLinkType#init
             */
            init: function() {
                this.content = this.plugin.editor.getTemplate('link.email', this.options);
                return this;
            },

            /**
             * @see $.editor.plugin.link.baseLinkType#show
             */
            show: function(panel, edit) {

                var email = this;
                panel.find('input[name="email"]').bind('keyup', function(){
                    email.validate(panel);
                });

                if (edit) {
                    panel.find('input[name="email"]').val(this.plugin.selectedElement.attr('href').replace(/(mailto:)|(\?Subject.*)/gi, '')).
                        trigger('keyup');
                    if (/\?Subject\=/i.test(this.plugin.selectedElement.attr('href'))) {
                        panel.find('input[name="subject"]').val(decodeURIComponent(this.plugin.selectedElement.attr('href').replace(/(.*\?Subject=)/i, '')));
                    }
                }

                return this;
            },

            /**
             * @see $.editor.plugin.link.baseLinkType#attributes
             */
            attributes: function(panel) {
                var attributes = {
                    href: 'mailto:' + panel.find('input[name="email"]').val()
                }, subject = panel.find('input[name="subject"]').val();

                if (subject) attributes.href = attributes.href + '?Subject=' + encodeURIComponent(subject);

                return attributes;
            },

            /**
             * @return {Boolean} True if the link is valid
             */
            validate: function(panel) {

                var email = panel.find('input[name="email"]').val();
                var errorMessageSelector = '.' + this.options.baseClass + '-error-message-email';
                var isValid = true;
                if (!this.options.regexEmail.test(email)) {
                    if (!panel.find(errorMessageSelector).size()) {
                        panel.find('input[name="email"]').after(this.plugin.editor.getTemplate('link.error', $.extend({}, this.options, {
                            messageClass: this.options.baseClass + '-error-message-email',
                            message: _('The email address does not look well formed')
                        })));
                    }
                    panel.find(errorMessageSelector).not(':visible').show();
                    isValid = false;
                } else {
                    panel.find(errorMessageSelector).has(':visible').hide();
                }

                return isValid;
            }
        },

        /**
         * @name $.editor.plugin.link.defaultLinkTypes.fileUrl
         * @class
         * @extends $.editor.plugin.link.baseLinkType
         */
        /** @lends $.editor.plugin.link.defaultLinkTypes.fileUrl.prototype */ {

            /**
             * @see $.editor.plugin.link.baseLinkType#type
             */
            type: 'fileUrl',

            /**
             * @see $.editor.plugin.link.baseLinkType#title
             */
            title: _('Document or other file'),

            /**
             * @see $.editor.plugin.link.baseLinkType#focusSelector
             */
            focusSelector: 'input[name="location"]',

            /**
             * @see $.editor.plugin.link.baseLinkType#init
             */
            init: function() {
                this.content = this.plugin.editor.getTemplate('link.file-url', this.options);
                return this;
            },

            /**
             * @see $.editor.plugin.link.baseLinkType#show
             */
            show: function(panel, edit) {

                var link = this;
                panel.find('input[name="location"]').bind('keyup', function(){
                    link.validate(panel);
                });

                if (edit) {
                    panel.find('input[name="location"]').val(this.plugin.selectedElement.attr('href')).
                        trigger('click');
                    if (this.plugin.selectedElement.attr('target') === '_blank') {
                        panel.find('input[name="blank"]').attr('checked', 'checked');
                    }
                }

                return this;
            },

            /**
             * @see $.editor.plugin.link.baseLinkType#attributes
             */
            attributes: function(panel) {
                var attributes = {
                    href: panel.find('input[name="location"]').val()
                };

                if (panel.find('input[name="blank"]').is(':checked')) attributes.target = '_blank';

                if (!this.options.regexLink.test(attributes.href)) {
                    this.plugin.editor.showWarning(_('The url for the file you inserted doesn\'t look well formed'));
                }

                return attributes;
            },

            /**
             * @return {Boolean} True if the link is valid
             */
            validate: function(panel) {

                var href = panel.find('input[name="location"]').val();
                var errorMessageSelector = '.' + this.options.baseClass + '-error-message-file-url';
                var isValid = true;

                if (!this.options.regexLink.test(href)) {
                    if (!panel.find(errorMessageSelector).size()) {
                        panel.find('input[name="location"]').after(this.plugin.editor.getTemplate('link.error', $.extend({}, this.options, {
                            messageClass: this.options.baseClass + '-error-message-file-url',
                            message: _('The URL does not look well formed')
                        })));
                    }
                    panel.find(errorMessageSelector).not(':visible').show();
                    isValid = false;
                } else {
                    panel.find(errorMessageSelector).has(':visible').hide();
                }

                return isValid;
            }
        }

    ],

    /**
     * @see $.ui.editor.defaultPlugin#init
     */
    init: function(editor, options) {

        this.options = $.extend({}, {
            panelAnimation: 'fade',
            replaceTypes: false,
            customTypes: [],
            typeDataName: 'uiWidgetEditorLinkType',
            dialogWidth: 750,
            dialogHeight: 'auto',
            dialogMinWidth: 670,
            regexLink: /^(http|https|ftp):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i,
            regexEmail: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        }, options);

        editor.bind('save', this.repairLinks, this);
        editor.bind('cancel', this.cancel, this);
    },

    /**
     * Initialise the link types
     * @param  {Boolean} edit True if the user is editing an existing anchor
     */
    initTypes: function(edit) {

        this.types = {};

        /**
         * @name $.editor.plugin.link.baseLinkType
         * @class Default {@link $.editor.plugin.link} type
         * @see $.editor.plugin.link
         */
        var baseLinkType = /** @lends $.editor.plugin.link.baseLinkType.prototype */ {

            /**
             * Name of the link type
             * @type {String}
             */
            type: null,

            /**
             * Title of the link type.
             * Used in the link panel's radio button
             */
            title: null,

            /**
             * Content intended for use in the {@link $.editor.plugin.link} dialog's panel
             */
            content: null,

            /**
             * Reference to the instance of {@link $.editor.plugin.link}
             */
            plugin: this,

            /**
             * Reference to {@link $.editor.plugin.link#options}
             */
            options: this.options,

            /**
             * Function returning the attributes to be applied to the selection
             */
            attributes: function() {},

            /**
             * Initialise the link type
             */
            init: function() {
                return this;
            },

            /**
             * Any actions (binding, population of inputs) required before the {@link $.editor.plugin.link} dialog's panel for this link type is made visible
             */
            show: function() {},

            /**
             * Function determining whether this link type's radio button should be selected
             * @param  {Object} link The selected element
             * @return {Boolean} True if the selection represents a link of this type
             */
            editing: function(link) {
                if (link.attr('class')) {
                    var classes = this.classes.split(/\s/gi);
                    for (var i = 0; i < classes.length; i++) {
                        if (classes[i].trim() && $(link).hasClass(classes[i])) {
                            return true;
                        }
                    }
                }
                return false;
            },

            /**
             * CSS selector for the input that the {@link $.editor.plugin.link.baseLinkType.focus} function should use
             * @type {String}
             */
            focusSelector: null,

            /**
             * Any actions required after this link type's content is made visible
             * @private
             */
            focus: function() {
                if (this.focusSelector) {
                    var input = $(this.focusSelector);
                    var value = input.val();
                    input.val('');
                    input.focus().val(value);
                }
            }
        };

        var linkTypes = null;

        if (this.options.replaceTypes) linkTypes = this.options.customTypes;
        else linkTypes = $.merge(this.defaultLinkTypes, this.options.customTypes);

        var link;
        for (var i = 0; i < linkTypes.length; i++) {
            link = $.extend({}, baseLinkType, linkTypes[i], { classes: this.options.baseClass + '-' + linkTypes[i].type }).init();
            this.types[link.type] = link;
        }
    },

    /**
     * Show the link control dialog
     */
    show: function() {
        if (!this.visible) {

            selectionSave();

            this.selectedElement = selectionGetElements().first();
            var edit = this.selectedElement.is('a');
            var options = this.options;
            var plugin = this;

            this.dialog = $(this.editor.getTemplate('link.dialog', options)).appendTo('body');

            var dialog = this.dialog;

            this.initTypes();

            // Add link type radio buttons
            var linkTypesFieldset = this.dialog.find('fieldset');
            for (var type in this.types) {
                $(this.editor.getTemplate('link.label', this.types[type])).appendTo(linkTypesFieldset);
            }

            linkTypesFieldset.find('input[type="radio"]').bind('change.' + this.editor.widgetName, function(){
                plugin.typeChange(plugin.types[$(this).val()], edit);
            });

            dialog.dialog({
                autoOpen: false,
                modal: true,
                resizable: true,
                width: options.dialogWidth,
                minWidth: options.dialogMinWidth,
                height: options.dialogHeight,
                title: edit ? _('Edit Link') : _('Insert Link'),
                dialogClass: options.baseClass + ' ' + options.dialogClass,
                buttons: [
                    {
                        text: edit ? _('Update Link') : _('Insert Link'),
                        click: function() {
                            selectionRestore();
                            if (plugin.apply(edit)) {
                                $(this).dialog('close');
                            }
                        }
                    },
                    {
                        text: _('Cancel'),
                        click: function() {
                            $(this).dialog('close');
                        }
                    }
                ],
                beforeopen: function() {
                    plugin.dialog.find('.' + plugin.options.baseClass + '-content').hide();
                },
                open: function() {
                    plugin.visible = true;

                    // Apply custom icons to the dialog buttons
                    var buttons = dialog.parent().find('.ui-dialog-buttonpane');
                    buttons.find('button:eq(0)').button({ icons: { primary: 'ui-icon-circle-check' }});
                    buttons.find('button:eq(1)').button({ icons: { primary: 'ui-icon-circle-close' }});

                    var radios = dialog.find('.ui-editor-link-menu input[type="radio"]');
                    radios.first().attr('checked', 'checked');

                    var changedType = false;
                    if (edit) {
                        for(var type in plugin.types) {
                            if (changedType = plugin.types[type].editing(plugin.selectedElement)) {
                                radios.filter('[value="' + type + '"]').attr('checked', 'checked');
                                plugin.typeChange(plugin.types[type], edit);
                                break;
                            }
                        }
                    }

                    if (!edit || edit && !changedType) {
                        plugin.typeChange(plugin.types[radios.filter(':checked').val()], edit);
                    }

                    // Bind keyup to dialog so we can detect when user presses enter
                    $(this).unbind('keyup.' + plugin.editor.widgetName).bind('keyup.' + plugin.editor.widgetName, function(event) {
                        if (event.keyCode == 13) {
                            // Check for and trigger validation - only allow enter to trigger insert if validation not present or successful
                            var linkType = plugin.types[radios.filter(':checked').val()];
                            if (!$.isFunction(linkType.validate) || linkType.validate(plugin.dialog.find('.' + plugin.options.baseClass + '-content'))) {
                                buttons.find('button:eq(0)').trigger('click');
                            }
                        }
                    });
                },
                close: function() {
                    selectionRestore();
                    plugin.visible = false;
                    dialog.find('.' + options.baseClass + '-content').hide();
                    $(this).dialog('destroy');
                }
            }).dialog('open');
        }
    },

    /**
     * Apply the link attributes to the selection
     * @param  {Boolean} edit True if this is an edit
     * @return {Boolean} True if the application was successful
     */
    apply: function(edit) {
        var linkType = this.types[this.dialog.find('input[type="radio"]:checked').val()];

        var attributes = linkType.attributes(this.dialog.find('.' + this.options.baseClass + '-content'), edit);

        // No attributes to apply
        if (!attributes) {
            return true;
        }

        selectionRestore();

        // Prepare link to be shown in any confirm message
        var link = elementOuterHtml($('<a>' + (attributes.title ? attributes.title : attributes.href) + '</a>').
                attr($.extend({}, attributes, { target: '_blank' })));

        if (!edit) {
            selectionWrapTagWithAttribute('a', $.extend(attributes, { id: this.editor.getUniqueId() }), linkType.classes);
            this.editor.showConfirm(_('Added link: {{link}}', { link: link }));
            this.selectedElement = $('#' + attributes.id).removeAttr('id');
        } else {
            // Remove all link type classes
            this.selectedElement[0].className = this.selectedElement[0].className.replace(new RegExp(this.options.baseClass + '-[a-zA-Z]+','g'), '');
            this.selectedElement.addClass(linkType.classes)
                    .attr(attributes);
            this.editor.showConfirm(_('Updated link: {{link}}', { link: link }));
        }

        this.selectedElement.data(this.options.baseClass + '-href', attributes.href);

        selectionSelectOuter(this.selectedElement);
        selectionSave();

        return true;
    },

    /**
     * Update the link control panel's content depending on which radio button is selected
     * @param  {Boolean} edit    True if the user is editing a link
     */
    typeChange: function(linkType, edit) {
        var panel = this.dialog.find('.' + this.options.baseClass + '-content');
        var wrap = panel.closest('.' + this.options.baseClass + '-wrap');
        var ajax = linkType.ajaxUri && !this.types[linkType.type].content;

        if (ajax) wrap.addClass(this.options.baseClass + '-loading');

        var plugin = this;

        panel.hide(this.options.panelAnimation, function(){
            if (!ajax) {
                panel.html(linkType.content);
                linkType.show(panel, edit);
                panel.show(plugin.options.panelAnimation, $.proxy(linkType.focus, linkType));
            } else {
                $.ajax({
                    url: linkType.ajaxUri,
                    type: 'get',
                    success: function(data) {
                        panel.html(data);
                        plugin.types[linkType.type].content = data;
                        wrap.removeClass(plugin.options.baseClass + '-loading');
                        linkType.show(panel, edit);
                        panel.show(plugin.options.panelAnimation, $.proxy(linkType.focus, linkType));
                    }
                });
            }
        });
    },

    /**
     * Remove the link tags from the selection. Expand to the commonAncestor if the user has selected only a portion of an anchor
     */
    remove: function() {
        this.editor.unwrapParentTag('a');
    },

    /**
     * Replace the href for links with their data version, if stored.
     * This is an attempt to workaround browsers that "helpfully" convert relative & root-relative links to their absolute forms.
     */
    repairLinks: function() {
        var ui = this;
        this.editor.getElement().find('a[class^="' + this.options.baseClass + '"]').each(function(){
            if ($(this).data(ui.options.baseClass + '-href')) {
                $(this).attr('href', $(this).data(ui.options.baseClass + '-href'));
            }
        });
    },

    /**
     * Tidy up after the user has canceled editing
     */
    cancel: function() {
        if (this.dialog) $(this.dialog.dialog('close'));
    }

});

$.ui.editor.registerUi({

    /**
     * @name $.editor.ui.link
     * @augments $.ui.editor.defaultUi
     * @see $.ui.editor.defaultUi.unlink
     * @see  $.editor.plugin.link
     * @class Button initiating the insert link plugin
     */
    link: /** @lends $.editor.ui.link.prototype */ {

        hotkeys: {
            'ctrl+l': {
                'action': function() {
                    this.editor.getPlugin('link').show();
                },
                restoreSelection: false
            }
        },

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor) {
            editor.bind('selectionChange', this.change, this);

            return editor.uiButton({
                title: _('Insert Link'),
                click: function() {
                    editor.getPlugin('link').show();
                }
            });
        },

        change: function() {
            if (!selectionGetElements().length) this.ui.disable();
            else this.ui.enable();
        }
    },

    /**
     * @name $.editor.ui.unlink
     * @augments $.ui.editor.defaultUi
     * @see $.ui.editor.defaultUi.link
     * @see  $.editor.plugin.link
     * @class Button allowing the user to unlink text
     */
    unlink: /** @lends $.editor.ui.unlink.prototype */ {

        hotkeys: {
            'ctrl+shift+l': {
                'action': function() {
                    this.ui.click();
                },
                restoreSelection: false
            }
        },

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor) {
            editor.bind('selectionChange', this.change, this);
            editor.bind('show', this.change, this);

            return editor.uiButton({
                title: _('Remove Link'),
                click: function() {
                    editor.getPlugin('link').remove();
                }
            });
        },

        /**
         * Enable UI component only when an anchor is selected
         */
        change: function() {
            if (!selectionGetElements().is('a')) this.ui.disable();
            else this.ui.enable();
        }
    }
});
/**
 * @fileOverview UI components & plugin for inserting ordered and unordered lists
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */
$.ui.editor.registerPlugin('list', /** @lends $.editor.plugin.list.prototype */ {

    /**
     * @name $.editor.plugin.list.options
     * @type {Object}
     * @namespace Default options
     * @see $.editor.plugin.list
     */
    options: /** @lends $.editor.plugin.list.options */  { },

    /**
     * Tag names for elements that are allowed to contain ul/ol elements.
     * @type {Array}
     */
    validParents: [
        'blockquote', 'body', 'button', 'center', 'dd', 'div', 'fieldset', 'form', 'iframe', 'li',
        'noframes', 'noscript', 'object', 'td', 'th'
    ],

    /**
     * Tag names for elements that may be contained by li elements.
     * @type {Array}
     */
    validChildren: [
        'a', 'abbr','acronym', 'applet', 'b', 'basefont', 'bdo', 'big', 'br', 'button', 'cite', 'code', 'dfn',
        'em', 'font', 'i', 'iframe', 'img', 'input', 'kbd', 'label', 'map', 'object', 'p', 'q', 's',  'samp',
        'select', 'small', 'span', 'strike', 'strong', 'sub', 'sup', 'textarea', 'tt', 'u', 'var'
    ],

    /**
     * Toggle listType depending on the current selection.
     * This function fires both the selectionChange & change events when the action is complete.
     * @param  {string} listType One of ul or ol.
     */
    toggleList: function(listType) {

        // Check whether selection is fully contained by a ul/ol. If so, unwrap parent ul/ol
        if ($(selectionGetElements()).is('li')
            && $(selectionGetElements()).parent().is(listType)) {
            this.unwrapList();
        } else {
            this.wrapList(listType);
        }

        this.editor.fire('selectionChange');
        this.editor.fire('change');
    },

    /**
     * Extract the contents of all selected li elements.
     * If the list element's parent is not a li, then wrap the content of each li in a p, else leave them unwrapped.
     */
    unwrapList: function() {
        selectionSave();

        // Array containing the html contents of each of the selected li elements.
        var listElementsContent = [];
        // Array containing the selected li elements themselves.
        var listElements = [];

        // The element within which selection begins.
        var startElement = selectionGetStartElement();
        // The element within which ends.
        var endElement = selectionGetEndElement();

        // Collect the first selected list element's content
        listElementsContent.push($(startElement).html());
        listElements.push(startElement);

        // Collect the remaining list elements' content
        if ($(startElement)[0] !== $(endElement)[0]) {
            var currentElement = startElement;
            do  {
                currentElement = $(currentElement).next();
                listElementsContent.push($(currentElement).html());
                listElements.push(currentElement);
            } while($(currentElement)[0] !== $(endElement)[0]);
        }

        // Boolean values used to determine whether first / last list element of the parent is selected.
        var firstLiSelected = $(startElement).prev().length === 0;
        var lastLiSelected = $(endElement).next().length === 0;

        // The parent list container, e.g. the parent ul / ol
        var parentListContainer = $(startElement).parent();

        // Remove the list elements from the DOM.
        for (listElementsIndex = 0; listElementsIndex < listElements.length; listElementsIndex++) {
            $(listElements[listElementsIndex]).remove();
        }

        // Wrap list element content in p tags if the list element parent's parent is not a li.
        for (var listElementsContentIndex = 0; listElementsContentIndex < listElementsContent.length; listElementsContentIndex++) {
            if (!parentListContainer.parent().is('li')) {
                listElementsContent[listElementsContentIndex] = '<p>' + listElementsContent[listElementsContentIndex] + '</p>';
            }
        }

        // Every li of the list has been selected, replace the entire list
        if (firstLiSelected && lastLiSelected) {
            parentListContainer.replaceWith(listElementsContent.join(''));
            selectionRestore();
            var selectedElement = selectionGetElements()[0];
            selectionSelectOuter(selectedElement);
            return;
        }

        if (firstLiSelected) {
            $(parentListContainer).before(listElementsContent.join(''));
        } else if (lastLiSelected) {
            $(parentListContainer).after(listElementsContent.join(''));
        } else {
            selectionReplaceSplittingSelectedElement(listElementsContent.join(''));
        }

        selectionRestore();
        this.editor.checkChange();
    },

    /**
     * Wrap the selection with the given listType.
     * @param  {string} listType One of ul or ol.
     */
    wrapList: function(listType) {
        selectionConstrain(this.editor.getElement());
        if ($.trim(selectionGetHtml()) === '') {
            selectionSelectInner(selectionGetElements());
        }

        var selectedHtml = $('<div>').html(selectionGetHtml());

        var listElements = [];
        var plugin = this;

        // Convert child block elements to list elements
        $(selectedHtml).contents().each(function() {
            var liContent;
            // Use only content of block elements
            if ('block' === elementDefaultDisplay(this.tagName)) {
                liContent = stringStripTags($(this).html(), plugin.validChildren);
            } else {
                liContent = stringStripTags(elementOuterHtml($(this)), plugin.validChildren);
            }

            // Avoid inserting blank lists
            var listElement = $('<li>' + liContent + '</li>');
            if ($.trim(listElement.text()) !== '') {
                listElements.push(elementOuterHtml(listElement));
            }
        });

        var replacementClass = this.options.baseClass + '-selection';
        var replacementHtml = '<' + listType + ' class="' + replacementClass + '">' + listElements.join('') + '</' + listType + '>';

        // Selection must be restored before it may be replaced.
        selectionRestore();

        var selectedElementParent = $(selectionGetElements()[0]).parent();
        var editingElement = this.editor.getElement()[0];

        /*
         * Replace selection if the selected element parent or the selected element is the editing element,
         * instead of splitting the editing element.
         */
        if (selectedElementParent === editingElement
            || selectionGetElements()[0] === editingElement) {
            selectionReplace(replacementHtml);
        } else {
            selectionReplaceWithinValidTags(replacementHtml, this.validParents);
        }

        // Select the first list element of the inserted list
        var selectedElement = $(this.editor.getElement().find('.' + replacementClass).removeClass(replacementClass));
        selectionSelectInner(selectedElement.find('li:first')[0]);
        this.editor.checkChange();
    },

    /**
     * Toggle the givent ui's button state depending on whether the current selection is within the context of listType.
     * @param  {string} listType A tagname for a list type.
     * @param  {object} ui The ui owning the button whose state is to be toggled.
     */
    toggleButtonState: function(listType, ui) {

        var toggleState = function(on) {
            ui.button.toggleClass('ui-state-highlight', on).toggleClass('ui-state-default', !on);
        };

        var selectionStart = selectionGetStartElement();
        if (selectionStart === null || !selectionStart.length) {
            selectionStart = this.editor.getElement();
        }

        var selectionEnd = selectionGetEndElement();
        if (selectionEnd === null || !selectionEnd.length) {
            selectionEnd = this.editor.getElement();
        }

        var start = selectionStart[0];
        var end = selectionEnd[0];

        // If the start & end are a UL or OL, and they're the same node:
        if ($(start).is(listType) && $(end).is(listType) && start === end) {
            return toggleState(true);
        }

        var shareParentListType = $(start).parentsUntil(elementSelector, listType).first()
                                    && $(end).parentsUntil(elementSelector, listType).first();

        var elementSelector = '#' + this.editor.getElement().attr('id');
        var startIsLiOrInside = $(start).is(listType + ' > li') || $(start).parentsUntil(elementSelector, listType + ' > li').length;
        var endIsLiOrInside = $(end).is(listType + ' > li') || $(end).parentsUntil(elementSelector, listType + ' > li').length;

        // If the start & end elements are LI's or inside LI's, and they are enclosed by the same UL:
        if (startIsLiOrInside && endIsLiOrInside && shareParentListType) {

            var sharedParentList = $(rangeGetCommonAncestor());
            if (!sharedParentList.is(listType)) {
                sharedParentList = $(sharedParentList).parentsUntil(elementSelector, listType).first();
            }
            var childLists = sharedParentList.find('ul, ol');
            if (!childLists.length) {
                return toggleState(true);
            }
            for (var childListIndex = 0; childListIndex < childLists.length; childListIndex++) {
                if ($.contains(childLists[childListIndex], start) && $.contains(childLists[childListIndex], end)) {
                    return toggleState(false);
                }
            }

            return toggleState(true);
        }

        return toggleState(false);
    }
});

$.ui.editor.registerUi({

    /**
     * @name $.editor.ui.listUnordered
     * @augments $.ui.editor.defaultUi
     * @class Wraps the selection with a &lt;ul&gt;, then a &lt;li&gt;
     */
    listUnordered: /** @lends $.editor.ui.listUnordered.prototype */ {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor) {
            var ui = editor.uiButton({
                title: _('Unordered List'),
                click: function() {
                    editor.getPlugin('list').toggleList('ul');
                }
            });

            editor.bind('selectionChange', function() {
                editor.getPlugin('list').toggleButtonState('ul', ui);
            });

            return ui;
        }
    },

    /**
     * @name $.editor.ui.listOrdered
     * @augments $.ui.editor.defaultUi
     * @class Wraps the selection with a &lt;ol&gt;, then a &lt;li&gt;
     */
    listOrdered: /** @lends $.editor.ui.listOrdered.prototype */ {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor) {
            var ui = editor.uiButton({
                title: _('Ordered List'),
                click: function() {
                    editor.getPlugin('list').toggleList('ol');
                }
            });

            editor.bind('selectionChange', function() {
                editor.getPlugin('list').toggleButtonState('ol', ui);
            });

            return ui;
        }
    }
});
/**
 * @fileOverview Incredible Raptor logo and usage statistics tracking
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */
$.ui.editor.registerUi({

    /**
     * @name $.editor.ui.logo
     * @augments $.ui.editor.defaultUi
     * @class Displays an <em>amazing</em> Raptor logo, providing your users with both shock and awe.
     * <br/>
     * Links back to the Raptor home page
     */
    logo: /** @lends $.editor.ui.logo.prototype */ {

        ui: null,

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor, options) {
            this.ui = this.editor.uiButton({
                title: _('Learn More About the Raptor WYSIWYG Editor'),
                click: function() {
                    window.open('http://www.jquery-raptor.com/about/editors/', '_blank');
                },

                // Button ready event
                ready: function() {
                    var serializeJSON = function(obj) {
                        var t = typeof(obj);
                        if(t != "object" || obj === null) {
                            // simple data type
                            if(t == "string") obj = '"' + obj + '"';
                            return String(obj);
                        } else {
                            // array or object
                            var json = [], arr = (obj && $.isArray(obj));

                            $.each(obj, function(k, v) {
                                t = typeof(v);
                                if(t == "string") v = '"' + v + '"';
                                else if (t == "object" & v !== null) v = serializeJSON(v);
                                json.push((arr ? "" : '"' + k + '":') + String(v));
                            });

                            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
                        }
                    };

                    var data = {
                        'enableUi': this.options.enableUi,
                        'enablePlugins': this.options.enablePlugins,
                        'disabledPlugins': serializeJSON(this.options.disabledPlugins),
                        'ui': serializeJSON(this.options.ui),
                        't': new Date().getTime()
                    };

                    var query = [];
                    for (var i in data) {
                        query.push(i + '=' + encodeURIComponent(data[i]));
                    }

                    this.ui.button.find('.ui-button-icon-primary').css({
                        'background-image': 'url(http://www.jquery-raptor.com/logo/0.0.26?' + query.join('&') + ')'
                    });
                }
            });

            return this.ui;
        }
    }
});
/**
 * @name $.editor.plugin.normaliseLineBreaks
 * @augments $.ui.editor.defaultPlugin
 * @class Automaticly wraps content inside an editable element with a specified tag if it is empty.
 */
$.ui.editor.registerPlugin('normaliseLineBreaks', /** @lends $.editor.plugin.normaliseLineBreaks.prototype */ {

    /**
     * @name $.editor.plugin.normaliseLineBreaks.options
     * @type {Object}
     * @namespace Default options
     * @see $.editor.plugin.normaliseLineBreaks
     */
    options: /** @lends $.editor.plugin.normaliseLineBreaks.options */  {

        /** @type {String} The tag to insert when user presses enter */
        enter: '<p><br/></p>',

        /** @type {Array} Array of tag names within which the return HTML is valid. */
        enterValidTags: [
            'address', 'blockquote', 'body', 'button', 'center', 'dd',
            'div', 'fieldset', 'form', 'iframe', 'li', 'noframes',
            'noscript', 'object', 'td', 'th'
        ],

        /** @type {String} The tag to insert when user presses shift enter. */
        shiftEnter: '<br/>',

        /** @type {Array} Array of tag names within which the shiftReturn HTML is valid. */
        shiftEnterValidTags: [
            'a', 'abbr', 'acronym', 'address', 'applet', 'b', 'bdo',
            'big', 'blockquote', 'body', 'button', 'caption', 'center',
            'cite', 'code', 'dd', 'del', 'dfn', 'div', 'dt', 'em',
            'fieldset', 'font', 'form', 'h1', 'h2', 'h3', 'h4', 'h5',
            'h6', 'i', 'iframe', 'ins', 'kbd', 'label', 'legend', 'li',
            'noframes', 'noscript', 'object', 'p', 'pres', 'q', 's',
            'samp', 'small', 'span', 'strike', 'strong', 'sub', 'sup',
            'td', 'th', 'tt', 'u', 'var'
        ]
    },

    hotkeys: {
        'return': {
            'action': function() {

                selectionDestroy();

                var selectionEmpty = selectionIsEmpty();
                var selectionIsAtStart = selectionAtStartOfElement();
                var selectionIsAtEnd = selectionAtEndOfElement();

                var breakId = this.options.baseClass + '-enter-break';
                var breakElement = $(this.options.enter).attr('id', breakId);

                selectionReplaceWithinValidTags(breakElement, this.options.enterValidTags);

                breakElement = $('#' + breakId).removeAttr('id');
                if (selectionEmpty) {
                    if (selectionIsAtStart) {
                        selectionSelectStart(breakElement.next());
                    } else if(selectionIsAtEnd) {
                        selectionSelectStart(breakElement);
                    } else {
                        selectionSelectStart(breakElement.next());
                        var previousSibling = breakElement.prev();
                        if (previousSibling && $.trim(previousSibling.html()) !== '' && elementOuterHtml(previousSibling) !== this.options.enter) {
                            breakElement.remove();
                        }
                    }
                } else {
                    selectionSelectStart(breakElement.next());
                    breakElement.remove();
                }
            },
            restoreSelection: false
        },
        'return+shift': {
            'action': function() {
                selectionDestroy();

                var breakId = this.options.baseClass + '-enter-break';

                var breakElement = $(this.shiftEnter)
                                .attr('id', breakId)
                                .appendTo('body');

                if (this.options.shiftEnterValidTags) {
                    selectionReplaceWithinValidTags(this.options.shiftEnter, this.options.shiftEnterValidTags);
                } else {
                    selectionReplace(breakElement);
                }

                var select = $('#' + breakId).removeAttr('id').next();

                selectionSelectStart(select);
            },
            restoreSelection: false
        }
    }
});
/**
 * @name $.editor.plugin.paste
 * @extends $.editor.plugin
 * @class Plugin that captures paste events on the element and shows a modal dialog containing different versions of what was pasted.
 * Intended to prevent horrible 'paste from word' catastrophes.
 */
$.ui.editor.registerPlugin('paste', /** @lends $.editor.plugin.paste.prototype */ {

    /**
     * @name $.editor.plugin.paste.options
     * @type {Object}
     * @namespace Default options
     * @see $.editor.plugin.paste
     */
    options: /** @lends $.editor.plugin.paste.options */  {

        /**
         * Tags that will not be stripped from pasted content.
         * @type {Array}
         */
        allowedTags: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'ul', 'ol', 'li', 'blockquote',
            'p', 'a', 'span', 'hr', 'br'
        ],

        allowedAttributes: [
            'href', 'title'
        ],

        allowedEmptyTags: [
            'hr', 'br'
        ]
    },

    /**
     * @see $.ui.editor.defaultPlugin#init
     */
    init: function(editor, options) {
        var inProgress = false;
        var dialog = false;
        var selector = '.uiWidgetEditorPasteBin';
        var plugin = this;

        // Event binding
        editor.getElement().bind('paste.' + editor.widgetName, $.proxy(function(event) {
            if (inProgress) return false;
            inProgress = true;

            selectionSave();

            // Make a contentEditable div to capture pasted text
            if ($(selector).length) $(selector).remove();
            $('<div class="uiWidgetEditorPasteBin" contenteditable="true" style="width: 1px; height: 1px; overflow: hidden; position: fixed; top: -1px;" />').appendTo('body');
            $(selector).focus();

            window.setTimeout(function() {
                var markup = $(selector).html();
                markup = plugin.filterAttributes(markup);
                markup = plugin.filterChars(markup);
                markup = plugin.stripEmpty(markup);
                markup = plugin.stripAttributes(markup);
                markup = stringStripTags(markup, plugin.options.allowedTags);

                var vars = {
                    plain: $('<div/>').html($(selector).html()).text(),
                    markup: markup,
                    html: $(selector).html()
                };

                dialog = $(editor.getTemplate('paste.dialog', vars));

                // dialog.find('.ui-editor-paste-area').bind('keyup.' + editor.widgetname, function(){
                //     plugin.updateAreas(this, dialog);
                // });

                $(dialog).dialog({
                    modal: true,
                    width: 650,
                    height: 500,
                    resizable: true,
                    title: 'Paste',
                    position: 'center',
                    show: options.dialogShowAnimation,
                    hide: options.dialogHideAnimation,
                    dialogClass: options.baseClass + ' ' + options.dialogClass,
                    buttons:
                        [
                            {
                                text: _('Insert'),
                                click: function() {
                                    var html = null;
                                    var element = $(this).find('.ui-editor-paste-area:visible');

                                    if (element.hasClass('ui-editor-paste-plain') || element.hasClass('ui-editor-paste-source')) {
                                        html = element.val();
                                    } else {
                                        html = element.html();
                                    }

                                    html = plugin.filterAttributes(html);
                                    html = plugin.filterChars(html);

                                    selectionRestore();
                                    selectionReplace(html);
                                    editor.checkChange();
                                    inProgress = false;
                                    $(this).dialog('close');
                                }
                            },
                            {
                                text: _('Cancel'),
                                click: function() {
                                    selectionRestore();
                                    inProgress = false;
                                    $(this).dialog('close');
                                }
                            }
                    ],
                    open: function() {
                        // Create fake jQuery UI tabs (to prevent hash changes)
                        var tabs = $(this).find('.ui-editor-paste-panel-tabs');
                        tabs.find('ul.ui-tabs-nav li').click(function() {
                            tabs.find('ul.ui-tabs-nav li').removeClass('ui-state-active').removeClass('ui-tabs-selected');
                            $(this).addClass('ui-state-active').addClass('ui-tabs-selected');
                            tabs.children('div').hide().eq($(this).index()).show();
                        });

                        // Set custom buttons
                        var buttons = dialog.parent().find('.ui-dialog-buttonpane');
                        buttons.find('button:eq(0)').button({icons: {primary: 'ui-icon-circle-check'}});
                        buttons.find('button:eq(1)').button({icons: {primary: 'ui-icon-circle-close'}});
                    },
                    close: function() {
                        inProgress = false;
                        $(this).dialog('destroy').remove();
                    }
                });

                $(selector).remove();

            }, 0);

            return true;
        }, this));
    },

    /**
     * Attempts to filter rubbish from content using regular expressions
     * @param  {String} content Dirty text
     * @return {String} The filtered content
     */
    filterAttributes: function(content) {
        // The filters variable is an array of of regular expression & handler pairs.
        //
        // The regular expressions attempt to strip out a lot of style data that
        // MS Word likes to insert when pasting into a contentEditable.
        // Almost all of it is junk and not good html.
        //
        // The hander is a place to put a function for match handling.
        // In most cases, it just handles it as empty string.  But the option is there
        // for more complex handling.
        var filters = [
            // Meta tags, link tags, and prefixed tags
            {regexp: /(<meta\s*[^>]*\s*>)|(<\s*link\s* href="file:[^>]*\s*>)|(<\/?\s*\w+:[^>]*\s*>)/gi, handler: ''},
            // MS class tags and comment tags.
            {regexp: /(class="Mso[^"]*")|(<!--(.|\s){1,}?-->)/gi, handler: ''},
            // Apple class tags
            {regexp: /(class="Apple-(style|converted)-[a-z]+\s?[^"]+")/, handle: ''},
            // Google doc attributes
            {regexp: /id="internal-source-marker_[^"]+"|dir="[rtl]{3}"/, handle: ''},
            // blank p tags
            {regexp: /(<p[^>]*>\s*(\&nbsp;|\u00A0)*\s*<\/p[^>]*>)|(<p[^>]*>\s*<font[^>]*>\s*(\&nbsp;|\u00A0)*\s*<\/\s*font\s*>\s<\/p[^>]*>)/ig, handler: ''},
            // Strip out styles containing mso defs and margins, as likely added in IE and are not good to have as it mangles presentation.
            {regexp: /(style="[^"]*mso-[^;][^"]*")|(style="margin:\s*[^;"]*;")/gi, handler: ''},
            // Style tags
            {regexp: /(?:<style([^>]*)>([\s\S]*?)<\/style>|<link\s+(?=[^>]*rel=['"]?stylesheet)([^>]*?href=(['"])([^>]*?)\4[^>\/]*)\/?>)/gi, handler: ''},
            // Scripts (if any)
            {regexp: /(<\s*script[^>]*>((.|\s)*?)<\\?\/\s*script\s*>)|(<\s*script\b([^<>]|\s)*>?)|(<[^>]*=(\s|)*[("|')]javascript:[^$1][(\s|.)]*[$1][^>]*>)/ig, handler: ''}
        ];

        $.each(filters, function(i, filter) {
            content = content.replace(filter.regexp, filter.handler);
        });

        return content;
    },

    /**
     * Replaces commonly-used Windows 1252 encoded chars that do not exist in ASCII or ISO-8859-1 with ISO-8859-1 cognates.
     * @param  {[type]} content [description]
     * @return {[type]}
     */
    filterChars: function(content) {
        var s = content;

        // smart single quotes and apostrophe
        s = s.replace(/[\u2018|\u2019|\u201A]/g, '\'');

        // smart double quotes
        s = s.replace(/[\u201C|\u201D|\u201E]/g, '\"');

        // ellipsis
        s = s.replace(/\u2026/g, '...');

        // dashes
        s = s.replace(/[\u2013|\u2014]/g, '-');

        // circumflex
        s = s.replace(/\u02C6/g, '^');

        // open angle bracket
        s = s.replace(/\u2039/g, '<');

        // close angle bracket
        s = s.replace(/\u203A/g, '>');

        // spaces
        s = s.replace(/[\u02DC|\u00A0]/g, ' ');

        return s;
    },

    /**
     * Strip all attributes from content (if it's an element), and every element contained within
     * Strip loop taken from <a href="http://stackoverflow.com/a/1870487/187954">Remove all attributes</a>
     * @param  {String|Element} content The string / element to be cleaned
     * @return {String} The cleaned string
     */
    stripAttributes: function(content) {
        content = $('<div/>').html(content);
        var allowedAttributes = this.options.allowedAttributes;

        $(content.find('*')).each(function() {
            // First copy the attributes to remove if we don't do this it causes problems iterating over the array
            // we're removing elements from
            var attributes = [];
            $.each(this.attributes, function(index, attribute) {
                // Do not remove allowed attributes
                if (-1 !== $.inArray(attribute.nodeName, allowedAttributes)) {
                    return;
                }
                attributes.push(attribute.nodeName);
            });

            // now remove the attributes
            for (var attributeIndex = 0; attributeIndex < attributes.length; attributeIndex++) {
                $(this).attr(attributes[attributeIndex], null);
            }
        });
        return content.html();
    },

    /**
     * Remove empty tags.
     * @param  {String} content The HTML containing empty elements to be removed
     * @return {String} The cleaned HTML
     */
    stripEmpty: function(content) {
        var wrapper = $('<div/>').html(content);
        var allowedEmptyTags = this.options.allowedEmptyTags;
        wrapper.find('*').filter(function() {
            // Do not strip elements in allowedEmptyTags
            if (-1 !== $.inArray(this.tagName.toLowerCase(), allowedEmptyTags)) {
                return false;
            }
            // If the element has at least one child element that exists in allowedEmptyTags, do not strip it
            if ($(this).find(allowedEmptyTags.join(',')).length) {
                return false;
            }
            return $.trim($(this).text()) === '';
        }).remove();
        return wrapper.html();
    },

    /**
     * Update text input content
     * @param  {Element} target The input being edited
     * @param  {Element} dialog The paste dialog
     */
    updateAreas: function(target, dialog) {
        var content = $(target).is('textarea') ? $(target).val() : $(target).html();
        if (!$(target).hasClass('ui-editor-paste-plain')) dialog.find('.ui-editor-paste-plain').val($('<div/>').html(content).text());
        if (!$(target).hasClass('ui-editor-paste-rich')) dialog.find('.ui-editor-paste-rich').html(content);
        if (!$(target).hasClass('ui-editor-paste-source')) dialog.find('.ui-editor-paste-source').html(content);
        if (!$(target).hasClass('ui-editor-paste-markup')) dialog.find('.ui-editor-paste-markup').html(this.stripAttributes(content));
    }
});
/**
 * @fileOverview Placeholder text component
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

$.ui.editor.registerPlugin('placeholder', /** @lends $.editor.plugin.placeholder.prototype */ {

    /**
     * @see $.ui.editor.defaultPlugin#init
     */
    init: function(editor, options) {
        var plugin = this;

        /**
        * Plugin option defaults
        * @type {Object}
        */
        options = $.extend({}, {
            /**
             * Content to insert into an editable element if said element is empty on initialisation
             * @default Placeholder content
             * @type {String}
             */
            content: '[Your content here]',

            /**
             * Tag to wrap content
             * @default p
             * @type {String}
             */
            tag: 'p',

            /**
             * Select content on insertion
             * @default true
             * @type {Boolean} False to prevent automatic selection of inserted placeholder
             */
            select: true
        }, options);

        /**
         * Show the click to edit message
         */
        this.show = function() {
            if (!$.trim(editor.getElement().html())) {

                var content = $(document.createElement(options.tag)).html(options.content);
                editor.getElement().html(content);

                if (options.select) {
                    selectionSelectInner(content);
                }
            }
        };

        editor.bind('show', plugin.show);
    }
});/**
 * @fileOverview Raptorize UI component
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

$.ui.editor.registerUi({

    /**
     * @name $.editor.ui.raptorize
     * @augments $.ui.editor.defaultUi
     * @class Raptorize your editor
     */
    raptorize: /** @lends $.editor.ui.raptorize.prototype */ {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor) {
            var ui = editor.uiButton({
                title: _('Raptorize'),
                ready: function() {
                    if (!ui.button.raptorize) {
                        // <strict/>
                        return;
                    }
                    ui.button.raptorize();
                }
            });
            return ui;
        }
    }

});
/**
 * @fileOverview Save plugin & ui component
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * @name $.editor.plugin.saveJson
 * @augments $.ui.editor.defaultPlugin
 * @class Provides an interface for saving the element's content via AJAX. For options see {@link $.editor.plugin.saveJson.options}
 */
$.ui.editor.registerPlugin('saveJson', /** @lends $.editor.plugin.saveJson.prototype */ {

    /**
     * @name $.editor.plugin.saveJson.options
     * @type {Object}
     * @namespace Default options
     * @see $.editor.plugin.saveJson
     */
    options: /** @lends $.editor.plugin.saveJson.options */  {

        /**
         * @type {Object}
         * @default <tt>{ attr: "name" }</tt>
         */
        id: { attr: 'name' },

        /**
         * @type {String}
         * @default "content"
         */
        postName: 'content',

        /**
         * @default false
         * @type {Boolean}
         */
        showResponse: false,

        /**
         * @default false
         * @type {Boolean}
         */
        appendId: false,

        /**
         * @default <tt>{
         *    url: '/',
         *    type: 'post',
         *    cache: false
         * }</tt>
         * @type {Object}
         */
        ajax: {
            url: '/',
            type: 'post',
            cache: false
        }
    },

    /**
     * @see $.ui.editor.defaultPlugin#init
     */
    init: function() {
    },

    /**
     * Get the identifier for this element
     * @return {String} The identifier
     */
    getId: function() {
        if (typeof(this.options.id) === 'string') {
            return this.options.id;
        } else if (typeof(this.options.id) === 'function') {
            return this.options.id.apply(this, [this.editor.getOriginalElement()]);
        } else if (this.options.id.attr) {
            // Check the ID attribute exists on the content block
            var id = this.editor.getOriginalElement().attr(this.options.id.attr);
            if (id) {
                return id;
            }
        }
        return null;
    },

    /**
     * Get the cleaned content for the element.
     * @param {String} id ID to use if no ID can be found.
     * @return {String}
     */
    getData: function() {
        var data = {};
        data[this.getId()] = this.editor.save();
        return data;
    },

    /**
     * Perform save.
     */
    save: function() {
        this.message = this.editor.showLoading(_('Saving changes...'));

        // Get all unified content
        var contentData = {};
        var dirty = 0;
        this.editor.unify(function(editor) {
            if (editor.isDirty()) {
                dirty++;
                var plugin = editor.getPlugin('saveJson');
                $.extend(contentData, plugin.getData());
            }
        });
        this.dirty = dirty;

        // Count the number of requests
        this.saved = 0;
        this.failed = 0;
        this.requests = 0;

        // Pass all content at once
        this.ajax(contentData);
    },

    /**
     * @param {Object} data Data returned from server
     */
    done: function(data) {
        if (this.options.multiple) {
            this.saved++;
        } else {
            this.saved = this.dirty;
        }
        if (this.options.showResponse) {
            this.editor.showConfirm(data, {
                delay: 1000,
                hide: function() {
                    this.editor.unify(function(editor) {
                        editor.disableEditing();
                        editor.hideToolbar();
                    });
                }
            });
        }
    },

    /**
     * Called if a save AJAX request fails
     * @param  {Object} xhr
    */
    fail: function(xhr) {
        if (this.options.multiple) {
            this.failed++;
        } else {
            this.failed = this.dirty;
        }
        if (this.options.showResponse) {
            this.editor.showError(xhr.responseText);
        }
    },

    /**
     * Called after every save AJAX request
     */
    always: function() {
        if (this.dirty === this.saved + this.failed) {
            if (!this.options.showResponse) {
                if (this.failed > 0 && this.saved === 0) {
                    this.editor.showError(_('Failed to save {{failed}} content block(s).', this));
                } else if (this.failed > 0) {
                    this.editor.showError(_('Saved {{saved}} out of {{dirty}} content blocks.', this));
                } else {
                    this.editor.showConfirm(_('Successfully saved {{saved}} content block(s).', this), {
                        delay: 1000,
                        hide: function() {
                            this.editor.unify(function(editor) {
                                editor.disableEditing();
                                editor.hideToolbar();
                            });
                        }
                    });
                }
            }

            // Hide the loading message
            this.message.hide();
            this.message = null;
        }
    },

    /**
     * Handle the save AJAX request(s)
     * @param  {String} contentData The element's content
     * @param  {String} id Editing element's identfier
     */
    ajax: function(contentData, id) {

        // Create the JSON request
        var ajax = $.extend(true, {}, this.options.ajax);

        if ($.isFunction(ajax.data)) {
            ajax.data = ajax.data.apply(this, [id, contentData]);
        } else if (this.options.postName) {
            ajax.data = {};
            ajax.data[this.options.postName] = JSON.stringify(contentData);
        }

        // Get the URL, if it is a callback
        if ($.isFunction(ajax.url)) {
            ajax.url = ajax.url.apply(this, [id]);
        }

        // Send the data to the server
        this.requests++;
        $.ajax(ajax)
            .done($.proxy(this.done, this))
            .fail($.proxy(this.fail, this))
            .always($.proxy(this.always, this));
    }

});
/**
 * @fileOverview
 * @author David Neilsen david@panmedia.co.nz
 */

/**
 * @name $.editor.plugin.saverest
 * @augments $.ui.editor.defaultPlugin
 * @class
 */
$.ui.editor.registerPlugin('saveRest', /** @lends $.editor.plugin.saveRest.prototype */ {

    /**
     * @name $.editor.plugin.saveRest.options
     * @type {Object}
     * @namespace Default options
     * @see $.editor.plugin.saveRest
     */
    options: /** @lends $.editor.plugin.saveRest.options */  {

        /**
         * @default false
         * @type {Boolean}
         */
        showResponse: false,

        /**
         * @default <tt>{
         *    url: '/',
         *    type: 'post',
         *    cache: false
         * }</tt>
         * @type {Object}
         */
        ajax: {
            url: '/',
            type: 'post',
            cache: false
        }
    },

    /**
     * @see $.ui.editor.defaultPlugin#init
     */
    init: function() {
    },

    /**
     * Get the identifier for this element
     * @return {String} The identifier
     */
    getId: function() {
        if (typeof(this.options.id) === 'string') {
            return this.options.id;
        } else if (this.options.id.attr) {
            // Check the ID attribute exists on the content block
            var id = this.editor.getOriginalElement().attr(this.options.id.attr);
            if (id) {
                return id;
            }
        }
        return null;
    },

    /**
     * Get the cleaned content for the element.
     * @param {String} id ID to use if no ID can be found.
     * @return {String}
     */
    getData: function(id) {
        var data = {};
        data[this.getId() || id] = this.editor.save();
        return this.editor.save();
    },

    /**
     * Perform save.
     */
    save: function() {
        this.message = this.editor.showLoading(_('Saving changes...'));

        // Count the number of requests
        this.saved = 0;
        this.failed = 0;
        this.requests = 0;

        // Get all unified content
        var dirty = 0;
        this.editor.unify(function(editor) {
            if (editor.isDirty()) {
                dirty++;
                var plugin = editor.getPlugin('saveRest');
                var content = plugin.editor.save();
                plugin.ajax(content);
            }
        });
        this.dirty = dirty;

        if (dirty === 0) {
            this.message.hide();
            this.editor.showInfo(_('No changes detected to save...'));
        }
    },

    /**
     * @param {Object} data Data returned from server
     */
    done: function(data) {
        if (this.options.multiple) {
            this.saved++;
        } else {
            this.saved = this.dirty;
        }
        if (this.options.showResponse) {
            this.editor.showConfirm(data, {
                delay: 1000,
                hide: function() {
                    this.editor.unify(function(editor) {
                        editor.disableEditing();
                        editor.hideToolbar();
                    });
                }
            });
        }
    },

    /**
     * Called if a save AJAX request fails
     * @param  {Object} xhr
    */
    fail: function(xhr) {
        if (this.options.multiple) {
            this.failed++;
        } else {
            this.failed = this.dirty;
        }
        if (this.options.showResponse) {
            this.editor.showError(xhr.responseText);
        }
    },

    /**
     * Called after every save AJAX request
     */
    always: function() {
        if (this.dirty === this.saved + this.failed) {
            if (!this.options.showResponse) {
                if (this.failed > 0 && this.saved === 0) {
                    this.editor.showError(_('Failed to save {{failed}} content block(s).', this));
                } else if (this.failed > 0) {
                    this.editor.showError(_('Saved {{saved}} out of {{dirty}} content blocks.', this));
                } else {
                    this.editor.showConfirm(_('Successfully saved {{saved}} content block(s).', this), {
                        delay: 1000,
                        hide: function() {
                            this.editor.unify(function(editor) {
                                editor.disableEditing();
                                editor.hideToolbar();
                            });
                        }
                    });
                }
            }

            // Hide the loading message
            this.message.hide();
            this.message = null;
        }
    },

    /**
     * Handle the save AJAX request(s)
     * @param  {String} contentData The element's content
     * @param  {String} id Editing element's identfier
     */
    ajax: function(contentData, id) {
        // Create POST data
        //var data = {};

        // Content is serialized to a JSON object, and sent as 1 post parameter
        //data[this.options.postName] = JSON.stringify(contentData);

        // Create the JSON request
        var ajax = $.extend(true, {}, this.options.ajax);

        if ($.isFunction(ajax.data)) {
            ajax.data = ajax.data.apply(this, [id, contentData]);
        } else if (this.options.postName) {
            ajax.data = {};
            ajax.data[this.options.postName] = JSON.stringify(contentData);
        }

        // Get the URL, if it is a callback
        if ($.isFunction(ajax.url)) {
            ajax.url = ajax.url.apply(this, [id]);
        }

        // Send the data to the server
        this.requests++;
        $.ajax(ajax)
            .done($.proxy(this.done, this))
            .fail($.proxy(this.fail, this))
            .always($.proxy(this.always, this));
    }

});
/**
 * @fileOverview
 * @author David Neilsen david@panmedia.co.nz
 */

/**
 * @name $.editor.ui.save
 * @augments $.ui.editor.defaultUi
 * @class
 */
$.ui.editor.registerUi({

    /**
     * @name $.editor.ui.save
     * @augments $.ui.editor.defaultPlugin
     * @class The save UI component
     */
    save: {

        options: {
            plugin: 'saveJson'
        },

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor, element) {
            return editor.uiButton({
                title: _('Save'),
                icon: 'ui-icon-save',
                click: function() {
                    editor.checkChange();
                    editor.getPlugin(this.options.plugin).save();
                }
            });
        }
    }
});
$.ui.editor.registerPlugin({
    snippet: {
        ids: [],
        enabled: false,

        init: function(editor, options) {
            if (options.snippets) {
                for (var i = 0, l = options.snippets.length; i < l; i++) {
                    this.createSnippet(options.snippets[i], editor);
                }

                editor.bind('restore', this.createButtons, this);
                editor.bind('save', this.disable, this);
                editor.bind('cancel', this.disable, this);

                editor.bind('enabled', this.enable, this);
                editor.bind('disabled', this.disable, this);

            }
        },

        createSnippet: function(snippet, editor) {
//            $.ui.editor.registerUi('snippet' + snippet.name.charAt(0).toUpperCase() + snippet.name.substr(1), {
//                init: function(editor, options) {
//                    return editor.uiButton({
//                        name: 'snippet',
//                        title: _('Insert Snippet')
//                    });
//                }
//            });
        },

        enable: function() {
            this.enabled = true;
            this.createButtons();
        },

        disable: function() {
            this.removeButtons();
            this.enabled = false;
        },

        createButtons: function() {
            var editor = this.editor;

            for (var i = 0, l = this.options.snippets.length; i < l; i++) {
                var snippet = this.options.snippets[i];
                if (snippet.repeatable) {
                    this.createButton(snippet, editor);
                }
            }
        },

        createButton: function(snippet, editor) {
            if (!this.enabled) {
                return;
            }
            var plugin = this;
            var id = editor.getUniqueId();
            this.ids.push(id);

            var button = $('<button/>')
                .addClass(plugin.options.baseClass)
                .addClass(plugin.options.baseClass + '-button')
                .addClass(plugin.options.baseClass + '-button-' + snippet.name)
                .addClass(id)
                .text('Add')
                .click(function() {
                    plugin.insertSnippet.call(plugin, snippet, editor, this);
                });

            var buttonAfter = (snippet.buttonAfter || editor.getElement());
            if ($.isFunction(buttonAfter)) {
                buttonAfter.call(this, button, snippet);
            } else {
                button.insertAfter(buttonAfter);
            }

            $('.' + id)
                .button({
                    icons: { primary: 'ui-icon-plusthick' }
                });
        },

        removeButtons: function() {
            if (!this.enabled) {
                return;
            }
            // Remove the button by the ID
            for (var i = 0, l = this.ids.length; i < l; i++) {
                $('.' + this.ids[i]).remove();
            }
            // Run clean function (if supplied)
            for (i = 0, l = this.options.snippets.length; i < l; i++) {
                var snippet = this.options.snippets[i];
                if ($.isFunction(snippet.clean)) {
                    snippet.clean.call(snippet, this, this.editor);
                }
            }
        },

        insertSnippet: function(snippet, editor, button) {
            var template = $(snippet.template).html();

            var appendTo = snippet.appendTo || editor.getElement();
            if ($.isFunction(appendTo)) {
                appendTo.call(this, template, snippet, button);
            } else {
                $(template).appendTo(appendTo);
            }

            editor.disableEditing();
            editor.enableEditing();
        }

    }
});
/**
 * @fileOverview UI Componenent for recommending & tracking maximum content length.
 * @author Michael Robinson michael@panmedia.co.nz
 * @author David Neilsen david@panmedia.co.nz
 */

$.ui.editor.registerUi({

    /**
     * @name $.editor.ui.statistics
     * @augments $.ui.editor.defaultUi
     * @see $.editor.ui.statistics.options
     * @class Displays a button containing a character count for the editor content.
     * When button is clicked, a dialog containing statistics is displayed.
     * Shows a dialog containing more content statistics when clicked.
     */
    statistics: /** @lends $.editor.ui.statistics.prototype */ {

        /**
         * @name $.editor.ui.statistics.options
         * @namespace Default options
         * @see $.editor.ui.statistics
         * @type {Object}
         */
        options: /** @lends $.editor.ui.statistics.options.prototype */  {

            /**
             * @type {Boolean|Integer} To display a character count, set to an integer.
             * Else set to false to just display the button.
             */
            maximum: null,

            /**
             * @type {Boolean} True to show count & other text in button, false
             * for icon only.
             */
            showCountInButton: true,

            /**
             * @type {String} Text to use for the button's title when
             * {@link $.editor.ui.statistics.options.maximum} has been provided.
             */
            characterLimitTitle: _('Remaining characters before the recommended character limit is reached. Click to view statistics'),

            /**
             * @type {String} Text to use for the button's title when
             * {@link $.editor.ui.statistics.options.maximum} has not been provided.
             */
            characterCountTitle: _('Click to view statistics')
        },

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor, options) {

            editor.bind('show', $.proxy(this.updateCount, this));
            editor.bind('change', $.proxy(this.updateCount, this));

            return this.editor.uiButton({
                title: typeIsNumber(this.options.maximum) ? this.options.characterLimitTitle : this.options.characterCountTitle,
                label: _('Initializing'),
                text: true,
                icon: 'ui-icon-dashboard',
                click: function() {
                    this.showStatistics();
                }
            });
        },

        /**
         * Update the associated UI element when the content has changed.
         * If {@link $.editor.ui.statistics.options.maximum} has not been specified, a character count is shown.
         * If it has been specified, a remaining character count is shown.
         */
        updateCount: function() {
            // <debug/>

            var charactersRemaining = null;
            var label = null;
            var characters = $('<div/>').html(this.editor.getCleanHtml()).text().length;

            // Cases where maximum has been provided
            if (typeIsNumber(this.options.maximum)) {
                charactersRemaining = this.options.maximum - characters;
                if (charactersRemaining >= 0) {
                    label = _('{{charactersRemaining}} characters remaining', { charactersRemaining: charactersRemaining });
                } else {
                    label = _('{{charactersRemaining}} characters over limit', { charactersRemaining: charactersRemaining * -1 });
                }
            } else {
                label = _('{{characters}} characters', { characters: characters });
            }

            var button = this.ui.button;

            // If maximum has been set to false, only show the icon button
            if (this.options.showCountInButton === false) {
                button.button('option', 'text', false);
            }

            button.button('option', 'label', label);
            button.button('option', 'text', true);

            if (!typeIsNumber(this.options.maximum)) {
                return;
            }

            // Add the error state to the button's text element if appropriate
            if (charactersRemaining < 0) {
                button.addClass('ui-state-error');
            } else{
                // Add the highlight class if the remaining characters are in the "sweet zone"
                if (charactersRemaining >= 0 && charactersRemaining <= 15) {
                    button.addClass('ui-state-highlight').removeClass('ui-state-error');
                } else {
                    button.removeClass('ui-state-highlight ui-state-error');
                }
            }
        },

        /**
         * Create & show the statistics dialog.
         */
        showStatistics: function() {
            var dialog = this.processTemplate();

            dialog.dialog({
                modal: true,
                resizable: false,
                title: _('Content Statistics'),
                dialogClass: this.editor.options.dialogClass + ' ' + this.editor.options.baseClass,
                show: this.editor.options.dialogShowAnimation,
                hide: this.editor.options.dialogHideAnimation,
                buttons: [
                    {
                        text: _('OK'),
                        click: function() {
                            $(this).dialog('close');
                        }
                    }
                ],
                open: function() {
                    // Apply custom icons to the dialog buttons
                    var buttons = $(this).parent().find('.ui-dialog-buttonpane');
                    buttons.find('button:eq(0)').button({ icons: { primary: 'ui-icon-circle-check' }});
                },
                close: function() {
                    $(this).dialog('destroy').remove();
                }
            });
        },

        /**
         * Process and return the statistics dialog template.
         * @return {jQuery} The processed statistics dialog template
         */
        processTemplate: function() {
            var content = $('<div/>').html(this.editor.getCleanHtml()).text();
            var truncation = null;

            // If maximum has not been set, use infinity
            var charactersRemaining = this.options.maximum ? this.options.maximum - content.length : '&infin;';
            if (typeIsNumber(charactersRemaining)) {
                truncation = _('Content contains more than {{limit}} characters and may be truncated', {
                    'limit': this.options.maximum
                });
            } else {
                truncation = _('Content will not be truncated');
            }

            var words = null;
            var totalWords = content.split(' ').length;
            if (totalWords == 1) {
                words = _('{{words}} word', { 'words': totalWords });
            } else {
                words = _('{{words}} words', { 'words': totalWords });
            }

            var sentences = null;
            var totalSentences = content.split('. ').length;
            if (totalSentences == 1) {
                sentences = _('{{sentences}} sentences', { 'sentences': totalSentences });
            } else {
                sentences = _('{{sentences}} sentences', { 'sentences': totalSentences });
            }

            var characters = null;
            if (charactersRemaining >= 0 || !typeIsNumber(charactersRemaining)) {
                characters = _('{{characters}} characters, {{charactersRemaining}} remaining', {
                    'characters': content.length,
                    'charactersRemaining': charactersRemaining
                });
            } else {
                characters = _('{{characters}} characters, {{charactersRemaining}} over the recommended limit', {
                    'characters': content.length,
                    'charactersRemaining': charactersRemaining * -1
                });
            }

            return $(this.editor.getTemplate('statistics.dialog', {
                'characters': characters,
                'words': words,
                'sentences': sentences,
                'truncation': truncation
            }));
        }
    }
});
/**
 * @fileOverview UI Component for a tag-change select menu
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */
$.ui.editor.registerUi({

    /**
     * @name $.editor.plugin.tagMenu
     * @augments $.ui.editor.defaultPlugin
     * @class Select menu allowing users to change the tag for selection
     */
    tagMenu: /** @lends $.editor.plugin.tagMenu.prototype */ {

        validParents: [
            'blockquote', 'body', 'button', 'center', 'dd', 'div', 'fieldset', 'form', 'iframe', 'li',
            'noframes', 'noscript', 'object', 'td', 'th'
        ],

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor) {
            editor.bind('selectionChange', this.change, this);
            editor.bind('show', this.change, this);

            var ui = this;

            return editor.uiSelectMenu({
                name: 'tagMenu',
                title: _('Change HTML tag of selected element'),
                select: $(editor.getTemplate('tagmenu.menu')),
                change: function(value) {
                    // Prevent injection of illegal tags
                    if (typeof value === 'undefined' || value === 'na') {
                        return;
                    }

                    var editingElement = editor.getElement()[0];
                    var selectedElement = selectionGetElements();
                    if (!selectionGetHtml() || selectionGetHtml() === '') {
                        // Do not attempt to modify editing element's tag
                        if ($(selectedElement)[0] === $(editingElement)[0]) {
                            return;
                        }
                        selectionSave();
                        var replacementElement = $('<' + value + '>').html(selectedElement.html());
                        selectedElement.replaceWith(replacementElement);
                        selectionRestore();
                    } else {
                        var selectedElementParent = $(selectionGetElements()[0]).parent();
                        var temporaryClass = this.options.baseClass + '-selection';
                        var replacementHtml = $('<' + value + '>').html(selectionGetHtml()).addClass(temporaryClass);

                        /*
                         * Replace selection if the selected element parent or the selected element is the editing element,
                         * instead of splitting the editing element.
                         */
                        if (selectedElementParent === editingElement ||
                            selectionGetElements()[0] === editingElement) {
                            selectionReplace(replacementHtml);
                        } else {
                            selectionReplaceWithinValidTags(replacementHtml, this.validParents);
                        }

                        selectionSelectInner(editor.getElement().find('.' + temporaryClass).removeClass(temporaryClass));
                    }

                    editor.checkChange();
                }
            });
        },

        /**
         * Content changed event
         */
        change: function() {
            var tag = selectionGetElements()[0];
            if (!tag) {
                $(this.ui.button).toggleClass('ui-state-disabled', true);
                return;
            }
            tag = tag.tagName.toLowerCase();
            if (this.ui.select.find('option[value=' + tag + ']').length) {
                this.ui.val(tag);
            } else {
                this.ui.val('na');
            }
            $(this.ui.button).toggleClass('ui-state-disabled', this.editor.getElement()[0] === selectionGetElements()[0]);
        }
    }
});
/**
 * @fileOverview Toolbar tips plugin
 * @author David Neilsen david@panmedia.co.nz
 */

/**
 * @name $.editor.plugin.toolbarTip
 * @augments $.ui.editor.defaultPlugin
 * @class Converts native tool tips to styled tool tips
 */
$.ui.editor.registerPlugin('toolbarTip', /** @lends $.editor.plugin.toolbarTip.prototype */ {

    /**
     * @see $.ui.editor.defaultPlugin#init
     */
    init: function(editor, options) {
        if ($.browser.msie) {
            return;
        }
        this.bind('show, tagTreeUpdated', function() {
            $('.ui-editor-wrapper [title]').each(function() {
                $(this).attr('data-title', $(this).attr('title'));
                $(this).removeAttr('title');
            });
        });
    }

});/**
 * @fileOverview UI Component for displaying a warning in a corner of the element when unsaved edits exist
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */
(function() {
    /**
     * The warning message node.
     * @type Element
     */
    var warning = null;

    /**
     * Amount of dirty blocks.
     * @type Element
     */
    var dirty = 0;

    /**
     * @name $.editor.plugin.unsavedEditWarning
     * @augments $.ui.editor.defaultPlugin
     * @see $.editor.plugin.unsavedEditWarning.options
     * @class
     */
    $.ui.editor.registerPlugin('unsavedEditWarning', /** @lends $.editor.plugin.unsavedEditWarning.prototype */ {

        /**
         * @see $.ui.editor.defaultPlugin#init
         */
        init: function(editor, options) {
            var plugin = this;

            if (!warning) {
                warning = $(editor.getTemplate('unsavededitwarning.warning', this.options))
                    .attr('id', editor.getUniqueId())
                    .appendTo('body')
                    .bind('mouseenter.' + editor.widgetName, function() {
                        $.ui.editor.eachInstance(function(editor) {
                            if (editor.isDirty()) {
                                editor.getElement().addClass(plugin.options.baseClass + '-dirty');
                            }
                        });
                    })
                    .bind('mouseleave.' + editor.widgetName, function() {
                        $('.' + plugin.options.baseClass + '-dirty').removeClass(plugin.options.baseClass + '-dirty');
                    });
            }

            editor.bind('dirty', function() {
                dirty++;
                if (dirty > 0) {
                    elementBringToTop(warning);
                    warning.addClass(plugin.options.baseClass + '-visible');
                }
            });

            editor.bind('cleaned', function() {
                dirty--;
                if (dirty === 0) {
                    warning.removeClass(plugin.options.baseClass + '-visible');
                }
            });
        }

    });

})();/**
 * @fileOverview View source UI component
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */
 $.ui.editor.registerUi({

    /**
     * @name $.editor.ui.viewSource
     * @augments $.ui.editor.defaultUi
     * @class Shows a dialog containing the element's markup, allowing the user to edit the source directly
     */
    viewSource: /** @lends $.editor.ui.viewSource.prototype */ {

        /**
         * @see $.ui.editor.defaultUi#init
         */
        init: function(editor, options) {
//            editor.bind('hide', this.hide, this);

            return editor.uiButton({
                title: _('View / Edit Source'),
                click: function() {
                    this.show();
                }
            });
        },

        /**
         * Show the view source dialog. Disable the button.
         */
        show: function() {
            var ui = this;

            var dialog = $(this.editor.getTemplate('viewsource.dialog', {
                baseClass: ui.options.baseClass,
                source: ui.editor.getHtml()
            }));

            var button = this.ui.button;
            $(button).button('option', 'disabled', true);

            dialog.dialog({
                modal: false,
                width: 600,
                height: 400,
                resizable: true,
                title: _('View Source'),
                autoOpen: true,
                dialogClass: ui.options.baseClass + ' ' + ui.options.dialogClass,
                buttons: [
                    {
                        text: _('Apply Source'),
                        click: function() {
                            var html = $(this).find('textarea').val();
                            ui.editor.setHtml(html);
                            $(this).find('textarea').val(ui.editor.getHtml());
                        }
                    },
                    {
                        text: _('Close'),
                        click: function() {
                            $(this).dialog('close');
                        }
                    }
                ],
                open: function() {
                    var buttons = $(this).parent().find('.ui-dialog-buttonpane');
                    buttons.find('button:eq(0)').button({ icons: { primary: 'ui-icon-circle-check' }});
                    buttons.find('button:eq(1)').button({ icons: { primary: 'ui-icon-circle-close' }});
                },
                close: function() {
                    $(this).dialog('destroy').remove();
                    $(button).button('option', 'disabled', false);
                    ui.editor.checkChange();
                }
            });
        }
    }
});/**
 * @fileOverview Cleaning helper functions.
 * @author David Neilsen - david@panmedia.co.nz
 * @author Michael Robinson - michael@panmedia.co.nz
 */

/**
 * Replaces elements in another elements. E.g.
 *
 * @example
 * cleanReplaceElements('.content', {
 *     'b': '<strong/>',
 *     'i': '<em/>',
 * });
 *
 * @param  {jQuery|Element|Selector} selector The element to be find and replace in.
 * @param  {Object} replacements A map of selectors to replacements. The replacement
 *   can be a jQuery object, an element, or a selector.
 */
function cleanReplaceElements(selector, replacements) {
    for (var find in replacements) {
        var replace = replacements[find];
        var i = 0;
        do {
            var found = $(selector).find(find);
            if (found.length) {
                found = $(found.get(0));
                var clone = $(replace).clone();
                clone.html(found.html());
                clone.attr(elementGetAttributes(found));
                found.replaceWith(clone);
            }
        } while(found.length);
    }
}

/**
 * Unwrap function. Currently just wraps jQuery.unwrap() but may be extended in future.
 *
 * @param  {jQuery|Element|Selector} selector The element to unwrap.
 */
function cleanUnwrapElements(selector) {
    $(selector).unwrap();
}
/**
 * @fileOverview Element manipulation helper functions.
 * @author David Neilsen - david@panmedia.co.nz
 * @author Michael Robinson - michael@panmedia.co.nz
 */

/**
 * Remove comments from element.
 *
 * @param  {jQuery} parent The jQuery element to have comments removed from.
 * @return {jQuery} The modified parent.
 */
function elementRemoveComments(parent) {
    parent.contents().each(function() {
        if (this.nodeType == 8) {
            $(this).remove();
        }
    });
    parent.children().each(function() {
        element.removeComments($(this));
    });
    return parent;
}

/**
 * Remove all but the allowed attributes from the parent.
 *
 * @param {jQuery} parent The jQuery element to cleanse of attributes.
 * @param {String[]|null} allowedAttributes An array of allowed attributes.
 * @return {jQuery} The modified parent.
 */
function elementRemoveAttributes(parent, allowedAttributes) {
    parent.children().each(function() {
        var stripAttributes = $.map(this.attributes, function(item) {
            if ($.inArray(item.name, allowedAttributes) === -1) {
                return item.name;
            }
        });
        var child = $(this);
        $.each(stripAttributes, function(i, attributeName) {
            child.removeAttr(attributeName);
        });
        element.removeAttributes($(this), allowedAttributes);
    });
    return parent;
}

/**
 * Sets the z-index CSS property on an element to 1 above all its sibling elements.
 *
 * @param {jQuery} element The jQuery element to cleanse of attributes.
 */
function elementBringToTop(element) {
    var zIndex = 1;
    element.siblings().each(function() {
        var z = $(this).css('z-index');
        if (!isNaN(z) && z > zIndex) {
            zIndex = z + 1;
        }
    });
    element.css('z-index', zIndex);
}

/**
 * @param  {jQuery} element The jQuery element to retrieve the outer HTML from.
 * @return {String} The outer HTML.
 */
function elementOuterHtml(element) {
    return element.clone().wrap('<div/>').parent().html();
}

/**
 * @param  {jQuery} element The jQuery element to retrieve the outer text from.
 * @return {String} The outer text.
 */
function elementOuterText(element) {
    return element.clone().wrap('<div/>').parent().text();
}

/**
 * Determine whether element is block.
 *
 * @param  {Element} element The element to test.
 * @return {Boolean} True if the element is a block element
 */
function elementIsBlock(element) {
    return elementDefaultDisplay(element.tagName) === 'block';
}

/**
 * Determine whether element is inline or block.
 *
 * @see http://stackoverflow.com/a/2881008/187954
 * @param  {string} tag Lower case tag name, e.g. 'a'.
 * @return {string} Default display style for tag.
 */
function elementDefaultDisplay(tag) {
    var cStyle,
        t = document.createElement(tag),
        gcs = "getComputedStyle" in window;

    document.body.appendChild(t);
    cStyle = (gcs ? window.getComputedStyle(t, "") : t.currentStyle).display;
    document.body.removeChild(t);

    return cStyle;
}

/**
 * Check that the given element is one of the the given tags.
 *
 * @param  {jQuery|Element} element The element to be tested.
 * @param  {Array}  validTagNames An array of valid tag names.
 * @return {Boolean} True if the given element is one of the give valid tags.
 */
function elementIsValid(element, validTags) {
    return -1 !== $.inArray($(element)[0].tagName.toLowerCase(), validTags);
}

/**
 * Calculate and return the visible rectangle for the element.
 *
 * @param  {jQuery|Element} element The element to calculate the visible rectangle for.
 * @return {Object} Visible rectangle for the element.
 */
function elementVisibleRect(element) {

    element = $(element);

    var rect = {
        top: Math.round(element.offset().top),
        left: Math.round(element.offset().left),
        width: Math.round(element.outerWidth()),
        height: Math.round(element.outerHeight())
    };


    var scrollTop = $(window).scrollTop();
    var windowHeight = $(window).height();
    var scrollBottom = scrollTop + windowHeight;
    var elementBottom = Math.round(rect.height + rect.top);

    // If top & bottom of element are within the viewport, do nothing.
    if (scrollTop < rect.top && scrollBottom > elementBottom) {
        return rect;
    }

    // Top of element is outside the viewport
    if (scrollTop > rect.top) {
        rect.top = scrollTop;
    }

    // Bottom of element is outside the viewport
    if (scrollBottom < elementBottom) {
        rect.height = scrollBottom - rect.top;
    } else {
        // Bottom of element inside viewport
        rect.height = windowHeight - (scrollBottom - elementBottom);
    }

    return rect;
}

/**
 * Returns a map of an elements attributes and values. The result of this function
 * can be passed directly to $('...').attr(result);
 *
 * @param  {jQuery|Element|Selector} element The element to get the attributes from.
 * @return {Object} A map of attribute names mapped to their values.
 */
function elementGetAttributes(element) {
    var attributes = $(element).get(0).attributes,
        result = {};
    for (var i = 0, l = attributes.length; i < l; i++) {
        result[attributes[i].name] = attributes[i].value;
    }
    return result;
}

/**
 * FIXME: this function needs reviewing
 * @param {jQuerySelector|jQuery|Element} element
 */
function elementGetStyles(element) {
    var result = {};
    var style = window.getComputedStyle(element[0], null);
    for (var i = 0; i < style.length; i++) {
        result[style.item(i)] = style.getPropertyValue(style.item(i));
    }
    return result;
}

/**
 * Wraps the inner content of an element with a tag
 *
 * @param {jQuerySelector|jQuery|Element} element The element(s) to wrap
 * @param {String} tag The wrapper tag name
 */
function elementWrapInner(element, tag) {
    selectionSave();
    $(element).each(function() {
        var wrapper = $('<' + tag + '/>').html($(this).html());
        element.html(wrapper);
    });
    selectionRestore();
}

/**
 * FIXME: this function needs reviewing
 * @public @static
 * @param {jQuerySelector|jQuery|Element} element The jQuery element to insert
 */
function elementToggleStyle(element, styles) {
    $.each(styles, function(property, value) {
        if ($(element).css(property) === value) {
            $(element).css(property, '');
        } else {
            $(element).css(property, value);
        }
    });
}

/**
 * @param {jQuerySelector|jQuery|Element} element1
 * @param {jQuerySelector|jQuery|Element} element2
 * @param {Object} style
 */
function elementSwapStyles(element1, element2, style) {
    for (var name in style) {
        element1.css(name, element2.css(name));
        element2.css(name, style[name]);
    }
}
/**
 * @fileOverview DOM fragment manipulation helper functions
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Convert a DOMFragment to an HTML string. Optinally wraps the tring in a tag.
 *
 */
function fragmentToHtml(domFragment, tag) {
    var html = '';
    // Get all nodes in the extracted content
    for (var j = 0, l = domFragment.childNodes.length; j < l; j++) {
        var node = domFragment.childNodes.item(j);
        var content = node.nodeType === 3 ? node.nodeValue : elementOuterHtml($(node));
        if (content) {
            html += content;
        }
    }
    if (tag) {
        html = $('<' + tag + '>' + html + '</' + tag + '>');
        html.find('p').wrapInner('<' + tag + '/>');
        html.find('p > *').unwrap();
        html = $('<div/>').html(html).html();
    }
    return html;
}

/**
 *
 *
 * @public @static
 * @param {DOMFragment} domFragment
 * @param {jQuerySelector|jQuery|Element} beforeElement
 * @param {String} wrapperTag
 */
function fragmentInsertBefore(domFragment, beforeElement, wrapperTag) {
    // Get all nodes in the extracted content
    for (var j = 0, l = domFragment.childNodes.length; j < l; j++) {
        var node = domFragment.childNodes.item(j);
        // Prepend the node before the current node
        var content = node.nodeType === 3 ? node.nodeValue : $(node).html();
        if (content) {
            $('<' + wrapperTag + '/>')
                .html($.trim(content))
                .insertBefore(beforeElement);
        }
    }
}/**
 * @fileOverview Range manipulation helper functions.
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Expands a range to to surround all of the content from its start container
 * to its end container.
 *
 * @public @static
 * @param {RangyRange} range The range to expand
 */
function rangeExpandToParent(range) {
    range.setStartBefore(range.startContainer);
    range.setEndAfter(range.endContainer);
}

function rangeExpandTo(range, elements) {
    do {
        rangeExpandToParent(range);
        for (var i = 0, l = elements.length; i < l; i++) {
            if ($(range.commonAncestorContainer).is(elements[i])) {
                return;
            }
        }
    } while (range.commonAncestorContainer);
}

function rangeReplace(html, range) {
    var nodes = $('<div/>').append(html)[0].childNodes;
    range.deleteContents();
    if (nodes.length === undefined || nodes.length === 1) {
        range.insertNode(nodes[0].cloneNode(true));
    } else {
        $.each(nodes, function(i, node) {
            range.insertNodeAtEnd(node.cloneNode(true));
        });
    }
}

function rangeEmptyTag(range) {
    var contents = range.cloneContents();
    var html = fragmentToHtml(contents);
    if (typeof html === 'string') {
        html = html.replace(/([ #;&,.+*~\':"!^$[\]()=>|\/@])/g,'\\$1');
    }
    if ($(html).is(':empty')) return true;
    return false;
}

/**
 * Works for single ranges only.
 * @return {Element} The selected range's common ancestor.
 */
function rangeGetCommonAncestor(selection) {
    selection = selection || rangy.getSelection();

    var commonAncestor;
    $(selection.getAllRanges()).each(function(i, range){
        if (this.commonAncestorContainer.nodeType === 3) {
            commonAncestor = $(range.commonAncestorContainer).parent()[0];
        } else {
            commonAncestor = range.commonAncestorContainer;
        }
    });

    return commonAncestor;
}

/**
 * Returns true if the supplied range is empty (has a length of 0)
 *
 * @public @static
 * @param {RangyRange} range The range to check if it is empty
 */
function rangeIsEmpty(range) {
    return range.startOffset === range.endOffset &&
           range.startContainer === range.endContainer;
}
/**
 * @fileOverview Selection manipulation helper functions.
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */
/**
 * @type {Boolean|Object} current saved selection.
 */
var savedSelection = false;

/**
 * Save selection wrapper, preventing plugins / UI from accessing rangy directly.
 */
function selectionSave(overwrite) {
    if (savedSelection && !overwrite) return;
    savedSelection = rangy.saveSelection();
}

/**
 * Restore selection wrapper, preventing plugins / UI from accessing rangy directly.
 */
function selectionRestore() {
    if (savedSelection) {
        rangy.restoreSelection(savedSelection);
        savedSelection = false;
    }
}

/**
 * Reset saved selection.
 */
function selectionDestroy() {
    if (savedSelection) {
        rangy.removeMarkers(savedSelection);
    }
    savedSelection = false;
}

function selectionSaved() {
    return savedSelection !== false;
}

/**
 * Iterates over all ranges in a selection and calls the callback for each
 * range. The selection/range offsets is updated in every iteration in in the
 * case that a range was changed or removed by a previous iteration.
 *
 * @public @static
 * @param {function} callback The function to call for each range. The first and only parameter will be the current range.
 * @param {RangySelection} [selection] A RangySelection, or by default, the current selection.
 * @param {object} [context] The context in which to call the callback.
 */
function selectionEachRange(callback, selection, context) {
    selection = selection || rangy.getSelection();
    var range, i = 0;
    // Create a new range set every time to update range offsets
    while (range = selection.getAllRanges()[i++]) {
        callback.call(context, range);
    }
}

function selectionSet(mixed) {
    rangy.getSelection().setSingleRange(mixed);
}

/**
 * FIXME: this function needs reviewing
 * @public @static
 */
function selectionReplace(html, sel) {
    selectionEachRange(function(range) {
        rangeReplace(html, range);
    }, sel, this);
}

/**
 * Selects all the contents of the supplied element, excluding the element itself.
 *
 * @public @static
 * @param {jQuerySelector|jQuery|Element} element
 * @param {RangySelection} [selection] A RangySelection, or by default, the current selection.
 */
function selectionSelectInner(element, selection) {
    selection = selection || rangy.getSelection();
    selection.removeAllRanges();
    $(element).focus().contents().each(function() {
        var range = rangy.createRange();
        range.selectNodeContents(this);
        selection.addRange(range);
    });
}

/**
 * Selects all the contents of the supplied element, including the element itself.
 *
 * @public @static
 * @param {jQuerySelector|jQuery|Element} element
 * @param {RangySelection} [selection] A RangySelection, or null to use the current selection.
 */
function selectionSelectOuter(element, selection) {
    selection = selection || rangy.getSelection();
    selection.removeAllRanges();
    $(element).each(function() {
        var range = rangy.createRange();
        range.selectNode(this);
        selection.addRange(range);
    }).focus();
}

/**
 * Move selection to the start or end of element.
 *
 * @param  {jQuerySelector|jQuery|Element} element The subject element.
 * @param  {RangySelection|null} selection A RangySelection, or null to use the current selection.
 * @param {Boolean} start True to select the start of the element.
 */
function selectionSelectEdge(element, selection, start) {
    selection = selection || rangy.getSelection();
    selection.removeAllRanges();

    $(element).each(function() {
        var range = rangy.createRange();
        range.selectNodeContents(this);
        range.collapse(start);
        selection.addRange(range);
    });
}

/**
 * Move selection to the end of element.
 *
 * @param  {jQuerySelector|jQuery|Element} element The subject element.
 * @param  {RangySelection|null} selection A RangySelection, or null to use the current selection.
 */
function selectionSelectEnd(element, selection) {
    selectionSelectEdge(element, selection, false);
}

/**
 * Move selection to the start of element.
 *
 * @param  {jQuerySelector|jQuery|Element} element The subject element.
 * @param  {RangySelection|null} selection A RangySelection, or null to use the current selection.
 */
function selectionSelectStart(element, selection) {
    selectionSelectEdge(element, selection, true);
}

/**
 * @param  {RangySelection|null} selection Selection to get html from or null to use current selection.
 * @return {string} The html content of the selection.
 */
function selectionGetHtml(selection) {
    selection = selection || rangy.getSelection();
    return selection.toHtml();
}

function selectionGetElement(range) {
    var commonAncestor;

    range = range || rangy.getSelection().getRangeAt(0);

    // Check if the common ancestor container is a text node
    if (range.commonAncestorContainer.nodeType === 3) {
        // Use the parent instead
        commonAncestor = range.commonAncestorContainer.parentNode;
    } else {
        commonAncestor = range.commonAncestorContainer;
    }
    return $(commonAncestor);
}

/**
 * Gets all elements that contain a selection (excluding text nodes) and
 * returns them as a jQuery array.
 *
 * @public @static
 * @param {RangySelection} [sel] A RangySelection, or by default, the current selection.
 */
function selectionGetElements(selection) {
    var result = new jQuery();
    selectionEachRange(function(range) {
        result.push(selectionGetElement(range)[0]);
    }, selection, this);
    return result;
}

function selectionGetStartElement() {
    var selection = rangy.getSelection();
    if (selection.anchorNode === null) {
        return null;
    }
    if (selection.isBackwards()) {
        return selection.focusNode.nodeType === 3 ? $(selection.focusNode.parentElement) : $(selection.focusNode);
    }
    if (!selection.anchorNode) console.trace();
    return selection.anchorNode.nodeType === 3 ? $(selection.anchorNode.parentElement) : $(selection.anchorNode);
}

function selectionGetEndElement() {
    var selection = rangy.getSelection();
    if (selection.anchorNode === null) {
        return null;
    }
    if (selection.isBackwards()) {
        return selection.anchorNode.nodeType === 3 ? $(selection.anchorNode.parentElement) : $(selection.anchorNode);
    }
    return selection.focusNode.nodeType === 3 ? $(selection.focusNode.parentElement) : $(selection.focusNode);
}

function selectionAtEndOfElement() {
    var selection = rangy.getSelection();
    var focusNode = selection.isBackwards() ? selection.anchorNode : selection.focusNode;
    var focusOffset = selection.isBackwards() ? selection.focusOffset : selection.anchorOffset;
    if (focusOffset !== focusNode.textContent.length) {
        return false;
    }
    var previous = focusNode.nextSibling;
    if (!previous || $(previous).html() === '') {
        return true;
    } else {
        return false;
    }
}

function selectionAtStartOfElement() {
    var selection = rangy.getSelection();
    var anchorNode = selection.isBackwards() ? selection.focusNode : selection.anchorNode;
    if (selection.isBackwards() ? selection.focusOffset : selection.anchorOffset !== 0) {
        return false;
    }
    var previous = anchorNode.previousSibling;
    if (!previous || $(previous).html() === '') {
        return true;
    } else {
        return false;
    }
}

function selectionIsEmpty() {
    return rangy.getSelection().toHtml() === '';
}

/**
 * FIXME: this function needs reviewing
 *
 * This should toggle an inline style, and normalise any overlapping tags, or adjacent (ignoring white space) tags.
 *
 * @public @static
 */
function selectionToggleWrapper(tag, options) {
    options = options || {};
    var applier = rangy.createCssClassApplier(options.classes || '', {
        normalize: true,
        elementTagName: tag,
        elementProperties: options.attributes || {}
    });
    selectionEachRange(function(range) {
        if (rangeEmptyTag(range)) {
            var element = $('<' + tag + '/>')
                .addClass(options.classes)
                .attr(options.attributes || {})
                .append(fragmentToHtml(range.cloneContents()));
            rangeReplace(element, range);
        } else {
            applier.toggleRange(range);
        }
    }, null, this);
}

function selectionWrapTagWithAttribute(tag, attributes, classes) {
    selectionEachRange(function(range) {
        var element = selectionGetElement(range);
        if (element.is(tag)) {
            element.attr(attributes);
        } else {
            selectionToggleWrapper(tag, {
                classes: classes,
                attributes: attributes
            });
        }
    }, null, this);
}

/**
 * Returns true if there is at least one range selected and the range is not
 * empty.
 *
 * @see rangeIsEmpty
 * @public @static
 * @param {RangySelection} [selection] A RangySelection, or by default, the current selection.
 */
function selectionExists(sel) {
    var selectionExists = false;
    selectionEachRange(function(range) {
        if (!rangeIsEmpty(range)) selectionExists = true;
    }, sel, this);
    return selectionExists;
}

/**
 * Split the selection container and insert the given html between the two elements created.
 * @param  {jQuery|Element|string} html The html to replace selection with.
 * @param  {RangySelection|null} selection The selection to replace, or null for the current selection.
 */
function selectionReplaceSplittingSelectedElement(html, selection) {
    selection = selection || rangy.getSelection();

    var selectionRange = selection.getRangeAt(0);
    var selectedElement = selectionGetElements()[0];

    // Select from start of selected element to start of selection
    var startRange = rangy.createRange();
    startRange.setStartBefore(selectedElement);
    startRange.setEnd(selectionRange.startContainer, selectionRange.startOffset);
    var startFragment = startRange.cloneContents();

    // Select from end of selected element to end of selection
    var endRange = rangy.createRange();
    endRange.setStart(selectionRange.endContainer, selectionRange.endOffset);
    endRange.setEndAfter(selectedElement);
    var endFragment = endRange.cloneContents();

    // Replace the start element's html with the content that was not selected, append html & end element's html
    var replacement = elementOuterHtml($(fragmentToHtml(startFragment)));
    replacement += elementOuterHtml($(html));
    replacement += elementOuterHtml($(fragmentToHtml(endFragment)));

    $(selectedElement).replaceWith($(replacement));
}

/**
 * Replace current selection with given html, ensuring that selection container is split at
 * the start & end of the selection in cases where the selection starts / ends within an invalid element.
 * @param  {jQuery|Element|string} html The html to replace current selection with.
 * @param  {Array} validTagNames An array of tag names for tags that the given html may be inserted into without having the selection container split.
 * @param  {RangySeleciton|null} selection The selection to replace, or null for the current selection.
 */
function selectionReplaceWithinValidTags(html, validTagNames, selection) {
    selection = selection || rangy.getSelection();

    var startElement = selectionGetStartElement()[0];
    var endElement = selectionGetEndElement()[0];
    var selectedElement = selectionGetElements()[0];

    var selectedElementValid = elementIsValid(selectedElement, validTagNames);
    var startElementValid = elementIsValid(startElement, validTagNames);
    var endElementValid = elementIsValid(endElement, validTagNames);

    // The html may be inserted within the selected element & selection start / end.
    if (selectedElementValid && startElementValid && endElementValid) {
        selectionReplace(html);
        return;
    }

    // Context is invalid. Split containing element and insert list in between.
    selectionReplaceSplittingSelectedElement(html, selection);
    return;
}

/**
 * Toggles style(s) on the first block level parent element of each range in a selection
 *
 * @public @static
 * @param {Object} styles styles to apply
 * @param {jQuerySelector|jQuery|Element} limit The parent limit element.
 * If there is no block level elements before the limit, then the limit content
 * element will be wrapped with a "div"
 */
function selectionToggleBlockStyle(styles, limit) {
    selectionEachRange(function(range) {
        var parent = $(range.commonAncestorContainer);
        while (parent.length && parent[0] !== limit[0] && (
                parent[0].nodeType === 3 || parent.css('display') === 'inline')) {
            parent = parent.parent();
        }
        if (parent[0] === limit[0]) {
            // Only apply block style if the limit element is a block
            if (limit.css('display') !== 'inline') {
                // Wrap the HTML inside the limit element
                elementWrapInner(limit, 'div');
                // Set the parent to the wrapper
                parent = limit.children().first();
            }
        }
        // Apply the style to the parent
        elementToggleStyle(parent, styles);
    }, null, this);
}

/**
 * Removes all ranges from a selection that are not contained within the
 * supplied element.
 *
 * @public @static
 * @param {jQuerySelector|jQuery|Element} element
 * @param {RangySelection} [selection]
 */
function selectionConstrain(element, selection) {
    element = $(element)[0];
    selection = selection || (rangy) ? rangy.getSelection() : null;

    if (!selection) {
        return;
    }

    var commonAncestor;
    $(selection.getAllRanges()).each(function(i, range){
        if (this.commonAncestorContainer.nodeType === 3) {
            commonAncestor = $(range.commonAncestorContainer).parent()[0];
        } else {
            commonAncestor = range.commonAncestorContainer;
        }
        if (element !== commonAncestor && !$.contains(element, commonAncestor)) {
            selection.removeRange(range);
        }
    });
}
/**
 * @fileOverview String helper functions
 * @author David Neilsen - david@panmedia.co.nz
 * @author Michael Robinson - michael@panmedia.co.nz
 */

/**
 * Modification of strip_tags from PHP JS - http://phpjs.org/functions/strip_tags:535.
 * @param  {string} content HTML containing tags to be stripped
 * @param {Array} allowedTags Array of tags that should not be stripped
 * @return {string} HTML with all tags not present allowedTags array.
 */
function stringStripTags(content, allowedTags) {
    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    allowed = [];
    for (var allowedTagsIndex = 0; allowedTagsIndex < allowedTags.length; allowedTagsIndex++) {
        if (allowedTags[allowedTagsIndex].match(/[a-z][a-z0-9]{0,}/g)) {
            allowed.push(allowedTags[allowedTagsIndex]);
        }
    }
    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*\/?>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

    return content.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf($1.toLowerCase()) > -1 ? $0 : '';
    });
}/**
 * @fileOverview Type checking functions.
 * @author Michael Robinson michael@panmedia.co.nz
 * @author David Neilsen david@panmedia.co.nz
 */

/**
 * Determine whether object is a number {@link http://stackoverflow.com/a/1421988/187954}.
 * @param  {mixed} object The object to be tested
 * @return {Boolean} True if the object is a number.
 */
function typeIsNumber(object) {
    return !isNaN(object - 0) && object !== null;
}
function Button() {
    return {
        init: function() {
            console.log(this);
        }
    };
};

                })(jQuery, window, rangy);
            jQuery('<style type="text/css">/* Non styles */\n\
/**\n\
 * Style global variables\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
/* Base style */\n\
/**\n\
 * Main editor layout\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 * @author Michael Robinson <michael@panmedia.co.nz>\n\
 */\n\
/******************************************************************************\\n\
 * Editor toolbar\n\
\******************************************************************************/\n\
.ui-editor-wrapper {\n\
  overflow: visible;\n\
  z-index: 1001;\n\
  position: fixed; }\n\
  .ui-editor-wrapper .ui-editor-toolbar {\n\
    padding: 6px 0 0 5px;\n\
    overflow: visible; }\n\
  .ui-editor-wrapper .ui-editor-toolbar,\n\
  .ui-editor-wrapper .ui-editor-toolbar * {\n\
    -webkit-user-select: none;\n\
    -moz-user-select: none;\n\
    user-select: none; }\n\
  .ui-editor-wrapper .ui-dialog-titlebar .ui-editor-element-path:first-child {\n\
    margin-left: 5px; }\n\
  .ui-editor-wrapper .ui-dialog-titlebar .ui-editor-element-path {\n\
    min-width: 10px;\n\
    min-height: 15px;\n\
    display: inline-block; }\n\
\n\
.ui-editor-dock-docked-to-element .ui-editor-toolbar {\n\
  padding: 5px 0 0 5px!important; }\n\
  .ui-editor-dock-docked-to-element .ui-editor-toolbar .ui-editor-group {\n\
    margin: 0 5px 5px 0; }\n\
\n\
.ui-editor-dock-docked-element {\n\
  display: block !important;\n\
  border: 0 none transparent;\n\
  -webkit-box-sizing: border-box;\n\
  -moz-box-sizing: border-box;\n\
  box-sizing: border-box; }\n\
\n\
/******************************************************************************\\n\
 * Inputs\n\
\******************************************************************************/\n\
.ui-editor-wrapper textarea,\n\
.ui-editor-wrapper input {\n\
  padding: 5px; }\n\
\n\
/******************************************************************************\\n\
 * Dialogs\n\
\******************************************************************************/\n\
.ui-editor-wrapper .ui-dialog-content {\n\
  font-size: 13px; }\n\
.ui-editor-wrapper textarea {\n\
  display: -webkit-box;\n\
  display: -moz-box;\n\
  display: -ms-box;\n\
  display: box;\n\
  -webkit-box-flex: 1;\n\
  -moz-box-flex: 1;\n\
  -ms-box-flex: 1;\n\
  box-flex: 1; }\n\
\n\
html body div.ui-dialog div.ui-dialog-titlebar a.ui-dialog-titlebar-close span.ui-icon {\n\
  margin-top: 0!important; }\n\
\n\
/**\n\
 * Main editor styles\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 * @author Michael Robinson <michael@panmedia.co.nz>\n\
 */\n\
.ui-editor-editing {\n\
  outline: none; }\n\
\n\
/******************************************************************************\\n\
 * Inputs\n\
\******************************************************************************/\n\
.ui-editor-wrapper textarea,\n\
.ui-editor-wrapper input {\n\
  border: 1px solid #D4D4D4; }\n\
\n\
/******************************************************************************\\n\
 * Dialogs\n\
\******************************************************************************/\n\
.ui-editor-wrapper .ui-dialog-content {\n\
  font-size: 13px; }\n\
\n\
html body div.ui-wrapper div.ui-dialog-titlebar a.ui-dialog-titlebar-close span.ui-icon {\n\
  margin-top: 0!important; }\n\
\n\
/* Components */\n\
/**\n\
 * Toolbar/path selection bar wrapper\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
/**\n\
 * Path selection bar\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-path {\n\
  padding: 5px;\n\
  font-size: 13px; }\n\
\n\
/**\n\
 * Select menu UI widget styles\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-selectmenu {\n\
  overflow: visible;\n\
  position: relative; }\n\
\n\
.ui-editor-selectmenu-button {\n\
  text-align: left;\n\
  padding: 3px 18px 5px 5px !important;\n\
  float: none !important; }\n\
  .ui-editor-selectmenu-button .ui-icon {\n\
    position: absolute;\n\
    right: 1px;\n\
    top: 8px; }\n\
  .ui-editor-selectmenu-button .ui-editor-selectmenu-text {\n\
    font-size: 13px; }\n\
\n\
.ui-editor-selectmenu-wrapper {\n\
  position: relative; }\n\
\n\
.ui-editor-selectmenu-button .ui-button-text {\n\
  padding: 0 25px 0 5px; }\n\
\n\
.ui-editor-selectmenu-button .ui-icon {\n\
  background-repeat: no-repeat; }\n\
\n\
.ui-editor-selectmenu-menu {\n\
  position: absolute;\n\
  top: 100%;\n\
  left: 0;\n\
  right: auto;\n\
  display: none;\n\
  margin-top: -1px !important; }\n\
\n\
.ui-editor-selectmenu-visible .ui-editor-selectmenu-menu {\n\
  display: block;\n\
  z-index: 1; }\n\
\n\
.ui-editor-selectmenu-menu-item {\n\
  padding: 5px;\n\
  margin: 3px;\n\
  z-index: 1;\n\
  text-align: left;\n\
  font-size: 13px;\n\
  font-weight: normal !important;\n\
  border: 1px solid transparent;\n\
  cursor: pointer;\n\
  background-color: inherit; }\n\
\n\
.ui-editor-selectmenu-button {\n\
  background: #f5f5f5;\n\
  border: 1px solid #ccc; }\n\
\n\
.ui-editor-buttonset .ui-editor-selectmenu-visible .ui-editor-selectmenu-button {\n\
  -moz-border-radius-bottomleft: 0;\n\
  -webkit-border-bottom-left-radius: 0;\n\
  border-bottom-left-radius: 0;\n\
  -moz-border-radius-bottomright: 0;\n\
  -webkit-border-bottom-right-radius: 0;\n\
  border-bottom-right-radius: 0; }\n\
\n\
/**\n\
 * Button UI widget styles\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-buttonset {\n\
  float: left;\n\
  margin: 0 5px 4px 0;\n\
  display: inline-block; }\n\
  .ui-editor-buttonset > .ui-button {\n\
    float: left;\n\
    display: block;\n\
    margin: 0 -1px 0 0;\n\
    font-size: 13px; }\n\
  .ui-editor-buttonset .ui-button:hover {\n\
    z-index: 1; }\n\
  .ui-editor-buttonset .ui-editor-selectmenu {\n\
    display: block; }\n\
    .ui-editor-buttonset .ui-editor-selectmenu .ui-button {\n\
      margin: 0 -1px 0 0; }\n\
\n\
.ui-editor-ff .ui-editor-buttonset {\n\
  float: none;\n\
  vertical-align: top; }\n\
\n\
.ui-editor-wrapper .ui-button {\n\
  height: 32px;\n\
  margin-bottom: 0;\n\
  margin-top: 0;\n\
  padding: 0;\n\
  -webkit-box-sizing: border-box;\n\
  -moz-box-sizing: border-box;\n\
  box-sizing: border-box; }\n\
.ui-editor-wrapper .ui-button-icon-only {\n\
  width: 32px; }\n\
\n\
.ui-editor-wrapper .ui-editor-buttonset > .ui-button {\n\
  -webkit-border-radius: 0;\n\
  -moz-border-radius: 0;\n\
  -ms-border-radius: 0;\n\
  -o-border-radius: 0;\n\
  border-radius: 0; }\n\
  .ui-editor-wrapper .ui-editor-buttonset > .ui-button:first-child {\n\
    -moz-border-radius-topleft: 5px;\n\
    -webkit-border-top-left-radius: 5px;\n\
    border-top-left-radius: 5px;\n\
    -moz-border-radius-bottomleft: 5px;\n\
    -webkit-border-bottom-left-radius: 5px;\n\
    border-bottom-left-radius: 5px; }\n\
  .ui-editor-wrapper .ui-editor-buttonset > .ui-button:last-child {\n\
    -moz-border-radius-topright: 5px;\n\
    -webkit-border-top-right-radius: 5px;\n\
    border-top-right-radius: 5px;\n\
    -moz-border-radius-bottomright: 5px;\n\
    -webkit-border-bottom-right-radius: 5px;\n\
    border-bottom-right-radius: 5px; }\n\
\n\
.ui-button-icon-only .ui-button-text {\n\
  display: none; }\n\
\n\
/**\n\
 * Unsupported warning styles\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
/* Layout */\n\
.ui-editor-unsupported {\n\
  position: relative; }\n\
\n\
.ui-editor-unsupported-overlay {\n\
  position: fixed;\n\
  top: 0;\n\
  left: 0;\n\
  bottom: 0;\n\
  right: 0;\n\
  background-color: black;\n\
  filter: alpha(opacity=50);\n\
  opacity: 0.5; }\n\
\n\
.ui-editor-unsupported-content {\n\
  position: fixed;\n\
  top: 50%;\n\
  left: 50%;\n\
  margin: -200px 0 0 -300px;\n\
  width: 600px;\n\
  height: 400px; }\n\
\n\
.ui-editor-unsupported-input {\n\
  position: absolute;\n\
  bottom: 10px; }\n\
\n\
/* Style */\n\
.ui-editor-unsupported-content {\n\
  padding: 10px;\n\
  background-color: white;\n\
  border: 1px solid #777; }\n\
\n\
/**\n\
 * Message widget styles\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
/******************************************************************************\\n\
 * Messages\n\
\******************************************************************************/\n\
.ui-editor-messages {\n\
  margin: 0;\n\
  /* Error */\n\
  /* Confirm */\n\
  /* Information */\n\
  /* Warning */\n\
  /* Loading */ }\n\
  .ui-editor-messages .ui-editor-message-close {\n\
    cursor: pointer;\n\
    float: right; }\n\
  .ui-editor-messages .ui-icon {\n\
    margin: 0 0 3px 3px; }\n\
  .ui-editor-messages .ui-icon,\n\
  .ui-editor-messages .ui-editor-message {\n\
    display: inline-block;\n\
    vertical-align: top; }\n\
  .ui-editor-messages .ui-editor-message-wrapper {\n\
    padding: 3px 3px 3px 1px;\n\
    -webkit-box-shadow: inset 0 -1px 1px rgba(0, 0, 0, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.5);\n\
    -moz-box-shadow: inset 0 -1px 1px rgba(0, 0, 0, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.5);\n\
    box-shadow: inset 0 -1px 1px rgba(0, 0, 0, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.5); }\n\
  .ui-editor-messages .ui-editor-message-wrapper:first-child {\n\
    -moz-border-radius-topright: 5px;\n\
    -webkit-border-top-right-radius: 5px;\n\
    border-top-right-radius: 5px;\n\
    -moz-border-radius-topleft: 5px;\n\
    -webkit-border-top-left-radius: 5px;\n\
    border-top-left-radius: 5px; }\n\
  .ui-editor-messages .ui-editor-message-wrapper:last-child {\n\
    -moz-border-radius-bottomright: 5px;\n\
    -webkit-border-bottom-right-radius: 5px;\n\
    border-bottom-right-radius: 5px;\n\
    -moz-border-radius-bottomleft: 5px;\n\
    -webkit-border-bottom-left-radius: 5px;\n\
    border-bottom-left-radius: 5px; }\n\
  .ui-editor-messages .ui-editor-message-circle-close {\n\
    /* Red */\n\
    background: url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjUwJSIgeTE9IjAlIiB4Mj0iNTAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmNWQ0YiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2ZhMWMxYyIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');\n\
    background: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, #ff5d4b), color-stop(100%, #fa1c1c));\n\
    background: -webkit-linear-gradient(top, #ff5d4b, #fa1c1c);\n\
    background: -moz-linear-gradient(top, #ff5d4b, #fa1c1c);\n\
    background: -o-linear-gradient(top, #ff5d4b, #fa1c1c);\n\
    background: linear-gradient(top, #ff5d4b, #fa1c1c); }\n\
  .ui-editor-messages .ui-editor-message-circle-check {\n\
    /* Green */\n\
    background: url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjUwJSIgeTE9IjAlIiB4Mj0iNTAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2NkZWI4ZSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2E1Yzk1NiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');\n\
    background: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, #cdeb8e), color-stop(100%, #a5c956));\n\
    background: -webkit-linear-gradient(top, #cdeb8e, #a5c956);\n\
    background: -moz-linear-gradient(top, #cdeb8e, #a5c956);\n\
    background: -o-linear-gradient(top, #cdeb8e, #a5c956);\n\
    background: linear-gradient(top, #cdeb8e, #a5c956); }\n\
  .ui-editor-messages .ui-editor-message-info {\n\
    /* Blue */\n\
    background: url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjUwJSIgeTE9IjAlIiB4Mj0iNTAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2E5ZTRmNyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzBmYjRlNyIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');\n\
    background: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, #a9e4f7), color-stop(100%, #0fb4e7));\n\
    background: -webkit-linear-gradient(top, #a9e4f7, #0fb4e7);\n\
    background: -moz-linear-gradient(top, #a9e4f7, #0fb4e7);\n\
    background: -o-linear-gradient(top, #a9e4f7, #0fb4e7);\n\
    background: linear-gradient(top, #a9e4f7, #0fb4e7); }\n\
  .ui-editor-messages .ui-editor-message-alert {\n\
    /* Yellow */\n\
    background: url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjUwJSIgeTE9IjAlIiB4Mj0iNTAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZDY1ZSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2ZlYmYwNCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');\n\
    background: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, #ffd65e), color-stop(100%, #febf04));\n\
    background: -webkit-linear-gradient(top, #ffd65e, #febf04);\n\
    background: -moz-linear-gradient(top, #ffd65e, #febf04);\n\
    background: -o-linear-gradient(top, #ffd65e, #febf04);\n\
    background: linear-gradient(top, #ffd65e, #febf04); }\n\
  .ui-editor-messages .ui-editor-message-clock {\n\
    /* Purple */\n\
    background: url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjUwJSIgeTE9IjAlIiB4Mj0iNTAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZiODNmYSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2U5M2NlYyIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');\n\
    background: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, #fb83fa), color-stop(100%, #e93cec));\n\
    background: -webkit-linear-gradient(top, #fb83fa, #e93cec);\n\
    background: -moz-linear-gradient(top, #fb83fa, #e93cec);\n\
    background: -o-linear-gradient(top, #fb83fa, #e93cec);\n\
    background: linear-gradient(top, #fb83fa, #e93cec); }\n\
  .ui-editor-messages .ui-editor-message-clock .ui-icon.ui-icon-clock {\n\
    background: transparent url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAOXRFWHRTb2Z0d2FyZQBBbmltYXRlZCBQTkcgQ3JlYXRvciB2MS42LjIgKHd3dy5waHBjbGFzc2VzLm9yZyl0zchKAAAAOnRFWHRUZWNobmljYWwgaW5mb3JtYXRpb25zADUuMi4xNzsgYnVuZGxlZCAoMi4wLjM0IGNvbXBhdGlibGUpCBSqhQAAAAhhY1RMAAAACAAAAAC5PYvRAAAAGmZjVEwAAAAAAAAAEAAAABAAAAAAAAAAAAA8A+gAAIIkGDIAAACsSURBVDiNtZLBCcMwDEUfJgOUjhAyQsmp9FA8TgfISj6F4gl66jSdIIf00G9wnLjYKf3w0Qch6Us2fMdVLMYx0haYRZsrMJEegZdiDj3gFFeT54jBiU2mO+XdVvdRyV0OYidVMEAH3AEPHGoboMKwuy+seYqLV9iNTpM90P7S6AQMitXogYnPHSbyz2SAC9HqQVigkW7If90z8FAsctCyvMvKQdpkSOzfxP/hDd++JCi8XmbFAAAAGmZjVEwAAAABAAAAEAAAABAAAAAAAAAAAAA8A+gAABlX8uYAAAC3ZmRBVAAAAAI4jaWQsQ3CQBAEB4cECFGCI1fiAlyFKwARWgSIeqjCNTh0gIjIkBw9gffFSfz74VlpdX/W3Xr3YBmlmIUSmMSoSGHee+CmGsMGaFU/cAecqnVh/95qpg0J/O0gCytgDRzUX4DnryIn5lwO6L7c6fxskRhMwkc4qj+TEcFjC9SqWcsj8x3GhMgu9LHmfUinvgKuYmWWp5BIyEFvBPuUAy9ibzAYgWEhUhQN8BCb2NALKY4q8wCrG7AAAAAaZmNUTAAAAAMAAAAQAAAAEAAAAAAAAAAAADwD6AAA9MEhDwAAAKhmZEFUAAAABDiNY2CgMTgNxTgBExLbh4GB4SCUxgeMcEkcZmBg+A+lcQETqBoTbJI+UM1ku4AiEATFZIEQBoi//kPZxIAAKEaJBYpACAm24wUSBORVGBgYUqA0BtjKAAmHrXg0f4aq+YxuiAQDIiD/Q/k8DAwMdVDMw8DAkIamJo2QCyYjKZ4MtfErlP8VlzeQw2AlkgErkbyBMwzQgRoDA8N+KMapAQDdvyovpG6D8gAAABpmY1RMAAAABQAAABAAAAAQAAAAAAAAAAAAPAPoAAAZC1N1AAAAsWZkQVQAAAAGOI21kkEOgjAURF9YGBbGtYcwLowrwxk8BMcg3XACD9djGJaujKmLTkMRCiXEl0ympYX8+Xz4M62UpIjWR8DI59inDgzg5CkOwEs+YnMFmzhJOdwAK1UAZ+ANfLRewuJ75QAb/kKRvp/HmggVPxHWsAMu8hEN8JRPUdLnt9oP6HTYRc/uEsCVvnlO+wFGFYRJrKPLdU4FU5HCB0KsEt+DxZfBj+xDSo7vF9AbJ9PxYV81AAAAGmZjVEwAAAAHAAAAEAAAABAAAAAAAAAAAAA8A+gAAPSdgJwAAADDZmRBVAAAAAg4jaWSTQrCMBCFP6NIT5AjCF6gJ6jbUnoCL1biDTyF5AAueoZu3LkSrAtHTEJiIn3wmCTz92YILMQ64++BPTDKXQMH4AbcAZQTvAEasTFo4AqcxeowoAFmsSk1s8M+DChRMEnyFFNQAg10sWSFv49cESPUn+RRWFLE8N2DKe2axaIR/sU25eiAi9gUBt6zDzGnFad13nZCgAr/I1UxBdZRUAMPYV2iIETrdGudd28Hqx8FFHCU8wl4xoJeZnUrSRiyCSsAAAAaZmNUTAAAAAkAAAAQAAAAEAAAAAAAAAAAADwD6AAAGe6xwAAAALtmZEFUAAAACjiNpZJBCsIwEEWfpUsPULoSl55Beh4J7nqCHkDceR3pIaSr4Ak8Qq2L/khomlrig+FPhszwJy3EqYCHolq4F6UDBkWnWgbspN+CT7EwMAPuwFM67aUAem/IdIW952jQOeCXg1bN7ZyDNQRvsEkYkgNG+S1XcpHWKwacgatzlLLH2z/8vUJCf5wSaKQxToCVBjSM37jxaluFw+qOXeOgBF4KVzNqNkH3DAfGX7tXnsRREeUD4f8lQGjw+ycAAAAaZmNUTAAAAAsAAAAQAAAAEAAAAAAAAAAAADwD6AAA9HhiKQAAAJ9mZEFUAAAADDiNtZDLCcMwEEQfIUcXoDpCKgg6qIRUEtKB6wg6poDgalyFTj7YBw+2QyRlCc6DYVm0n9FCGQc8JFepWzgBN0WACIxS/NZ8BgYVD8pzA1ogKb5x3xSPyp0a4+YLSe/J4iBH0QF83uCvXKSFq2TBs97KH/Y1ZsdL+3IEgmJt86u0PTAfJlQGdKrprA6ekslBjl76mUYqMgFhpStJaQVr0gAAABpmY1RMAAAADQAAABAAAAAQAAAAAAAAAAAAPAPoAAAZshBTAAAAu2ZkQVQAAAAOOI21kCEOwkAQRR8rKkkFCtmjkJ4ARTgBArViT4LjLJwBgUZUr8NBQlrR38Am3XYEvOTnT7PzuzO7IE8BHFWfgNdELwBLYCMH8EAr+VzIyUvgBlzkZaZ/D1zlCfXXba2+C93sVaNwK08ogUaHzcQEu9wE0O9e83kDEw7YAhG4K/ww5CoJFB52j8bwU6rcTLOJYYWo2kKywk9Zz5yvgCAfDb9nfhLoHztYJzhIpgnGOEv/owMnkSfarUXVlAAAAABJRU5ErkJggg==\') no-repeat center center; }\n\
\n\
/* Plugins */\n\
/**\n\
 * Text alignment plugin\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-align-left-button .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAItJREFUeNpi/P//PwMlgImBQsACN4mJqRFIaQExIxQzYWEzQfHlf//+lYL0McK8ADSAJJuBBqC6AAjWYrEN2VYPbAZR1QUb0WxEZmPD1lR3wTYCttpSJQxg6mE0sgt2E/AzCLMBMTsQcwCxAskuQE722FwwEYiNsNjKClR8EUjH4w2DActMFBsAEGAAnS84DrgEl1wAAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-align-left-button:hover .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-align-right-button .ui-icon {\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAIxJREFUeNpi/P//PwMlgImBQsACN4mJqRFIaQExIxQzYWEzQfHlf//+lYL0McK8ADSAJJuBBqC6AAvYjGYrMhuEHanugo0EbETH1jQPg714bGcGYhOqu2A3AT+DMBvQQnYgzQHECiS7ADnZw9j4wmA61J+sQMUcUFtBtrMC8TEg9kNxwYBlJooNAAgwAJo0OAu5XKT8AAAAAElFTkSuQmCC\') 0 0; }\n\
\n\
.ui-editor-align-right-button:hover .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-align-center-button .ui-icon {\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAI1JREFUeNpi/P//PwMlgImBQsACN4mJqRFIaQExIxQzYWEzQfHlf//+lYL0McK8ADSAJJuBBqC6AAlswGErjO2KrJiqLtiIw0Zc2JpmYbCTgM2WFIUBTD2MRnbBbgI2gzAbELMDMQcQK5DsAuRkj80FMDAFiI2RbGUFKuaA2noGiEOwhsGAZSaKDQAIMAB/BzgOq8akNwAAAABJRU5ErkJggg==\') 0 0; }\n\
\n\
.ui-editor-align-center-button:hover .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-align-justify-button .ui-icon {\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJFJREFUeNpi/P//PwMlgImBQsACN4mJqRFIaQExIxQzYWEzQfHlf//+lYL0McK8ADSAJJuBBqC6AAjWYrEN2VZkNgg7Ut0FGwnYiI6tqe6CbUTYCsPMQGxCdRfsJsJmNqCF7ECaA4gVSHYBcrKHsZFdMBGIjbDYygpUzAG1FWQ7KxAfA2I/FBcMWGai2ACAAAMAvPA4C7ttvJ4AAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-align-justify-button:hover .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
/**\n\
 * Basic text style plugin\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-text-bold-button .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAKRJREFUeNpi/P//PwMlgImBQjDwBrCgmMbEpA2kGnGofQ3E9UD86t+/fzhdcBWIpwExMxQ3AHEIEK8BYgkgdsLrAih4A8SsaBYwQcWYiDGAEcmAbiwuJBiIIAPYoLgfiMuBeBmUXwHEXIQMYEIy4BUQXwDiy1C+HBBrEPKCDBCzwwwDpVRGRkZksU8ozkVOykCFVkBqOZ5oB3lpAoqe0bzAABBgANfuIyxmXKp/AAAAAElFTkSuQmCC\') 0 0; }\n\
\n\
.ui-editor-text-bold-button:hover .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-text-italic-button .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAH1JREFUeNpi/P//PwMlgImBQjDwBrBgmMgEN1MbiBvRpOv//ft3FUUEFIjImJGRERnrAPF6IO6BiaGrZyLCi6xAvJDcMLAA4j9AfJlcA/yBeCe5sWAExAJAfIKkWIAFJBAUATE7kM+M143ooQoEVkD8EA1b4Yy10bzAABBgAC7mS5rTXrDAAAAAAElFTkSuQmCC\') 0 0; }\n\
\n\
.ui-editor-text-italic-button:hover .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-text-underline-button .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAKZJREFUeNpi/P//PwMlgImBQkCxASwopjExhQGpMCSheijdiCz279+/q3AeKAxgmJGREYSdgHgdlIaJ6SCLIevB5oXXUJe9RhK7gkUMZxgwAjEzlEYG2MRwGsCKRTErKQawYFHMQqwBn6G2qSCJGULFPmPYhpwSgdEIY6YCcTKa2rlAPBvEAEYjdgNAUYRMowOYWmQ9LFjUPSGQP2RwemFoZiaAAAMAlEI7bVBRJkoAAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-text-underline-button:hover .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-text-strike-button .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAL5JREFUeNpi/P//PwMlgImBQkCxASwopjHBzbMB4nQg5oTyrwKxNhAXAfGjf//+EXRBFhC/BOI0KAapYwZpxusCJPASquEdlD8FiHWwKWREjgUkL4gDcQ0QfwfiXqiBcIDsBXQD9hATcEADXOAckAEwzMjIiI4lgHgiEM8GYkmYOLIeXAZ4I2sA4vlQjGEArkBsAeJzQAUVYH8yMnIAKTmC6QAaHhpALALEPCBDoOJfgFQ5wVgYmnmBYgMAAgwAEGZWNyZpBykAAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-text-strike-button:hover .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-text-sub-button .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAKZJREFUeNpi/P//PwMlgImBQjDwBrDATWJCMWs6lM7Ep/nfv39YXSAPxL+AWALKJtkLLkB8EohZoWySDbAH4uNQQ+xJNUAJiH8DMT8QPwZiWagYDEwA4v1QGgJACQmEGRkZQTgXiI+i4VyoHAy7AfEaEBucCNEM2AzEKkiKu6BiYMuAdAYQLwZiKQwDgGAVED+E0iBgBeUjiy1HErMCWzyaFxgAAgwA5Gw9vTeiCqoAAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-text-sub-button:hover .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-text-super-button .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALdJREFUeNpi/P//PwMlgImBQjDwBrCgmMaEYt50KJ0JpRuBWBuIrwJx/b9///C6QB6IfwGxBJQNAvVAPAkqRtALLkB8EohZoWwQiAbiICCuI8YAeyA+DjXEHiqmD8SaQLwIysYMAyhQAuLfQMwPxI+B2AkqVkZsLHgDsQYQTwXiVCBmg4phB6CUCMOMjIwgvBmIVaBsEO6CijEgY5geFAOAYBUQP4TSIGAF5SOLoVjMOJoXGAACDACTRz3jjn6PnwAAAABJRU5ErkJggg==\') 0 0; }\n\
\n\
.ui-editor-text-super-button:hover .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
/**\n\
 * Blockquote plugin\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-quote-block-button .ui-icon-quote {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAGVJREFUeNpi/P//PwMlgImBQjAcDWBhYZEA4r1AHA/EKHxiXQBS+BKIF+LgEzTAG4h3I0UvOh+/AUCFbECcDmROA2lC5mMzgAWLGDuUtsTBJ+iFeUDMC6Wx8VEA42hSptwAgAADAO3wKLgntfGkAAAAAElFTkSuQmCC\') 0 0; }\n\
\n\
.ui-editor-quote-block-button:hover .ui-icon-quote {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
/**\n\
 * Clean content plugin\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-clean-button .ui-icon-clean {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABNVBMVEUAAAAAAAAgSocgSocgPnAAAABxcXFPT09YWFggSocgSocoToUbPXgSN3kyYZw0ZqT///8iUZkgSoc1Z6UiUJaJrNkwXpZIeLiOvO03a6s4b7JekNUjUpqCp9eNr9pSjeAwX5g2aqquxuV8otPB1euOsNv8/f6gveFgkdVnkMmbuuVfk9lkk9fK3Pbs8vmWtd5Vjs98odCHqNWkv+Jzms6Qt+xnmNuzyudVidS90u6hwe5mmuQtXKCow+OqxepNg82Xtd3C1Ox0m89vl8x3oNl4n9NSjuDi7PqlxO+MtOyWtt2fwO60y+dUjt5zm8/L2+9qneT3+f7g6/qDrelRi95snuWowuSfvOGPr9uwyeqRsdqUs9qat92OrtmDptN5ns9Rh8hqk8uXuehwnt1vl83e6vmZu+gBAK69AAAADXRSTlMbAKM01gogSSmAy7W1OP1GaAAAAM1JREFUeF5VzNN2A1EAQNE7TIrrsSe0Udu2zf//hHZWk672PO6HAySR/UmUwBjT9XyzeJlZuGpe60wE474TxxghhHEcOz4DzLcxRoZhJGT/AOcoiiKEOE9AZEGw291fOcpNdZeD74fEqKZ5lFLP0+YplIDAzBfXrTQKNyW3bEIhgV51QD5fyVv1fQir0zOzcxfW4tLaCGqkHoYWWR/BxubW9k5/7+PgcAjZ8JicnJKz82wC6gRstTu3d/cPj0/PcFIF6ZQMf5NTaaCAfylf1j4ecCeyzckAAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-clean-button:hover .ui-icon-clean {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
/**\n\
 * Clear formatting style plugin.\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-clear-formatting-button .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wGGxcPH7KJ9wUAAAEKSURBVDjL3ZG9SgNBFIW/I76D1RIEazEIFitWNguxUPANUkUIKG4jYiEBC7WwUFJZiNssFvoOFipMFx/AoIVVEAvxB7w2MyBhV5Iq4IHLPecy9zBzBv4nJLUltQc5O1awXAE+gAnPhzMAFoE7YNzzoQ0WgBvg1vPBDSRNAl9m9gC4ebPpc+jkkADkkOTggi4KryFpV9KMpHgfXr/T1DJwGWxn4IIuM7iQdB1qDu73oPder9spuNDPYLZoeUrSZd9saQUej6DzUqvZCbhj2Pjr+pu/ZzuwnMLbc7Vqh+BCPyjIIAaefMVhuA69bhTZGnyuwlULXDeKrFWWQT+akDTAbfk3B90s+4WR4Acs5VZuyM1J1wAAAABJRU5ErkJggg==\') 0 0; }\n\
\n\
.ui-editor-clear-formatting-button:hover .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
/**\n\
 * Click to edit plugin\n\
 *\n\
 * @author Michael Robinson <michael@panmedia.co.nz>\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-click-button-to-edit-button {\n\
  z-index: 4000; }\n\
\n\
.ui-editor-click-button-to-edit {\n\
  outline: 1px solid transparent; }\n\
\n\
.ui-editor-click-button-to-edit-highlight {\n\
  outline: 1px dotted rgba(0, 0, 0, 0.5);\n\
  -webkit-transition: all 0.5s;\n\
  -webkit-transition-delay: 0s;\n\
  -moz-transition: all 0.5s 0s;\n\
  -o-transition: all 0.5s 0s;\n\
  transition: all 0.5s 0s; }\n\
\n\
/**\n\
 * Basic color picker plugin.\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-color-picker-basic-select .ui-editor-selectmenu-menu {\n\
  min-width: 100px; }\n\
\n\
.ui-editor-color-picker-basic-select span {\n\
  padding-left: 2px; }\n\
\n\
.ui-editor-color-picker-basic-swatch {\n\
  width: 16px;\n\
  height: 16px;\n\
  float: left;\n\
  margin-top: 2px;\n\
  border: 1px solid rgba(0, 0, 0, 0.2); }\n\
\n\
/**\n\
 * Debug plugin\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-debug-reinit-button .ui-icon-reload {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAqBJREFUeNqkU01PE2EQnrfdtmyLpbRNA/ULGyAhRi+NHkTk5sEEiRyMEi+evHszJh5I/AF613ho9EIwhEiMB4kSjQcWSDxgIAhJoZV26dd2t/v17jqzkoLGG5vM7rvzzPPsfOww13XhOJdAt8vPN0EIBEAQBPD5/UHGWALdnWgW2iO07H+40sL91APhH2ev4HOH+tJiZzoZCia7guXpj8XsnevprGX9yVQMM8i9K0jA2GI7A+9y3Uwo4I6Mj6aijToHzl2nXrNk27bBMDg0FQ7dcQFezeYljH6PlmsLuI4T8zF+e+zqqZ69ggaKZrH13WaxXDcUwm2LQ6xbgOKOCreu9WTfLuQVy3bSCBV8XoBpjmR6xYvFfKNflpuZTyuF1q+y8sHhXLINA7q6g/Byek06ERWgUlJh8EykHzkTxPUETMMYTcWCQ/Wqllnb3hct0/yM01nWVZUwePZiWcLnt0Vpd1NvmZCMBuL4PtwuwdL1S37GMqpuQaFUL+Mk5rllgeM41BuqeZH5/bmNzdJSbzQEiUggjJyBtgCqRVTDjqrc9c6YOjbRhlCHSON9YKMYGQpDrWVDh2F7mR2WoOsbezVdU30CdMXEGNY3abZ0rLcEVVkGpVqlPk0SRjEUS5y2gGUYX7byckURgnB66OxJ7MFD7MHkAQZ0Jh9hFEOxxDkUMM2ZrR/bMo+IsA3hjuzN4fPpvtQUjneJjM7kI4xiKJY4xGW0C9F7bwDrHvNHwk8T4zcutGz0hRjEQp4+1AwHGoYLosBgf3b+O1e1x9iPuUbu7uGfiEJzerUGu6+npwKDA8lm5lx8J54Ie2lWapr7c6tSWd+QwTSfYGPn/lqmoyKOpkn2yuoErKxeQdfgAbSO9hWXbAa/XDjKYcdd598CDAAkzn7JYhVZYAAAAABJRU5ErkJggg==\') 0 0; }\n\
\n\
.ui-editor-debug-reinit-button:hover .ui-icon-reload {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-debug-destroy-button .ui-icon-close {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAtFBMVEX///+nAABhAACnAACjAACCAACgAACHAACjAAByAAB1AAByAACDAACnAACCAACHAACgAACNAACbAACXAACMAACSAABfAACYAACRAACjAACbAAChAACqAACNAACcAACHAACqAADEERGsERHQERG+NjaiERHUTEzYERG4ERGlFBSfFRX/d3f6cnK0JSWoHh7qYmLkXFyvFRXmXl7vZ2fNRUX4cHDXT0/+dnbbU1O3Li7GPT26MTG2f8oMAAAAIXRSTlMASEjMzADMzAAASMxIAMwAAMzMzEjMzEhISABIzABISEg/DPocAAAAj0lEQVR4Xo3PVw6DMBBF0RgXTO+hBYhtILX3sv99RRpvgPcxVzp/M5syb7lYepxDABDeYcQ5wg+MAMhr3JOyJKfxTABqduuvjD37O6sBwjZ+f76/7TFuQw1VnhyGYZPklYagKbKLlDIrmkBDGq1hUaqhM4UQJpwOwFdK+a4LAbCdlWNTCgGwjLlhUQqZ8uofSk8NKY1Fm8EAAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-debug-destroy-button:hover .ui-icon-close {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
/**\n\
 * Dock plugin\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-dock-button .ui-icon-pin-s {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAbFJREFUeNpi/P//PwMlgAVEPGNiIqTOBojz/zIwTHrPwHD4BZDzGGhxMhAzEWlRvtTy5SE/GRiKge61R5YgyoB/IHVPnzIoTprk/52BoRJoiDNBA5BCxuY3UN2vz58Znu7ZwyAaHOz+8f//RqC8OzEuAPtdcfbsgM937zJ8+fKFgePHDwa3sDBroKGt8EBEAo1ArAV1ARPQucwqs2f7vz14kOHH378MF/buPQ4S+wXEQPkauAG3EFHp7bBihTHDs2cMf4E2ffvwgQGmeeuyZWf+MDA0ATXs+I8eiP+gGBhNNTsjIs7+5+Vl+HTrFsOry5cZXr56xXB02bKjQM21QCU7sKaDRYiA2wE0RPJnamq2VVGR8adr1xi4uLkZPjMwsDJCNf/HagAjI8SA//95gRRb5pEjxnttbM6aeHsb87CwMED9DAZ/0QxAjgVmRkZGj+vXr0+wt7evWc3ENPfI1q1n2djYGP4TSsqMEBfYLV26tExXVzcfyF8NdM17oG33V69e3QKUO0vIAF1PT8+Y2NhYUDRuh7n0PyTEdzAQ4YKYHTt2TAEyz5OaGxkpzc4AAQYAvlOuK2pYar0AAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-dock-button:hover .ui-icon-pin-s {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-dock-button .ui-icon-pin-w {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wFFgA2AnOoAZ4AAAH4SURBVDjLtZNNaxNhFIXPfefNJJlkppFI09Ca1FiRMiDduCjWQltdtILdu1DcSkpx7UL6A1zGH+BKEFy5MkhErRvpwo+NSDEaaYyZSZNJJslkPl43XQQaaUA8u3M5PFwu5wL/KBo1FEC4DJALiN2jjAWIbcA5EVABzotkUu+ZJmvLsmQwJtcHA2oHQc8FXm8D9eE8HzafgThPpS5H19Zux4kmIqbJWL3OT/u+9LNWK1er1V8PgMMdwBsJ8AARtFoD6na1qK7PubFYTOOc9RqNQxEEX1ygswP4Jx6mDNw3Fhc/WVtb4uPy8uAx0YeHwMaoLBs1DBE9kzTtIJLJ4FQ6LQnghZVMFscCCIB8IeKB7/e6lYpjNZs2V1WeNk02FuApwAJA8xwnFHgeSUL4rmVJ3yIRfyzAFWA+Oj29EZqcvODYNveJEloisZnq9++NAkjD5gCY59nsnfjq6iafnT3bNQzJrtWQzeUm+p3OxQXbll8Cb45tYBGRKcucEd2Irq/fDC8tzSm5nKRMTSEUi3lcUXB1ZSV1RlVvPWLs2rEiaUIIDAbee+AtisWMUyqpRhAoiq7rLdtudvf2fsQlqWe02yQDr/7axEvAbml///uTcHjhqyxncjMz5zqO87th28+vu+47GWjfBdyxP61QKFA+nydVVQn/S38ATpHDEx6slP8AAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-dock-button:hover .ui-icon-pin-w {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
/**\n\
 * Dialog docked to body\n\
 */\n\
.ui-editor-dock-docked {\n\
  z-index: 10000; }\n\
  .ui-editor-dock-docked .ui-editor-toolbar-wrapper {\n\
    position: fixed;\n\
    top: 0;\n\
    left: 0;\n\
    right: 0;\n\
    border-top: none;\n\
    display: -webkit-box;\n\
    display: -moz-box;\n\
    display: -ms-box;\n\
    display: box;\n\
    -webkit-box-pack: center;\n\
    -moz-box-pack: center;\n\
    -ms-box-pack: center;\n\
    box-pack: center;\n\
    -webkit-box-align: center;\n\
    -moz-box-align: center;\n\
    -ms-box-align: center;\n\
    box-align: center; }\n\
  .ui-editor-dock-docked .ui-editor-toolbar {\n\
    text-align: center; }\n\
  .ui-editor-dock-docked .ui-editor-path {\n\
    position: fixed;\n\
    bottom: 0;\n\
    left: 0;\n\
    right: 0; }\n\
\n\
.ui-editor-ios .ui-editor-dock-docked .ui-editor-path {\n\
  display: none; }\n\
\n\
/**\n\
 * Dialog docked to element\n\
 */\n\
.ui-editor-dock-docked-to-element-wrapper {\n\
  font-size: inherit;\n\
  color: inherit;\n\
  font-family: inherit; }\n\
\n\
.ui-editor-dock-docked-to-element-wrapper .ui-editor-wrapper {\n\
  /* Removed fixed position from the editor */\n\
  position: relative !important;\n\
  top: auto !important;\n\
  left: auto !important;\n\
  border: 0 none !important;\n\
  padding: 0 !important;\n\
  margin: 0 !important;\n\
  z-index: auto !important;\n\
  width: 100% !important;\n\
  font-size: inherit !important;\n\
  color: inherit !important;\n\
  font-family: inherit !important;\n\
  float: none !important;\n\
  width: auto !important;\n\
  display: -webkit-box;\n\
  display: -moz-box;\n\
  display: -ms-box;\n\
  display: box;\n\
  -webkit-box-orient: vertical;\n\
  -moz-box-orient: vertical;\n\
  -ms-box-orient: vertical;\n\
  box-orient: vertical; }\n\
  .ui-editor-dock-docked-to-element-wrapper .ui-editor-wrapper .ui-editor-toolbar {\n\
    margin: 0;\n\
    z-index: 2;\n\
    -webkit-box-ordinal-group: 1;\n\
    -moz-box-ordinal-group: 1;\n\
    -ms-box-ordinal-group: 1;\n\
    box-ordinal-group: 1; }\n\
  .ui-editor-dock-docked-to-element-wrapper .ui-editor-wrapper .ui-editor-toolbar .ui-widget-header {\n\
    border-top: 0;\n\
    border-left: 0;\n\
    border-right: 0; }\n\
  .ui-editor-dock-docked-to-element-wrapper .ui-editor-wrapper .ui-editor-path {\n\
    border: 0 none;\n\
    margin: 0;\n\
    -webkit-box-ordinal-group: 3;\n\
    -moz-box-ordinal-group: 3;\n\
    -ms-box-ordinal-group: 3;\n\
    box-ordinal-group: 3;\n\
    -webkit-border-radius: 0;\n\
    -moz-border-radius: 0;\n\
    -ms-border-radius: 0;\n\
    -o-border-radius: 0;\n\
    border-radius: 0; }\n\
  .ui-editor-dock-docked-to-element-wrapper .ui-editor-wrapper .ui-editor-messages {\n\
    margin: 0; }\n\
\n\
.ui-editor-dock-docked-element {\n\
  /* Override margin so toolbars sit flush next to element */\n\
  margin: 0 !important;\n\
  display: block;\n\
  z-index: 1;\n\
  position: relative !important;\n\
  top: auto !important;\n\
  left: auto !important;\n\
  border: 0 none;\n\
  padding: 0;\n\
  margin: 0;\n\
  z-index: auto;\n\
  width: 100%;\n\
  font-size: inherit;\n\
  color: inherit;\n\
  font-family: inherit;\n\
  float: none;\n\
  width: auto;\n\
  -webkit-box-ordinal-group: 2;\n\
  -moz-box-ordinal-group: 2;\n\
  -ms-box-ordinal-group: 2;\n\
  box-ordinal-group: 2; }\n\
\n\
/**\n\
 * Messages\n\
 */\n\
.ui-editor-dock-docked .ui-editor-messages {\n\
  position: fixed;\n\
  top: 0;\n\
  left: 50%;\n\
  margin: 0 -400px 10px;\n\
  padding: 0;\n\
  text-align: left; }\n\
  .ui-editor-dock-docked .ui-editor-messages .ui-editor-message-wrapper {\n\
    width: 800px; }\n\
  .ui-editor-dock-docked .ui-editor-messages .ui-editor-message-wrapper:first-child {\n\
    -moz-border-radius-topright: 0;\n\
    -webkit-border-top-right-radius: 0;\n\
    border-top-right-radius: 0;\n\
    -moz-border-radius-topleft: 0;\n\
    -webkit-border-top-left-radius: 0;\n\
    border-top-left-radius: 0; }\n\
\n\
/**\n\
 * Embed plugin\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-embed-button .ui-icon-youtube {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAxlBMVEX////////fNzfaMTHVLCzKISHFGxvvR0flPDzpSEjdMTH4Y2PaKyvtTk7PJibXIyOnLi7lQECkKyvSHR3mPj6eJCSUGhqRFxfqQkL0XFziOTmOFBSBBwehKCiHDQ3PFRWaISGXHR3wVlaECgqqMTGLEBDGHR365eW1ICDaXFz139/LDg7NLi6tNDTSKSnMNzd9AwP1TEy/Fhbwxsbqv7+7EhKzFBS6EBDonZ3akJDkhISxBwf8a2vLIiLPcHD88fH67+/fYGAnLmvBAAAAAXRSTlMAQObYZgAAAJtJREFUeF5Vx0WShFAUBMB631F3afdxd7v/pQaiN5C7BK4mgM3nxAahczfihIgrrfVTqs+qGN2qLMvHwy4tB6sOmWeMIXp7/jI9L8PCYowR0e/3xzVj1gLLiHNOg9OR82iJvBZC0GD/J0Sdo7B93+/78+737AKNK6Uker2UA7fBNlBKPdyos2CLWXI/ksywnr+MzNdoLyZa4HYC/3EAHWTN0A0YAAAAAElFTkSuQmCC\') 0 0; }\n\
\n\
.ui-editor-embed-button:hover .ui-icon-youtube {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-ui-embed .ui-dialog-content .ui-editor-embed-panel-tabs {\n\
  display: -webkit-box;\n\
  display: -moz-box;\n\
  display: -ms-box;\n\
  display: box;\n\
  -webkit-box-orient: vertical;\n\
  -moz-box-orient: vertical;\n\
  -ms-box-orient: vertical;\n\
  box-orient: vertical;\n\
  height: 100%;\n\
  width: 100%; }\n\
  .ui-editor-ui-embed .ui-dialog-content .ui-editor-embed-panel-tabs > div {\n\
    display: -webkit-box;\n\
    display: -moz-box;\n\
    display: -ms-box;\n\
    display: box;\n\
    -webkit-box-orient: vertical;\n\
    -moz-box-orient: vertical;\n\
    -ms-box-orient: vertical;\n\
    box-orient: vertical;\n\
    -webkit-box-flex: 1;\n\
    -moz-box-flex: 1;\n\
    -ms-box-flex: 1;\n\
    box-flex: 1;\n\
    -webkit-box-sizing: border-box;\n\
    -moz-box-sizing: border-box;\n\
    box-sizing: border-box; }\n\
    .ui-editor-ui-embed .ui-dialog-content .ui-editor-embed-panel-tabs > div > p:first-child {\n\
      padding-top: 10px; }\n\
    .ui-editor-ui-embed .ui-dialog-content .ui-editor-embed-panel-tabs > div textarea {\n\
      display: -webkit-box;\n\
      display: -moz-box;\n\
      display: -ms-box;\n\
      display: box;\n\
      -webkit-box-flex: 4;\n\
      -moz-box-flex: 4;\n\
      -ms-box-flex: 4;\n\
      box-flex: 4; }\n\
\n\
/**\n\
 * Float block plugin\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-float-left-button .ui-icon-float-left {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAS5JREFUeNpi/P//PwMlgImBQsACY1zaIH4A6Bp7dAUzV31jnLHy22YgkxFqIQhf/vfvXymKAQ8eidtra35lYAQqY+FgZWBmZ2X49fk7AxvbX6DsN1+CLlgwn5khMECAwcLiL4OogiIDj6QEw9uLZ4AGfAVJ70BzAQg7ohigrnaP4cEDLoY3bzkYzL6/ZVA34ma4ev07w/sPv0HSHgRdoKICUvgR6IWPDK8evWb49+8iw/1bfxhevwYbsBfNdhC2BkkwwqLRxRhuFgM3HyMDrwAjw8vH/xj2nvuH1WZgIDKgGMDExLQNiz9xYWagASboBpAU/zAXsCCJ7SbCZjaghexAmgOIFUh2AXKyh7GRXTARiI2w2MoKVMwBtRVkOysQHwNiPxQXDFhmotgAgAADAKYzbYynfqX2AAAAAElFTkSuQmCC\') 0 0; }\n\
\n\
.ui-editor-float-left-button:hover .ui-icon-float-left {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-float-none-button .ui-icon-float-none {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAkFBMVEUAAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAABAQEAAADRrxbRsBYBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAAAAAACcegnCrQ6ffgqukQv+/GixkS3duyLhwyfkyizevSNRMDCigDLauC/y41DcuiLrzTTQrhWCYBiObSDErz3r4VvApCt4Vg6dewnDaH3NAAAAGHRSTlMAycfDxcu9v8HYu+DAwIm3uZnRkdDn7LIyy/h+AAAAWklEQVR4Xp2KRwqFMBQAYzfGXmPtvfx//9spgvAWQcRZzgx6gz6dGEDkQ1FWNRBN2/XZCMRvXtZtB4LSfxon6AHTsjVZUQWR5xz2cWfJxYR9eFf2MQnCCH3hAIfwBUXJe8YuAAAAAElFTkSuQmCC\') 0 0; }\n\
\n\
.ui-editor-float-none-button:hover .ui-icon-float-none {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-float-right-button .ui-icon-float-right {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAS1JREFUeNpi/P//PwMlgImBQsACN4mJqRFIaQExIxQzZYRzBaaHcWE4kZGJ8aCe/0sHFAOAoB5d4avXfAwPH4swaGt+ZWAEGsnCwcrAzM7K8Ovzd3sMFwDBWpjNMPrK5b++C94yMwQGCDBYWPxlEFVQZOCRlGB4e/EMAzYDgtFdICr6kUFd7QfDgwdcDG/ecjCYfX/LoG7EzXD1+ncGeyNMAzYiuQDsCmHhf54qKr+BzI9AL3xkePXoNcO/fxcZ7t/6wwDzAyMsGoGBiDWUnQwR4tx8jAy8AowMLx//Y9h95g+GAdvQXIAPM//798+EKBfgAkADMMJgNxE2swEtZAfSHECsQLILkJM9jI3sgolAbITFVlagYg6orSDbWYH4GBD7obhgwDITxQYABBgAdBpg+9sXURwAAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-float-right-button:hover .ui-icon-float-right {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
/**\n\
 * Font size plugin\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-font-size-inc-button .ui-icon-font-size-inc {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAOhJREFUeNpi/P//PwMlgImBQkCxASxgU5gwzJkOpTORBZ2ilzO8+MjFwMIixnBhnTlOF8gD8U8gFoey4UBSyZooLzgD8Umo65xhgsYu5USHgS0QHwfiE1A2TtuxGaAIxL+B+AEQnwFiaagYg6Qi2AAHIP4PpbEa4AHEz4HYAIi/QL3hgSS/H4gfQmlELCAHNBBLQGlksenP7x9l4Bc3YMTnBRWogbZIuBOIZUFyW2b5EQwDVyA+giYPcionSA6U5Jc0yTK8vrUcVQU0L1gB8RMotkKSXoMkXgQT5BM3A+sDYcahn5kAAgwArro7Z1GYijsAAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-font-size-inc-button:hover .ui-icon-font-size-inc {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-font-size-dec-button .ui-icon-font-size-dec {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAKxJREFUeNpi/P//PwMlgImBQjAMDGBBMY0Jbp4JEFcAcQcQnwEJpLa/Zfj27SvD+fPnGVhYxBgurDPH6wI9IP4DpRmMXcpJ9oIZELcBcRiaOCjOH0BpnAYoAbE6EE8EYnYgtjq7pxMm5wjE8lAapwFOQLwFiIuB+AQ0PBi2zvYHUQeAmBFKYxoATJWWQOwLxJJAfA6I5YE4FyT+9O5hBiSXwAHjaFKm3ACAAAMA85o8WKYZErQAAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-font-size-dec-button:hover .ui-icon-font-size-dec {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
/**\n\
 * Show guides plugin\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-show-guides-button .ui-icon-pencil {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHZJREFUeNpi/P//PwNFAGQAIyMjDK9BYqNgXHqZ0MSYcFmEyxBGsClMTGS5+t+/fxg2biLGAGTXoBvATGoYkuUFGMDmhd2kGjL4vHCUUi9cIjcpnwPi2UAsBaXPQZPwOXxscD5Cy0xLSbUc3YDnJLue0uwMEGAA2O1APJOrHFQAAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-show-guides-button:hover .ui-icon-pencil {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-ui-show-guides-visible * {\n\
  outline: 1px dashed rgba(0, 0, 0, 0.5); }\n\
\n\
/**\n\
 * History plugin\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-undo-button .ui-icon-undo {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAe1JREFUeNrEUzFrFEEU/mazu7d3x8U9g0ROwkHEwrSrNmksJBxok1RRwUIEz0awFStZoqQw5B9ok1jYiRDBwl4PSaFJVLCMMfHWS7zb3ZndGd9ssgdXiVzhwGNnH+/75n3vm2FKKQyzDAy5zKmHLRSKRdiOA6tQgGlZDcrPUme3dcFBEPSLlZQQcZyFTFN8WZiGOUCnVCMRws9/4zD8BwkEFpz7N66c8vQJUbeLNEn+LuEQqxo8jv0716e8/f0UPIp0+n1OTbFLsUF1z+n7boAgA0eRf/em521tdeE4BuYunfa0OYehEMUJ3wt6Fza+7s4EkVwh3DJFLyPgYejfa0576+u/MsZe70g/tX8QRujSHDgXtpTpmOvarkjYrZ97Qg/xUTYDOv3B46U3rcnJMqRUUKaBtsXwzWDYJmfax1y0x07gx/FxfLbckd+1Wj0dYddI8vlcwhp1gcUnr/z55mXvbcfA99WXrVwjMwzGHNs0yiWbVSpFXqtVMTFxkrU+zOt55ENc04N7tvTCP9O86mn76D6cIzDSODYRhhUEnXFguy4/bs6gWr1IubN9F3KShHN8Wn6a3QNtZaFU0lvtZXAUm1LK13Jn5z7Vzw0Q9EmE0NvZDNnpoDw6OuC7voFUs0C19Uzif39MQxP8EWAA91//GdkHdYEAAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-undo-button:hover .ui-icon-undo {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-redo-button .ui-icon-redo {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAd9JREFUeNrEU89LG0EUfjP7KyvEGsRorRhoySGCuSyht0IPgicFQZCcvXsvHoP/Q8FDKZRCpQityKIHvZT2YI6t6MUfCJqQKpt1d7Ozu7N9O9vWhIIUcvDBt/OY4X3z3vfNkjiOoZ+g0GfIyaf46gtQSQJF0wQIvePN5nJiJYS8xmUzDAIz8H1gnQ74npcS3BeubYOm60lqCKQjm/89QhSG0HEcSG6tzo4bAWM1JJntGaE7UNQKcL6EaQkxknQfcS6Imk0GizOTxrvPx7Xf4pvdBAOc85VBnVTLU6OPhx8NZBVZUjmPIYpStNsMGo0I5l8+NT5sfxckggCFAYrFzyaHlo1yoYDdSs2WD9e2A/atC4wFooMkJBT79EqBF88Lxu7eYU0QMN+v5Eey1enSRKF1y6ULFoKFAFUDntMgwpsiDuAEMbgBhydDKmxtH9TRmdWUwPOWSsXi2Fmr7RyfNG6sa9vzbI+FHT+MI3730hbmjIwEcLTxSRSrup5qgH6Wvn39cd76ae9TSndw6wzRQNiSooQxiohjHij4Pqy379PiTMb86wJalL+6ZB+pLK9RSv+x0XddkQfrb9K2VdXssRHZk4M1mRDc6XXWsaw/aT15ibKimN3n5MF/pr4JfgkwANDA599q/NhJAAAAAElFTkSuQmCC\') 0 0; }\n\
\n\
.ui-editor-redo-button:hover .ui-icon-redo {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
/**\n\
 * Horizontal rule plugin\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-hr-button .ui-icon-hr {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAXhJREFUeNpi/P//PwMTExMDEmgEYi0gZsSCrwJxNUzhv3//GBixGEA0ABnAgkV8LZqtTFDaF6aAX8KCwdBrA4QDckFq+1sGSUVrBkZGRqKwvEEhg2PyS7BeuAv07AsZXjw4BmJuQLIV5gImJLYrv7g53LlwA8TkLRgCi28wXDzQF/Dr10+G379/M/z58wfoz/9gfUxMrAzMzGwMsnr5DBwcvBgGHABiexBDyTiV4cuXTwxfv35j+PHjB9CQ/0BnszCwsHAysLHxIofVQSB2gBlgnxogAqREiI6B+ikf7ZFdcHD2hjf2X79+Zfj8+TNeF7Cz84K9wMrKdRDZAAcQ8fbJaYYndw4zYAsDHlFjBjZxKwyXwAPx1cMTDIdWxoKY+5BCHo7f31tp8VM9iUFQ0oaBQ9YBYQIoLo1dygmmA2QgIGHJoGhUCtaLLSkfweICVqA6diDNAcQKyJYTlRdAanCJY8sL04HYFM3WM0Acgs0QRlymEwsAAgwAwwCYinucCRoAAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-hr-button:hover .ui-icon-hr {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
/**\n\
 * Internationalisation plugin\n\
 *\n\
 * @author Michael Robinson <michael@panmedia.co.nz>\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-wrapper .ui-editor-i18n-select {\n\
  height: 23px;\n\
  top: -8px;\n\
  text-align: left; }\n\
\n\
.ui-editor-wrapper .ui-editor-i18n-select .ui-editor-selectmenu-status {\n\
  font-size: 13px;\n\
  line-height: 10px; }\n\
\n\
.ui-editor-selectmenu-menu li a, .ui-editor-selectmenu-status {\n\
  line-height: 12px; }\n\
\n\
.ui-editor-wrapper .ui-editor-i18n-select .ui-editor-selectmenu-item-icon {\n\
  height: 24px;\n\
  width: 24px; }\n\
\n\
.ui-editor-selectmenu-menu .ui-icon.ui-editor-i18n-en,\n\
.ui-editor-wrapper .ui-icon.ui-editor-i18n-en {\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAIAAAD5gJpuAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAflJREFUeNpinDRzn5qN3uFDt16+YWBg+Pv339+KGN0rbVP+//2rW5tf0Hfy/2+mr99+yKpyOl3Ydt8njEWIn8f9zj639NC7j78eP//8739GVUUhNUNuhl8//ysKeZrJ/v7z10Zb2PTQTIY1XZO2Xmfad+f7XgkXxuUrVB6cjPVXef78JyMjA8PFuwyX7gAZj97+T2e9o3d4BWNp84K1NzubTjAB3fH0+fv6N3qP/ir9bW6ozNQCijB8/8zw/TuQ7r4/ndvN5mZgkpPXiis3Pv34+ZPh5t23//79Rwehof/9/NDEgMrOXHvJcrllgpoRN8PFOwy/fzP8+gUlgZI/f/5xcPj/69e/37//AUX+/mXRkN555gsOG2xt/5hZQMwF4r9///75++f3nz8nr75gSms82jfvQnT6zqvXPjC8e/srJQHo9P9fvwNtAHmG4f8zZ6dDc3bIyM2LTNlsbtfM9OPHH3FhtqUz3eXX9H+cOy9ZMB2o6t/Pn0DHMPz/b+2wXGTvPlPGFxdcD+mZyjP8+8MUE6sa7a/xo6Pykn1s4zdzIZ6///8zMGpKM2pKAB0jqy4UE7/msKat6Jw5mafrsxNtWZ6/fjvNLW29qv25pQd///n+5+/fxDDVbcc//P/zx/36m5Ub9zL8+7t66yEROcHK7q5bldMBAgwADcRBCuVLfoEAAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-selectmenu-menu .ui-icon.ui-editor-i18n-zh_CN,\n\
.ui-editor-wrapper .ui-icon.ui-editor-i18n-zh_CN {\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAIAAAD5gJpuAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAFqSURBVHjaYrzOwPAPjJgYQEDAleHVbhADIvgHLPgHiQ0QQCxAlkR9NW8sw+cV/1gV/7Gb/hV4+vfzhj8Mv/78//Pn/+/f/8AkhH1t0yaAAAJp4I37zyz2lDfu79uqv/++/WYz+cuq/vvLxt8gdb+A5K9/v34B2SyyskBLAAII5JAva/7/+/z367a/f3/8ZuT9+//Pr78vQUrB6n4CSSj6/RuoASCAWEDO/fD3ddEfhv9/OE3/sKj8/n7k9/fDQNUIs/+DVf8HawAIIJCT/v38C3Hr95N/GDh/f94AVvT7N8RUBpjxQAVADQABBNLw/y/Ifwy/f/399ufTOpDBEPf8g5sN0QBEDAwAAQTWABEChgOSA9BVA00E2wAQQCANQBbEif/AzoCqgLkbbBYwWP/+//sXqBYggFhAkfL7D7OkJFCOCSj65zfUeFjwg8z++/ffX5AGoGKAAGI8jhSRyIw/SJH9D4aAYQoQYAA6rnMw1jU2vQAAAABJRU5ErkJggg==\') 0 0; }\n\
\n\
/**\n\
 * Image resize plugin\n\
 *\n\
 * @author Michael Robinson <michael@panmedia.co.nz>\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-image-resize-in-progress {\n\
  outline: 1px dashed rgba(0, 0, 0, 0.5); }\n\
\n\
/**\n\
 * Statistics plugin\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 * @author Micharl Robinson <michael@panmedia.co.nz>\n\
 */\n\
.ui-editor-statistics-button .ui-icon-dashboard {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAhFJREFUeNrEk7tv01AUxr/4kcRO7Fh1HghFgSAeYglDlIfUbGEBhaWoUxFiQWJGMDDyhzB2ZmANYmAoIvQPaIHIkVJjKyWkcdzYSR1zbhSGQhFDB47007333PN9V/cVCcMQ5wkO54wIxe+5q8Rt4gaRW+VsYo9oE1/+ZpAktjKZzL1arXatWCzmFEVhOYzH40m327U7nc7nwWDwhlLbxITN8SsDVvisXq9vtVqtuqZp2XK5HDcMg5vNZlylUon7vq+XSqXLi8WiYJqmTvWfiNkvg8e06gMqLDmOI5AIvV4P8/l8CeuzHMHn8/kcmeiWZQWk6zCD67quP280GuXNdlv4qKrwTk6WwpXoFNVqNTKdTtf6/X7C87wPzOAhrX4nCIK195KEp4aBtxyHKRm4roujozGdwQSO49LYx/7+VzIPeVEUOcsyh+wab9Ge0+SKGW3nhSzj5WiEoWlhMvHolKOIRmVIkgpZVhGPKxAEGdlsIc20zOASz/NSs9lkl4IwJuOJH+CVksDi2APPx0iYIgNlCTNYXy8hmdQkpmUGCfag2u134DgJipKGdqGAR6NjbKdVOAMbQRAiRsaCEKMaHru7XdYutRw95R+Hh0NXVTNIpXQy0KDrOVy8chOb34Z4XcjCMvZoO86p12bbBy7Tsv5dYoc4OAtFFM3BxkZ4xtzOSvvPuE98X7V//oX//ht/CjAAagzmsnB4V5cAAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-statistics-button:hover .ui-icon-dashboard {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
/**\n\
 * Link plugin\n\
 *\n\
 * @author Michael Robinson <michael@panmedia.co.nz>\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-link-button .ui-icon-link {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAilBMVEX///8EBARUVFRUVFQEBARTU1MqKiwfHx5MTEzGxsZNTU1FRUWAgH8SEhJnZ2fd3d06Ojrg4ODIyMgODg4DAwMSEhLCwsGcnKXExNEvLy+ysrh+foMQEBBBQUEEBATJydeenqcDAwPT09OIiIjj4+OZmZl3d3fU1OPCwsHW1tXq6urr6+va2trGxsaRnmwcAAAAI3RSTlMAimdfRTOWgDXbAGXFj339cv3dAHtC3OP8bt+2cnuA/OMA+Akct2IAAABoSURBVHhetcVZFoIgGAbQ7wcVwyEKtBi01OZh/9urw2EJdV8ufkHmnDHG85RE2a7Wp812GGJtiaqvG1rOXws1dV9BzWKi2/3xfL1pErOCdT6YS2SCdxZdsdtfD8ci1UFnIxGNWUrjHz6V6QhqNdQf6wAAAABJRU5ErkJggg==\') 0 0; }\n\
\n\
.ui-editor-link-button:hover .ui-icon-link {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-unlink-button .ui-icon-unlink {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAA2FBMVEX///8WFhYvLy9LS0sEBAQODg4EBARNTU0DAwNVVVVUVFQtLS1nZ2cfHx46OjoSEhLGxsZTU1OAgH/T09NUVFQEBAQ6OjpMTEwvLy+4uMDCwsEQEBCvr7sSEhIEBAR+foMqKixFRUUEBARDQ0MBAQEBAQG5ucQiIiICAgIODg7Z2dlAQEBMTEwsLCxGRkYAAABPT0/e3t4mJiYqKiopKSlUVFQiIiJJSUkjIyNFRUU5OTkBAQEoKCi/v8zCws+qgFWFZkY7MSbc3Nzj4+Pm5ubOztzU1OTQ0N6IE/7FAAAAQ3RSTlMAAAAAigAAAAAAZwB9gACP2zPF+F9ocjVu39xy40KAtpZlRQBrUPx9AIb8AE8AAAAA/AAAAAAAAAAAAAAA/PwAAAD8PWHlxQAAALtJREFUeF5dzsVWxEAQheHqpGPEPeMWGXfcmQHe/42oC+ewmH95F1UfGWFyhZLQUBHlTvBxOp92gZP/DaN25Esp/ag9ukeUxa5p6qbpxpmHqGgNOtWm6gxahaIokwX1ht16ps3q7rAn9utrg7RxX6Z6KvtjbWJZGHTuuLLtw8P2f/CAWd4uGYNBqCpj5s1NM2cMPd3xc2D4EDDkIWCmj1NgSEHAlGUJDAnEmOfPr+8XxtDr27sQwHDA0GU/2RcVwEV78WkAAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-unlink-button:hover .ui-icon-unlink {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
/* Dialog */\n\
.ui-editor-link-panel .ui-editor-link-menu {\n\
  height: 100%;\n\
  width: 200px;\n\
  float: left;\n\
  border-right: 1px dashed #D4D4D4;\n\
  display: -webkit-box;\n\
  display: -moz-box;\n\
  display: -ms-box;\n\
  display: box;\n\
  -webkit-box-orient: vertical;\n\
  -moz-box-orient: vertical;\n\
  -ms-box-orient: vertical;\n\
  box-orient: vertical; }\n\
  .ui-editor-link-panel .ui-editor-link-menu p {\n\
    font-weight: bold;\n\
    margin: 12px 0 8px; }\n\
  .ui-editor-link-panel .ui-editor-link-menu fieldset {\n\
    -webkit-box-flex: 2;\n\
    -moz-box-flex: 2;\n\
    -ms-box-flex: 2;\n\
    box-flex: 2;\n\
    margin: 2px 4px;\n\
    padding: 7px 4px;\n\
    font-size: 13px; }\n\
    .ui-editor-link-panel .ui-editor-link-menu fieldset label {\n\
      display: block;\n\
      margin-bottom: 10px; }\n\
      .ui-editor-link-panel .ui-editor-link-menu fieldset label span {\n\
        display: inline-block;\n\
        width: 150px;\n\
        font-size: 13px;\n\
        vertical-align: top; }\n\
\n\
.ui-editor-link-panel .ui-editor-link-menu fieldset,\n\
.ui-editor-link-panel .ui-editor-link-wrap fieldset {\n\
  border: none; }\n\
\n\
.ui-editor-link-panel .ui-editor-link-wrap {\n\
  margin-left: 200px;\n\
  padding-left: 20px;\n\
  min-height: 200px;\n\
  position: relative; }\n\
  .ui-editor-link-panel .ui-editor-link-wrap.ui-editor-link-loading:after {\n\
    content: \'Loading...\';\n\
    position: absolute;\n\
    top: 60px;\n\
    left: 200px;\n\
    padding-left: 20px;\n\
    background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAOXRFWHRTb2Z0d2FyZQBBbmltYXRlZCBQTkcgQ3JlYXRvciB2MS42LjIgKHd3dy5waHBjbGFzc2VzLm9yZyl0zchKAAAAOnRFWHRUZWNobmljYWwgaW5mb3JtYXRpb25zADUuMi4xNzsgYnVuZGxlZCAoMi4wLjM0IGNvbXBhdGlibGUpCBSqhQAAAAhhY1RMAAAACAAAAAC5PYvRAAAAGmZjVEwAAAAAAAAAEAAAABAAAAAAAAAAAAA8A+gAAIIkGDIAAACsSURBVDiNtZLBCcMwDEUfJgOUjhAyQsmp9FA8TgfISj6F4gl66jSdIIf00G9wnLjYKf3w0Qch6Us2fMdVLMYx0haYRZsrMJEegZdiDj3gFFeT54jBiU2mO+XdVvdRyV0OYidVMEAH3AEPHGoboMKwuy+seYqLV9iNTpM90P7S6AQMitXogYnPHSbyz2SAC9HqQVigkW7If90z8FAsctCyvMvKQdpkSOzfxP/hDd++JCi8XmbFAAAAGmZjVEwAAAABAAAAEAAAABAAAAAAAAAAAAA8A+gAABlX8uYAAAC3ZmRBVAAAAAI4jaWQsQ3CQBAEB4cECFGCI1fiAlyFKwARWgSIeqjCNTh0gIjIkBw9gffFSfz74VlpdX/W3Xr3YBmlmIUSmMSoSGHee+CmGsMGaFU/cAecqnVh/95qpg0J/O0gCytgDRzUX4DnryIn5lwO6L7c6fxskRhMwkc4qj+TEcFjC9SqWcsj8x3GhMgu9LHmfUinvgKuYmWWp5BIyEFvBPuUAy9ibzAYgWEhUhQN8BCb2NALKY4q8wCrG7AAAAAaZmNUTAAAAAMAAAAQAAAAEAAAAAAAAAAAADwD6AAA9MEhDwAAAKhmZEFUAAAABDiNY2CgMTgNxTgBExLbh4GB4SCUxgeMcEkcZmBg+A+lcQETqBoTbJI+UM1ku4AiEATFZIEQBoi//kPZxIAAKEaJBYpACAm24wUSBORVGBgYUqA0BtjKAAmHrXg0f4aq+YxuiAQDIiD/Q/k8DAwMdVDMw8DAkIamJo2QCyYjKZ4MtfErlP8VlzeQw2AlkgErkbyBMwzQgRoDA8N+KMapAQDdvyovpG6D8gAAABpmY1RMAAAABQAAABAAAAAQAAAAAAAAAAAAPAPoAAAZC1N1AAAAsWZkQVQAAAAGOI21kkEOgjAURF9YGBbGtYcwLowrwxk8BMcg3XACD9djGJaujKmLTkMRCiXEl0ympYX8+Xz4M62UpIjWR8DI59inDgzg5CkOwEs+YnMFmzhJOdwAK1UAZ+ANfLRewuJ75QAb/kKRvp/HmggVPxHWsAMu8hEN8JRPUdLnt9oP6HTYRc/uEsCVvnlO+wFGFYRJrKPLdU4FU5HCB0KsEt+DxZfBj+xDSo7vF9AbJ9PxYV81AAAAGmZjVEwAAAAHAAAAEAAAABAAAAAAAAAAAAA8A+gAAPSdgJwAAADDZmRBVAAAAAg4jaWSTQrCMBCFP6NIT5AjCF6gJ6jbUnoCL1biDTyF5AAueoZu3LkSrAtHTEJiIn3wmCTz92YILMQ64++BPTDKXQMH4AbcAZQTvAEasTFo4AqcxeowoAFmsSk1s8M+DChRMEnyFFNQAg10sWSFv49cESPUn+RRWFLE8N2DKe2axaIR/sU25eiAi9gUBt6zDzGnFad13nZCgAr/I1UxBdZRUAMPYV2iIETrdGudd28Hqx8FFHCU8wl4xoJeZnUrSRiyCSsAAAAaZmNUTAAAAAkAAAAQAAAAEAAAAAAAAAAAADwD6AAAGe6xwAAAALtmZEFUAAAACjiNpZJBCsIwEEWfpUsPULoSl55Beh4J7nqCHkDceR3pIaSr4Ak8Qq2L/khomlrig+FPhszwJy3EqYCHolq4F6UDBkWnWgbspN+CT7EwMAPuwFM67aUAem/IdIW952jQOeCXg1bN7ZyDNQRvsEkYkgNG+S1XcpHWKwacgatzlLLH2z/8vUJCf5wSaKQxToCVBjSM37jxaluFw+qOXeOgBF4KVzNqNkH3DAfGX7tXnsRREeUD4f8lQGjw+ycAAAAaZmNUTAAAAAsAAAAQAAAAEAAAAAAAAAAAADwD6AAA9HhiKQAAAJ9mZEFUAAAADDiNtZDLCcMwEEQfIUcXoDpCKgg6qIRUEtKB6wg6poDgalyFTj7YBw+2QyRlCc6DYVm0n9FCGQc8JFepWzgBN0WACIxS/NZ8BgYVD8pzA1ogKb5x3xSPyp0a4+YLSe/J4iBH0QF83uCvXKSFq2TBs97KH/Y1ZsdL+3IEgmJt86u0PTAfJlQGdKrprA6ekslBjl76mUYqMgFhpStJaQVr0gAAABpmY1RMAAAADQAAABAAAAAQAAAAAAAAAAAAPAPoAAAZshBTAAAAu2ZkQVQAAAAOOI21kCEOwkAQRR8rKkkFCtmjkJ4ARTgBArViT4LjLJwBgUZUr8NBQlrR38Am3XYEvOTnT7PzuzO7IE8BHFWfgNdELwBLYCMH8EAr+VzIyUvgBlzkZaZ/D1zlCfXXba2+C93sVaNwK08ogUaHzcQEu9wE0O9e83kDEw7YAhG4K/ww5CoJFB52j8bwU6rcTLOJYYWo2kKywk9Zz5yvgCAfDb9nfhLoHztYJzhIpgnGOEv/owMnkSfarUXVlAAAAABJRU5ErkJggg==\') no-repeat left center; }\n\
  .ui-editor-link-panel .ui-editor-link-wrap h2 {\n\
    margin: 10px 0 0; }\n\
  .ui-editor-link-panel .ui-editor-link-wrap fieldset {\n\
    margin: 2px 4px;\n\
    padding: 7px 4px;\n\
    font-size: 13px; }\n\
    .ui-editor-link-panel .ui-editor-link-wrap fieldset input[type=text] {\n\
      width: 400px; }\n\
    .ui-editor-link-panel .ui-editor-link-wrap fieldset.ui-editor-external-href {\n\
      width: 365px; }\n\
    .ui-editor-link-panel .ui-editor-link-wrap fieldset.ui-editor-link-email label {\n\
      display: inline-block;\n\
      width: 115px; }\n\
    .ui-editor-link-panel .ui-editor-link-wrap fieldset.ui-editor-link-email input {\n\
      width: 340px; }\n\
  .ui-editor-link-panel .ui-editor-link-wrap ol li {\n\
    list-style: decimal inside; }\n\
\n\
.ui-editor-link-panel .ui-editor-link-wrap\n\
.ui-editor-link-panel .ui-editor-link-wrap fieldset #ui-editor-link-external-target {\n\
  vertical-align: middle; }\n\
\n\
.ui-editor-link-error-message div {\n\
  padding: 0 .7em; }\n\
  .ui-editor-link-error-message div p {\n\
    margin: 0; }\n\
    .ui-editor-link-error-message div p .ui-icon {\n\
      margin-top: 2px;\n\
      float: left;\n\
      margin-right: 2px; }\n\
\n\
/**\n\
 * List plugin\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-list-unordered-button .ui-icon-list-unordered {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAMlJREFUeNpi/P//PwNFAGQAIyNjGBCvgdIMxGKQXhaoORFlZWWBXV1dTED2KqjYGiBmRMJMaOwrQFwOc0EEEG+A0iS5gBFEMDExkeX9f//+MTAxUAhgBsQC8U4oTRKABWJ8Rkae84wZk5iB7MVQsW1IAYYLW8MCMRGID0Bp+gYiC46EhTPR4QrEdCA+A6VJT8pAcDMsLB3EuAniQP14BIiPAfEJID4FxGehqe8OED8B4vVgvVADioH4GZTGGWhYvUtpbqQ4JQIEGABjeFYu055ToAAAAABJRU5ErkJggg==\') 0 0; }\n\
\n\
.ui-editor-list-unordered-button:hover .ui-icon-list-unordered {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-list-ordered-button .ui-icon-list-ordered {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAM1JREFUeNpi/P//PwNFAGQAIyNjIxCvAWJBIGYgFoP0skDNqQfidUDMiGT2GigfhpnQ2FeAuJwFSQMTmuNCiPEBTFMblF1CahAwgvzBxMREVvj9+/cP7oIuIN4Bpcl2gRMQJwFxDFRuG1KAYcVAF1jDojEBiGcAsQSp0QjzgiEQawLxSiibNoGInmqRE9J0IJaEYnNSXAAzYC4QNwJxIJLcEbRAYwZidiDmgOLTYPVIzgJpPgD2F45Aw+olqAFrgfg5EBeTagAjpdkZIMAAg/ZGwsH5qkAAAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-list-ordered-button:hover .ui-icon-list-ordered {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
/**\n\
 * Paste plugin\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 * @author Michael Robinson <michael@panmedia.co.nz>\n\
 */\n\
.ui-editor-paste-panel-tabs {\n\
  height: 100%;\n\
  width: 100%;\n\
  -webkit-box-sizing: border-box;\n\
  -moz-box-sizing: border-box;\n\
  box-sizing: border-box; }\n\
\n\
.ui-editor-paste .ui-tabs a {\n\
  outline: none; }\n\
\n\
.ui-editor-paste-panel-tabs {\n\
  position: relative;\n\
  display: -webkit-box;\n\
  display: -moz-box;\n\
  display: -ms-box;\n\
  display: box;\n\
  -webkit-box-orient: vertical;\n\
  -moz-box-orient: vertical;\n\
  -ms-box-orient: vertical;\n\
  box-orient: vertical; }\n\
\n\
.ui-editor-paste-panel-tabs > div {\n\
  overflow: auto;\n\
  display: -webkit-box;\n\
  display: -moz-box;\n\
  display: -ms-box;\n\
  display: box;\n\
  -webkit-box-flex: 1;\n\
  -moz-box-flex: 1;\n\
  -ms-box-flex: 1;\n\
  box-flex: 1;\n\
  -webkit-box-orient: vertical;\n\
  -moz-box-orient: vertical;\n\
  -ms-box-orient: vertical;\n\
  box-orient: vertical;\n\
  -webkit-box-sizing: border-box;\n\
  -moz-box-sizing: border-box;\n\
  box-sizing: border-box;\n\
  border: 1px solid #C2C2C2;\n\
  border-top: none; }\n\
\n\
.ui-editor-paste-panel-tabs > div > textarea.ui-editor-paste-area {\n\
  -webkit-box-flex: 1;\n\
  -moz-box-flex: 1;\n\
  -ms-box-flex: 1;\n\
  box-flex: 1;\n\
  display: -webkit-box;\n\
  display: -moz-box;\n\
  display: -ms-box;\n\
  display: box; }\n\
\n\
.ui-editor-paste-panel-tabs > div > textarea,\n\
.ui-editor-paste-panel-tabs > div > .ui-editor-paste-area {\n\
  border: none;\n\
  padding: 2px; }\n\
\n\
/**\n\
 * Raptorize plugin\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-raptorize-button .ui-icon-raptorize {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABDlBMVEX///9NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU0Y/iVtAAAAWXRSTlMA/v1mTvW+WQFF+nGpsyPlDhXL1GvZHduk48LslL2a7tadwee772kEfqD8+OGCXWJ2+bQ9pt7xCme4iQU4iNH0mCEPEd82Ocxj4De2HoMaq3MHZJsDeGwCG8H1fioAAAC1SURBVHheNchFlsMwEADRlmRkSDKmMDMMMjMz9P0vkifLrl194F3NW0qtugV5Wt1FHpnloGKRmr3TK96YDjiMxFGCONngcJ1De4GNDJqhvd2VkbzsY+eDw2efMTYsjRFxd4+DZx6ajC1xhXTTB560EyfWASJW2FEG3vGJElZOz4xzH6QLKLqMgpvbu3sxD+4jPBFJe05fBby9ly0S6ADxl4BviGjp5xd0Of0TUqaUEPs/kR1YA96IIUDtx93SAAAAAElFTkSuQmCC\') 0 0; }\n\
\n\
.ui-editor-raptorize-button:hover .ui-icon-raptorize {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
/**\n\
 * Save plugin\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-save-button .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAVNJREFUeNqkU71ugzAQPowtwdAdqRLK3odg6161a+cukZonoGrElgWWDqhb16oP0AfoytStirows0QRMj/unQsohAQi5aTD5vju4/Pd2VBKwTnG6cEYe8bl6s73P09Jel8ur3H5ruv6CUiBYRgfQRAosnrCyQhLOZTLG1ImpYQSA1VVjf7dNE0gLOV0R6AXlAMSk4uiGCUQ6ITdJzDpz0SQTxAoxlqVZo+gLEuQyDxFwIQAwg4IiPV3vYbL2WyUgDBHFbxG0Um9t237sIIkSeDYYGHbur3neQMCTgqoRWEYDToh8NyLxSO4rgtpmrY14D0CUsA5h80mh/n8QQdXq7CTTN/ILMtqa9AjEDjOGrTdSnAcRwdpr1unzB5BMweiGwY8tx/H8U+WZbmUSoPJlfr3NrZLgDkXujbNXaD9DfoLAt8OFRHPfb8X+sLcW+Pc6/wnwABHMdnKf4KT4gAAAABJRU5ErkJggg==\') 0 0; }\n\
\n\
.ui-editor-save-button:hover .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-cancel-button .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAtFBMVEX///+nAABhAACnAACjAACCAACgAACHAACjAAByAAB1AAByAACDAACnAACCAACHAACgAACNAACbAACXAACMAACSAABfAACYAACRAACjAACbAAChAACqAACNAACcAACHAACqAADEERGsERHQERG+NjaiERHUTEzYERG4ERGlFBSfFRX/d3f6cnK0JSWoHh7qYmLkXFyvFRXmXl7vZ2fNRUX4cHDXT0/+dnbbU1O3Li7GPT26MTG2f8oMAAAAIXRSTlMASEjMzADMzAAASMxIAMwAAMzMzEjMzEhISABIzABISEg/DPocAAAAj0lEQVR4Xo3PVw6DMBBF0RgXTO+hBYhtILX3sv99RRpvgPcxVzp/M5syb7lYepxDABDeYcQ5wg+MAMhr3JOyJKfxTABqduuvjD37O6sBwjZ+f76/7TFuQw1VnhyGYZPklYagKbKLlDIrmkBDGq1hUaqhM4UQJpwOwFdK+a4LAbCdlWNTCgGwjLlhUQqZ8uofSk8NKY1Fm8EAAAAASUVORK5CYII=\') 0 0; }\n\
\n\
.ui-editor-cancel-button:hover .ui-icon {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
/**\n\
 * Tag menu plugin\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 * @author Michael Robinson <michael@panmedia.co.nz>\n\
 */\n\
.ui-editor-wrapper .ui-editor-selectmenu .ui-editor-selectmenu-button .ui-icon {\n\
  text-align: left; }\n\
\n\
.ui-editor-wrapper .ui-editor-selectmenu .ui-editor-selectmenu-button .ui-editor-selectmenu-text {\n\
  font-size: 13px;\n\
  line-height: 22px; }\n\
\n\
.ui-editor-selectmenu-menu li a, .ui-editor-selectmenu-status {\n\
  line-height: 12px; }\n\
\n\
/**\n\
 * Basic text style plugin\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-wrapper [data-title]:after {\n\
  opacity: 0;\n\
  content: attr(data-title);\n\
  display: block;\n\
  position: absolute;\n\
  top: 100%;\n\
  font-size: 12px;\n\
  font-weight: normal;\n\
  color: white;\n\
  padding: 11px 16px 7px;\n\
  white-space: nowrap;\n\
  text-shadow: none;\n\
  overflow: visible;\n\
  z-index: 1000;\n\
  -webkit-pointer-events: none;\n\
  -moz-pointer-events: none;\n\
  pointer-events: none;\n\
  -webkit-border-radius: 9px 9px 2px 2px;\n\
  -moz-border-radius: 9px 9px 2px 2px;\n\
  -ms-border-radius: 9px 9px 2px 2px;\n\
  -o-border-radius: 9px 9px 2px 2px;\n\
  border-radius: 9px 9px 2px 2px;\n\
  -webkit-transition: opacity 0.23s;\n\
  -webkit-transition-delay: 0s;\n\
  -moz-transition: opacity 0.23s 0s;\n\
  -o-transition: opacity 0.23s 0s;\n\
  transition: opacity 0.23s 0s;\n\
  background: url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjUwJSIgeTE9IjAlIiB4Mj0iNTAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSI1cHgiIHN0b3AtY29sb3I9InJnYmEoNDAsIDQwLCA0MCwgMCkiLz48c3RvcCBvZmZzZXQ9IjZweCIgc3RvcC1jb2xvcj0iIzI4MjgyOCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzI4MjgyOCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\'), url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\') no-repeat 10px 0;\n\
  background: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(5px, rgba(40, 40, 40, 0)), color-stop(6px, #282828), color-stop(100%, #282828)), url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\') no-repeat 10px 0;\n\
  background: -webkit-linear-gradient(rgba(40, 40, 40, 0) 5px, #282828 6px, #282828), url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\') no-repeat 10px 0;\n\
  background: -moz-linear-gradient(rgba(40, 40, 40, 0) 5px, #282828 6px, #282828), url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\') no-repeat 10px 0;\n\
  background: -o-linear-gradient(rgba(40, 40, 40, 0) 5px, #282828 6px, #282828), url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\') no-repeat 10px 0;\n\
  background: linear-gradient(rgba(40, 40, 40, 0) 5px, #282828 6px, #282828), url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\') no-repeat 10px 0; }\n\
\n\
.ui-editor-wrapper [data-title]:hover:after {\n\
  opacity: 1; }\n\
\n\
.ui-editor-wrapper .ui-editor-select-element {\n\
  position: relative; }\n\
\n\
.ui-editor-wrapper .ui-editor-select-element:after {\n\
  background: url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjUwJSIgeTE9IjAlIiB4Mj0iNTAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSI1cHgiIHN0b3AtY29sb3I9InJnYmEoNDAsIDQwLCA0MCwgMCkiLz48c3RvcCBvZmZzZXQ9IjZweCIgc3RvcC1jb2xvcj0iIzI4MjgyOCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzI4MjgyOCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\'), url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\') no-repeat 3px 0;\n\
  background: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(5px, rgba(40, 40, 40, 0)), color-stop(6px, #282828), color-stop(100%, #282828)), url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\') no-repeat 3px 0;\n\
  background: -webkit-linear-gradient(rgba(40, 40, 40, 0) 5px, #282828 6px, #282828), url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\') no-repeat 3px 0;\n\
  background: -moz-linear-gradient(rgba(40, 40, 40, 0) 5px, #282828 6px, #282828), url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\') no-repeat 3px 0;\n\
  background: -o-linear-gradient(rgba(40, 40, 40, 0) 5px, #282828 6px, #282828), url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\') no-repeat 3px 0;\n\
  background: linear-gradient(rgba(40, 40, 40, 0) 5px, #282828 6px, #282828), url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\') no-repeat 3px 0; }\n\
\n\
/**\n\
 * Unsaved edit warning plugin\n\
 *\n\
 * @author Michael Robinson <michael@panmedia.co.nz>\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-unsaved-edit-warning {\n\
  position: fixed;\n\
  bottom: 0;\n\
  right: 0;\n\
  height: 30px;\n\
  line-height: 30px;\n\
  border-radius: 5px 0 0 0;\n\
  border: 1px solid #D4D4D4;\n\
  padding-right: 7px;\n\
  background: url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjUwJSIgeTE9IjAlIiB4Mj0iNTAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmMiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2VkZWNiZCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');\n\
  background: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, #fffff2), color-stop(100%, #edecbd));\n\
  background: -webkit-linear-gradient(top, #fffff2, #edecbd);\n\
  background: -moz-linear-gradient(top, #fffff2, #edecbd);\n\
  background: -o-linear-gradient(top, #fffff2, #edecbd);\n\
  background: linear-gradient(top, #fffff2, #edecbd);\n\
  -webkit-transition: opacity 0.5s;\n\
  -moz-transition: opacity 0.5s;\n\
  -o-transition: opacity 0.5s;\n\
  transition: opacity 0.5s;\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=0);\n\
  opacity: 0; }\n\
  .ui-editor-unsaved-edit-warning .ui-icon {\n\
    display: inline-block;\n\
    float: left;\n\
    margin: 8px 5px 0 5px; }\n\
\n\
.ui-editor-unsaved-edit-warning-visible {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-unsaved-edit-warning-dirty {\n\
  outline: 1px dotted #aaa;\n\
  background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoAQMAAAC2MCouAAAABlBMVEUAAACfn5/FQV4CAAAAAnRSTlMAG/z2BNQAAABPSURBVHhexc2xEYAgEAXRdQwILYFSKA1LsxRKIDRwOG8LMDb9++aO8tAvjps4qXMLaGNf5JglxyyEhWVBXpAfyCvyhrwjD74OySfy8dffFyMcWadc9txXAAAAAElFTkSuQmCC\') !important; }\n\
\n\
/**\n\
 * View source plugin\n\
 *\n\
 * @author Michael Robinson <michael@panmedia.co.nz>\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.ui-editor-view-source-button .ui-icon-view-source {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
  opacity: 0.85;\n\
  background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAKtJREFUeNpi/P//PwMlgImBQkCxAQwgLzAyMqLjMCCehsSfBhVDUQf2PhYDIoB4JhCLIYmJQcUiCBkQBcRzgFgci6vEoXJRuAyIAeIFODQjG7IAqhbFAAMg3gOlGQhguFp0FyQC8UoglgTx0QFUjSRUTSKuMEgG4nUghVgMkITKJROKhXQg3gbUI42kXxokBpUjGI0gDYVAfBzJABC7EFs6YBz6eYFiAwACDAADJlDtLE22CAAAAABJRU5ErkJggg==\') 0 0; }\n\
\n\
.ui-editor-view-source-button:hover .ui-icon-view-source {\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
  opacity: 1; }\n\
\n\
.ui-editor-ui-view-source .ui-editor-ui-view-source-dialog {\n\
  overflow: auto; }\n\
\n\
.ui-editor-ui-view-source-plain-text {\n\
  height: 100%;\n\
  width: 100%;\n\
  display: -webkit-box;\n\
  display: -moz-box;\n\
  display: -ms-box;\n\
  display: box;\n\
  -webkit-box-orient: vertical;\n\
  -moz-box-orient: vertical;\n\
  -ms-box-orient: vertical;\n\
  box-orient: vertical; }\n\
\n\
.ui-editor-ui-view-source-dialog textarea {\n\
  white-space: pre-line;\n\
  width: 100%;\n\
  height: 100%;\n\
  display: -webkit-box;\n\
  display: -moz-box;\n\
  display: -ms-box;\n\
  display: box;\n\
  -webkit-box-orient: vertical;\n\
  -moz-box-orient: vertical;\n\
  -ms-box-orient: vertical;\n\
  box-orient: vertical;\n\
  -webkit-box-flex: 1;\n\
  -moz-box-flex: 1;\n\
  -ms-box-flex: 1;\n\
  box-flex: 1;\n\
  -webkit-box-sizing: border-box;\n\
  -moz-box-sizing: border-box;\n\
  box-sizing: border-box; }\n\
\n\
/**\n\
 * Basic color picker plugin default colors.\n\
 *\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
 */\n\
.cms-white {\n\
  color: #ffffff; }\n\
\n\
.cms-black {\n\
  color: #000000; }\n\
\n\
.cms-blue {\n\
  color: #4f81bd; }\n\
\n\
.cms-red {\n\
  color: #c0504d; }\n\
\n\
.cms-green {\n\
  color: #9bbb59; }\n\
\n\
.cms-purple {\n\
  color: #8064a2; }\n\
\n\
.cms-orange {\n\
  color: #f79646; }\n\
\n\
.cms-grey {\n\
  color: #999; }\n\
</style>').appendTo('head');