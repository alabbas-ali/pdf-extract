/**
 * Module which extracts the text out of an electronic pdf file
 * This module can handle multi-page pdf files

 */
var util = require('util')
var events = require('events')
var fs = require('fs')
var async = require('async')
var split = require('./split.js')
var convert = require('./convert.js')
var pathHash = require('pathhash')
var ocr = require('./ocr.js')

class Raw extends events.EventEmitter {

	self = this

	/**
	 * @param {String} pdf_path path to the pdf file on disk
	 * @param {Boolean} params.clean true to remove the temporary single-page pdf
	 *   files from disk. Sometimes however you might want to be able to use those
	 *   single page pdfs after the ocr completes. In this case pass clean = false
	 *
	 * @return {Array} text_pages an array of the extracted text where
	 *   each entry is the text for the page at the given index
	 * @return callback(<maybe error>, text_pages)
	 */
	process(pdf_path, options) {

		var text_pages = []
		var split_output

		if (!options) {
			options = {}
		}

		// default to removing the single page pdfs after ocr completes
		if (!options.hasOwnProperty('clean')) {
			options.clean = true
		}

		pathHash(pdf_path, (err, hash) => {

			if (err) {
				this.emit('error', {
					error: `error hashing file at the path you specified:  ${pdf_path}. ${err}`,
					pdf_path: pdf_path
				})
				return
			}

			split(pdf_path, (err, output) => {

				if (err) {
					this.emit('error', { error: err, pdf_path: pdf_path })
					return
				}

				if (!output) {
					this.emit('error', {
						error: 'no files returned from split',
						pdf_path: pdf_path
					})
					return
				}

				this.emit('log', 'finished splitting pages for file at path ' + pdf_path)
				split_output = output
				var pdf_files = output.files
				if (!pdf_files || pdf_files.length == 0) {
					this.emit('error', {
						error: 'error, no pages where found in your pdf document',
						pdf_path: pdf_path
					})
					return
				}
				var index = 0
				var num_pages = pdf_files.length
				var single_page_pdf_file_paths = []
				async.forEachSeries(
					pdf_files,
					// extract the text for each page via ocr
					(pdf_file, cb) => {

						var quality = 300
						if (options.hasOwnProperty('quality') && options.quality) {
							quality = options.quality
						}

						convert(pdf_file.file_path, quality, (err, tif_path) => {

							var zeroBasedNumPages = num_pages - 1
							this.emit('log', `converted page to intermediate tiff file, page ${index} (0-based indexing) of ${zeroBasedNumPages}`)

							if (err)
								return cb(err)

							var ocr_flags = [
								'-psm 6'
							]
							if (options.ocr_flags) {
								ocr_flags = options.ocr_flags
							}
							ocr(tif_path, ocr_flags, (err, extract) => {
								fs.unlink(tif_path, (tif_cleanup_err, _reply) => {

									if (tif_cleanup_err) {
										err += `, error removing temporary tif file: "${tif_cleanup_err}"`
									}

									if (err)
										return cb(err)

									var page_number = index + 1
									this.emit('log', `raw ocr: page ${index} (0-based indexing) of ${zeroBasedNumPages} complete`)
									single_page_pdf_file_paths.push(pdf_file.file_path)
									this.emit('page', { hash: hash, text: extract, index: index, num_pages: num_pages, pdf_path: pdf_path, single_page_pdf_path: pdf_file.file_path })
									text_pages.push(extract)
									index++
									cb()
								})
							})
						})
					}, (err) => {
						if (err) {
							this.emit('error', err)
							return
						}
						this.emit('complete', { hash: hash, text_pages: text_pages, pdf_path: pdf_path, single_page_pdf_file_paths: single_page_pdf_file_paths })
					})
			})
		})
	}
}

module.exports = Raw