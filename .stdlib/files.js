File.prototype.fileName = function() { return unescape(this.name).substringBeforeLast('.') }

File.prototype.fileExt = function() { return unescape(this.name).substringAfterLast('.').toLowerCase() }

/**
 * Returns true if this file is PDF type, and should be opened with `PDFFileOptions`.
 * @return {Boolean}
 */
File.prototype.isPDF = function() {
    var ext = this.fileExt().toLowerCase()
    return ext === 'ai' || ext === 'pdf'
}