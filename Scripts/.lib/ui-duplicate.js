#include 'core-units.js'
#include 'ui-validator.js'

const BOUNDS_DUPLICATE_TEXT = [0, 0, 45, 21]
const BOUNDS_DUPLICATE_EDIT = [0, 0, 100, 21]
const BOUNDS_DUPLICATE_EDIT_SMALL = [0, 0, 36, 21]

var duplicateHEdit
var duplicateVEdit
var duplicateGapEdit

Group.prototype.addDuplicateGroup || (Group.prototype.addDuplicateGroup = function() { return _createDuplicate(this) })
Panel.prototype.addDuplicateGroup || (Panel.prototype.addDuplicateGroup = function() { return _createDuplicate(this) })

/**
 * Add duplicate layout to target.
 * 
 * @param {Object} target - a window, panel, or group
 * @return {Group}
 */
function _createDuplicate(target) {
    var duplicate = target.addVGroup()

    duplicate.copies = duplicate.addHGroup()
    duplicate.copies.add('statictext', BOUNDS_DUPLICATE_TEXT, 'Copies:').justify = 'right'
    duplicateHEdit = duplicate.copies.add('edittext', BOUNDS_DUPLICATE_EDIT_SMALL)
    duplicateHEdit.validateDigits()
    duplicate.copies.add('statictext', undefined, 'x')
    duplicateVEdit = duplicate.copies.add('edittext', BOUNDS_DUPLICATE_EDIT_SMALL)
    duplicateVEdit.validateDigits()

    duplicate.gap = duplicate.addHGroup()
    duplicate.gap.add('statictext', BOUNDS_DUPLICATE_TEXT, 'Gap:').justify = 'right'
    duplicateGapEdit = duplicate.gap.add('edittext', BOUNDS_DUPLICATE_EDIT)
    duplicateGapEdit.validateUnits()
    
    return duplicate
}

/**
 * Duplicate selected item, only support single selection.
 * 
 * @param {Function} horizontalRunnable - custom action that are executed during horizontal loop
 * @param {Function} verticalRunnable - custom action that are executed during vertical loop
 * @return {void}
 */
function duplicate(horizontalRunnable, verticalRunnable) {
    var horizontal = parseInt(duplicateHEdit.text) || 0
    var vertical = parseInt(duplicateVEdit.text) || 0
    var gap = parseUnit(duplicateGapEdit.text)

    var selectedItem = selection[0]
    var width = selectedItem.width
    var height = selectedItem.height
    var x = selectedItem.position[0]
    var y = selectedItem.position[1]

    app.copy()
    selectedItem.remove()

    // vertical is 0 because the starting point doesn't change
    for (var v = 0; v < vertical; v++) {
        app.paste()
        var addedItem = selection[0]
        addedItem.position = [x, y - v * (height + gap)]
        if (verticalRunnable !== undefined) {
            verticalRunnable(addedItem, h, v)
        }

        for (var h = 1; h < horizontal; h++) {
            app.paste()
            addedItem = selection[0]
            addedItem.position = [x + h * (width + gap), y - v * (height + gap)]
            if (horizontalRunnable !== undefined) {
                horizontalRunnable(addedItem, h, v)
            }
        }
    }
}