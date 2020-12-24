#include '../../.rootlib/core.js'
#include 'commons-colors.js'
#include 'commons-resources.js'
#include 'commons-selector.js'
#include 'commons-units.js'

check(app.documents.length > 0, 'No active document')

var document = app.activeDocument

/** Assert that artboards are even numbered. */
function checkEvenArtboards() { check(document.artboards.length % 2 == 0, 'Odd number of pages') }

/** Assert that artboards are odd numbered. */
function checkOddArtboards() { check(document.artboards.length % 2 != 0, 'Even number of pages') }

/** Assert that document currently has any selection. */
function checkHasSelection() { check(selection != null && selection.length > 0, 'No selection') }

/** Assert that document currently has single selection. */
function checkSingleSelection() {
    checkHasSelection()
    check(selection.length == 1, 'Multiple selection is not supported')
}

/** Assert that document currently has multiple selection. */
function checkMultipleSelection() {
    checkHasSelection()
    check(selection.length > 1, 'Single selection is not supported')
}

/**
 * Returns the clipping path of this clip group, or the item itself if this is not a clip group.
 * @this {PageItem}
 * @return {PathItem}
 */
Object.prototype.getClippingPathItem = function() {
    if (this.typename == 'GroupItem' && this.clipped) {
        return this.pathItems.first()
    }
    return this
}