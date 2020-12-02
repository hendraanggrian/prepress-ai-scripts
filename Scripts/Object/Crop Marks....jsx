﻿/**
 * Direct replacement of `Object > Create Trim Marks` with some fixes:
 * - If the selected art is a Path, crop marks will be created around **fill** as opposed to **border**.
 * - If the selected art is a Clip Group, crop marks will be created around **clip size** as opposed to **content size**.
 * 
 * And also some enhancements:
 * - Customize marks' appearance and placement.
 * - Support for creating multiple marks by duplicating.
 */

#target Illustrator
#include '../.lib/commons-colors.js'
#include '../.lib/ui-duplicate.js'

var LOCATION_TOP_LEFT = 11
var LOCATION_TOP_RIGHT = 1
var LOCATION_RIGHT_TOP = 2
var LOCATION_RIGHT_BOTTOM = 4
var LOCATION_BOTTOM_RIGHT = 5
var LOCATION_BOTTOM_LEFT = 7
var LOCATION_LEFT_BOTTOM = 8
var LOCATION_LEFT_TOP = 10

var DEFAULT_WEIGHT = 0.3 // the same value used in `Object > Create Trim Marks`

checkSingleSelection()

createDialog('Crop Marks')

dialog.main.alignChildren = 'fill'
dialog.upper = dialog.main.addHGroup()
dialog.lower = dialog.main.addVPanel('Duplicate')

var textBounds = [0, 0, 60, 21]
var editBounds = [0, 0, 100, 21]
dialog.main2 = dialog.upper.addVGroup()
dialog.main2.offset = dialog.main2.addHGroup()
dialog.main2.offset.addText(textBounds, 'Offset:', 'right')
dialog.main2.offsetEdit = dialog.main2.offset.addEditText(editBounds, '2.5 mm')
dialog.main2.offsetEdit.validateUnits()
dialog.main2.offsetEdit.active = true
dialog.main2.length = dialog.main2.addHGroup()
dialog.main2.length.addText(textBounds, 'Length:', 'right')
dialog.main2.lengthEdit = dialog.main2.length.addEditText(editBounds, '2.5 mm')
dialog.main2.lengthEdit.validateUnits()
dialog.main2.weight = dialog.main2.addHGroup()
dialog.main2.weight.addText(textBounds, 'Weight:', 'right')
dialog.main2.weightEdit = dialog.main2.weight.addEditText(editBounds, DEFAULT_WEIGHT)
dialog.main2.weightEdit.validateUnits()
dialog.main2.color = dialog.main2.addHGroup()
dialog.main2.color.addText(textBounds, 'Color:', 'right')
dialog.main2.colorList = dialog.main2.color.addDropDown(editBounds, COLORS)
dialog.main2.colorList.selection = 0

dialog.upper.add('statictext', [0, 0, 0, 10]) // gap

var checkBounds = [0, 0, 15, 15]
dialog.locations = dialog.upper.addHGroup()
dialog.locations.alignChildren = 'top'
dialog.locations.addText(textBounds, 'Locations:', 'right')
dialog.locations.row = dialog.locations.addVGroup()
dialog.locations.row1 = dialog.locations.row.addHGroup()
dialog.locations.row1.addText(checkBounds)
dialog.locations.topLeftCheck = dialog.locations.row1.addCheckBox(checkBounds)
dialog.locations.topLeftCheck.value = true
dialog.locations.row1.addText(checkBounds)
dialog.locations.topRightCheck = dialog.locations.row1.addCheckBox(checkBounds)
dialog.locations.topRightCheck.value = true
dialog.locations.row1.addText(checkBounds)
dialog.locations.row2 = dialog.locations.row.addHGroup()
dialog.locations.leftTopCheck = dialog.locations.row2.addCheckBox(checkBounds)
dialog.locations.leftTopCheck.value = true
dialog.locations.row2.addText(checkBounds, '↖︎')
dialog.locations.row2.addText(checkBounds, '↑')
dialog.locations.row2.addText(checkBounds, '↗')
dialog.locations.rightTopCheck = dialog.locations.row2.addCheckBox(checkBounds)
dialog.locations.rightTopCheck.value = true
dialog.locations.row3 = dialog.locations.row.addHGroup()
dialog.locations.row3.addText(checkBounds)
dialog.locations.row3.addText(checkBounds, '←')
dialog.locations.row3.addText(checkBounds, '●')
dialog.locations.row3.addText(checkBounds, '→')
dialog.locations.row3.addText(checkBounds)
dialog.locations.row4 = dialog.locations.row.addHGroup()
dialog.locations.leftBottomCheck = dialog.locations.row4.addCheckBox(checkBounds)
dialog.locations.leftBottomCheck.value = true
dialog.locations.row4.addText(checkBounds, '↙')
dialog.locations.row4.addText(checkBounds, '↓')
dialog.locations.row4.addText(checkBounds, '↘')
dialog.locations.rightBottomCheck = dialog.locations.row4.addCheckBox(checkBounds)
dialog.locations.rightBottomCheck.value = true
dialog.locations.row5 = dialog.locations.row.addHGroup()
dialog.locations.row5.addText(checkBounds)
dialog.locations.bottomLeftCheck = dialog.locations.row5.addCheckBox(checkBounds)
dialog.locations.bottomLeftCheck.value = true
dialog.locations.row5.addText(checkBounds)
dialog.locations.bottomRightCheck = dialog.locations.row5.addCheckBox(checkBounds)
dialog.locations.bottomRightCheck.value = true
dialog.locations.row5.addText(checkBounds)

