﻿/**
 * Create 2,5mm trim marks with 2,5mm bleed around the selected path item.
 * The marks are created with clockwise ordering.
 * The selected item will be deleted afterwards.
 */

#target Illustrator
#include '../util/preconditions.jsx'
#include '../util/units.jsx'
#include '../util/trim_marks.jsx'

checkActiveDocument()

const document = app.activeDocument
const selection = document.selection

checkSingleSelection(selection)

const selectedItem = selection[0]

checkTypename(selectedItem, 'PathItem')

const defaultSize = mm(2.5)
createTrimMarks(selectedItem, defaultSize, defaultSize, MARK_ALL)
selectedItem.remove()