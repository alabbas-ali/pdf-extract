/**
 * Module which extracts the text out of an electronic pdf file
 * This module can handle multi-page pdf files
 */
var fs = require('fs')
var async = require('async')

var rimraf = require('rimraf')
var util = require('util')
var events = require('events')

var split = require('./split.js')
var searchable = require('./searchable.js')
var pathhash = require('pathhash')

class Electronic extends events.EventEmitter {

	this = this

	/**
	 * @param pdf_path path to the pdf file on disk
	 *
	 * @return {Array} text_pages an array of the extracted text where
	 *   each entry is the text for the page at the given index
	 * @return callback(<maybe error>, text_pages)
	 */
	process(pdf_path, options) {
		var text_pages = []
		var split_output
		var single_page_pdf_file_paths = []

		pathhash(pdf_path, (err, hash) => {
			if (err) {
				this.emit('error', { 
					error: `error hashing file at the path you specified: ${pdf_path}. ${err}`,
					pdf_path: pdf_path,
				})
				return
			}
			// split the pdf into single page pdf files
			split(pdf_path, options.pdf_password, (err, output) => {

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
				async.forEachSeries(
					pdf_files,
					// extract the text for each page
					(pdf_file, cb) => {
						index++
						searchable(pdf_file.file_path, options, (err, extract) => {
							if (err) {
								this.emit('error', { error: err, pdf_path: pdf_path })
								return
							}
							text_pages.push(extract)
							var file_path = pdf_file.file_path
							single_page_pdf_file_paths.push(pdf_file.file_path)
							this.emit('page', {
								hash: hash,
								text: extract,
								index: index,
								pdf_path: pdf_path,
							})
							cb()
						})
					}, (err) => {
						if (!err) {
							this.emit('complete', {
								hash: hash,
								text_pages: text_pages,
								pdf_path: pdf_path,
								single_page_pdf_file_paths: single_page_pdf_file_paths,
							})
							return
						}
						this.emit('error', { error: err, pdf_path: pdf_path })
						if (!split_output || !split_output.folder)
							return

						fs.read(split_output.folder, 'r', (error) => {
							if (error) return
							const remove_cb = () => { }
							rimraf(split_output.folder, remove_cb)
						})
					}
				)
			})
		})
	}
}

module.exports = Electronic