dialog.lower.alignChildren = 'fill'
dialog.duplicate = dialog.lower.addDuplicateGroup()

setNegativeButton('Cancel')
setPositiveButton('OK', function() { process(false) })
setNeutralButton('Delete', function() { process(true) }, 90)
show()

function process(isDelete) {
    var offset = parseUnit(dialog.main2.offsetEdit.text)
    var length = parseUnit(dialog.main2.lengthEdit.text)
    var weight = parseUnit(dialog.main2.weightEdit.text)
    var color = parseColor(dialog.main2.colorList.selection.text)
    var locs = []
    var marks = []
    
    var horizontal = parseInt(dialog.duplicate.horizontalEdit.text) || 0
    var vertical = parseInt(dialog.duplicate.verticalEdit.text) || 0

    if (horizontal < 1 || vertical < 1) {
        if (dialog.locations.topLeftCheck.value) locs.push(LOCATION_TOP_LEFT)
        if (dialog.locations.topRightCheck.value) locs.push(LOCATION_TOP_RIGHT)
        if (dialog.locations.rightTopCheck.value) locs.push(LOCATION_RIGHT_TOP)
        if (dialog.locations.rightBottomCheck.value) locs.push(LOCATION_RIGHT_BOTTOM)
        if (dialog.locations.bottomRightCheck.value) locs.push(LOCATION_BOTTOM_RIGHT)
        if (dialog.locations.bottomLeftCheck.value) locs.push(LOCATION_BOTTOM_LEFT)
        if (dialog.locations.leftBottomCheck.value) locs.push(LOCATION_LEFT_BOTTOM)
        if (dialog.locations.leftTopCheck.value) locs.push(LOCATION_LEFT_TOP)

        marks = marks.concat(createCropMarks(selection[0], offset, length, weight, color, locs))
        if (isDelete) selection[0].remove()
    } else {
        // currently ignore location checkboxes in duplication
        dialog.duplicate.duplicate(function(item, h, v) {
            locs = []
            if (h == horizontal - 1) {
                locs.push(LOCATION_RIGHT_TOP, LOCATION_RIGHT_BOTTOM)
            }
            if (v == 0) {
                locs.push(LOCATION_TOP_LEFT, LOCATION_TOP_RIGHT)
            }
            if (v == vertical - 1) {
                locs.push(LOCATION_BOTTOM_LEFT, LOCATION_BOTTOM_RIGHT)
            }
            marks = marks.concat(createCropMarks(item, offset, length, weight, color, locs))
            if (isDelete) item.remove()
        }, function(item, _, v) {
            locs = [LOCATION_LEFT_BOTTOM, LOCATION_LEFT_TOP]
            if (v == 0) {
                locs.push(LOCATION_TOP_LEFT, LOCATION_TOP_RIGHT)
            }
            if (v == vertical - 1) {
                locs.push(LOCATION_BOTTOM_LEFT, LOCATION_BOTTOM_RIGHT)
            }
            marks = marks.concat(createCropMarks(item, offset, length, weight, color, locs))
            if (isDelete) item.remove()
        })
    }
    selection = marks
}

