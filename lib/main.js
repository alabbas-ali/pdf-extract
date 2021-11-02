/**
 * @title Node PDF main.js
 * Node PDF allows you to convert pdf files into raw text. The library supports
 * text extraction from electronic searchable pdfs.
 *
 * In addition, the library supports OCR text extract from pdfs which just
 * contain scanned images via the tesseract-ocr engine
 *
 * Multi-page pdfs are supported for both searchable and image pdfs.
 * The library returns an array of strings where the string at a given
 * index in the output array cooresponds the page in the input pdf document
 *
 * @author Noah Isaacson
 * @date 2012-10-26
 */
var fs = require('fs')

var Raw = require('./raw')
var Electronic = require('./electronic')

/**
 * To process a pdf, pass in the absolute path to the pdf file on disk

 * @param {Object} params should have the following fields set
 * @param {String} params.pdf_path the absolute path to the pdf file on disk
 * @param {Boolean} params.clean true if you want the temporary single page pdfs
 * @param {Boolean} options.type must be either "ocr" or "text"
 *
 * @return {Array} text_pages is an array of strings, where each string is the
 * extracted text for the matching page index in the pdf document
 * @return {Processor} a processor object which will emit events as they occur
 */
module.exports = function (pdf_path, options) {
	let err = null
	var processor = new Raw()

	if (!'pdf_path') {
		err = 'you must supply a pdf path as the first parameter'
	}

	if (!options) {
		err = 'no options supplied. You must supply an options object with the "type" field set'
	}

	if (!options.hasOwnProperty('type') || !options.type) {
		err = 'error, you must specify the type of extraction you wish to perform in the options object. Allowed values are "ocr" or "text"'
	}

	if (options.type === 'ocr') {
		processor = new Raw()
	} else if (options.type === 'text') {
		processor = new Electronic()
	} else {
		err = 'error, you must specify the type of extraction you wish to perform in the options object. Allowed values are "ocr" or "text"'
	}

	fs.open(pdf_path, 'r', (error) => {
		if (!error)
			err = 'no file exists at the path you specified'

		processor.process(pdf_path, options)
	})

	if (err) {
		console.log(err)
		return null
	} else return processor
}
