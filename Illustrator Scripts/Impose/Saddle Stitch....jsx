#target Illustrator
#include '../.lib/core.js'
#include '../.lib/ui/impose.js'
#include '../.lib/ui/relink.js'

var dialog = new Dialog('Impose Saddle Stich')
var files = openFile(dialog.title, [
    ['Adobe Illustrator', 'ai'],
    ['Adobe PDF', 'pdf'],
    ['BMP', 'BMP'],
    ['GIF89a', 'GIF'],
    ['JPEG', 'JPG', 'JPE', 'JPEG'],
    ['JPEG2000', 'JPF', 'JPX', 'JP2', 'J2K', 'J2C', 'JPC'],
    ['PNG', 'PNG', 'PNS'],
    ['Photoshop', 'PSD', 'PSB', 'PDD'],
    ['TIFF', 'TIF', 'TIFF']
], true)

if (files !== null && files.isNotEmpty()) {
    if (files.filter(function(it) { return it.isPDF() }).isNotEmpty()) {
        check(files.length === 1, 'Only supports single PDF file')
    }

    var textBounds = [0, 0, 45, 21]
    var editBounds = [0, 0, 100, 21]

    if (files.first().isPDF()) {
        dialog.pdf = new RelinkPDFPanel(dialog.main, textBounds, editBounds)
    }

    dialog.impose = new ImposePanel(dialog.main, textBounds, editBounds)

    dialog.setNegativeButton('Cancel')
    dialog.setPositiveButton(function() {
        var pages = dialog.impose.getPages()
        var width = dialog.impose.getWidth()
        var height = dialog.impose.getHeight()
        var startPage, endPage
        if (files.first().isPDF()) {
            startPage = 1
            endPage = pages
        } else {
            startPage = 0
            endPage = pages - 1
        }
        var isFront = true

        if (pages === 0 || pages % 4 !== 0) {
            alert('Total pages must be a non-zero number that can be divided by 4.')
        } else {
            var document = app.documents.add(DocumentColorSpace.CMYK, width * 2, height, pages / 2)
            document.artboards.forEach(function(artboard) {
                var rect = artboard.artboardRect
                var artboardRight = rect[0] + rect[2]
                var artboardBottom = rect[1] + rect[3]

                var leftItem = document.placedItems.add()
                var rightItem = document.placedItems.add()
                if (files.first().isPDF()) {
                    updatePDFPreferences(dialog.pdf.getBoxType(), isFront ? endPage : startPage)
                    leftItem.file = files.first()
                    updatePDFPreferences(dialog.pdf.getBoxType(), isFront ? startPage : endPage)
                    rightItem.file = files.first()
                } else {
                    leftItem.file = files[isFront ? endPage : startPage]
                    rightItem.file = files[isFront ? startPage : endPage]
                }
                leftItem.width = width
                rightItem.width = width
                leftItem.height = height
                rightItem.height = height
                leftItem.position = [(artboardRight - width) / 2 - width / 2, (artboardBottom + height) / 2]
                rightItem.position = [(artboardRight - width) / 2 + width / 2, (artboardBottom + height) / 2]
                
                startPage++
                endPage--
                isFront = !isFront
            })
        }
    })
    dialog.show()
}