/**
 * Create multiple crop marks around target. The marks are created with clockwise ordering.
 * @param {PageItem} target - art where crop marks will be applied to
 * @param {Number} offset - space between target and crop marks
 * @param {Number} length - crop marks' width
 * @param {Number} weight - crop marks' stroke width
 * @param {CMYKColor} color - crop marks' color
 * @param {Array} locations - combination of 8 possible mark locations as defined in constants
 * @return {Array} created crop marks
 */
function createCropMarks(target, offset, length, weight, color, locations) {
    var marks = []
    var clippingTarget = target.getClippingPathItem()
    var width = clippingTarget.width
    var height = clippingTarget.height
    var startX = clippingTarget.position[0]
    var endX = startX + width
    var startY = clippingTarget.position[1]
    var endY = startY - height

    for (var i = 0; i < locations.length; i++) {
        var location = locations[i]
        switch (location) {
            case LOCATION_TOP_LEFT:
                marks.push(createCropMark(
                    'TOP_LEFT', weight, color,
                    startX,
                    startY + offset,
                    startX,
                    startY + offset + length
                ))
                break;
            case LOCATION_TOP_RIGHT:
                marks.push(createCropMark(
                    'TOP_RIGHT', weight, color,
                    endX,
                    startY + offset,
                    endX,
                    startY + offset + length
                ))
                break;
            case LOCATION_RIGHT_TOP: 
                marks.push(createCropMark(
                    'RIGHT_TOP', weight, color,
                    endX + offset,
                    startY,
                    endX + offset + length,
                    startY
                ))
                break;
            case LOCATION_RIGHT_BOTTOM: 
                marks.push(createCropMark(
                    'RIGHT_BOTTOM', weight, color,
                    endX + offset,
                    endY,
                    endX + offset + length,
                    endY
                ))
                break;
            case LOCATION_BOTTOM_RIGHT: 
                marks.push(createCropMark(
                    'BOTTOM_RIGHT', weight, color,
                    endX,
                    endY - offset,
                    endX,
                    endY - offset - length
                ))
                break;
            case LOCATION_BOTTOM_LEFT: 
                marks.push(createCropMark(
                    'BOTTOM_LEFT', weight, color,
                    startX,
                    endY - offset,
                    startX,
                    endY - offset - length
                ))       
                break;
            case LOCATION_LEFT_BOTTOM: 
                marks.push(createCropMark(
                    'LEFT_BOTTOM', weight, color,
                    startX - offset,
                    endY,
                    startX - offset - length,
                    endY
                ))
                break;
            case LOCATION_LEFT_TOP: 
                marks.push(createCropMark(
                    'LEFT_TOP', weight, color,
                    startX - offset,
                    startY,
                    startX - offset - length,
                    startY
                ))
                break;
            default:
                throw 'Unrecognizable location ' + location
        }
    }
    return marks
}

/**
 * Create individual crop mark from point A to point B.
 * @param {String} suffixName - item name in the layer
 * @param {Number} weight - crop marks' stroke width
 * @param {CMYKColor} color - crop marks' color
 * @param {Number} fromX - starting X point
 * @param {Number} fromY - starting Y point
 * @param {Number} toX - destination X point
 * @param {Number} toY - destination Y point
 * @return {PathItem} created crop mark
 */
function createCropMark(suffixName, weight, color, fromX, fromY, toX, toY) {
    var mark = document.pathItems.add()
    mark.name = 'Crop ' + suffixName
    mark.fillColor = COLOR_NONE
    mark.strokeColor = color
    mark.strokeWidth = weight // important to set weight before color

    var fromPosition = [fromX, fromY]
    var fromPoint = mark.pathPoints.add()
    fromPoint.anchor = fromPosition
    fromPoint.leftDirection = fromPosition
    fromPoint.rightDirection = fromPosition

    var toPosition = [toX, toY]
    var toPoint = mark.pathPoints.add()
    toPoint.anchor = toPosition
    toPoint.leftDirection = toPosition
    toPoint.rightDirection = toPosition

    return mark
}