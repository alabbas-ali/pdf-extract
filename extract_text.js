const path = require("path")
const pdf_extract = require('./lib/main')

const absolute_path_to_pdf = path.resolve(process.argv[2])
if (absolute_path_to_pdf.includes(" ")) throw new Error("will fail for paths w spaces like " + absolute_path_to_pdf)

const options = {
  type: 'text', // extract searchable text from PDF
  ocr_flags: ['--psm 1'], // automatically detect page orientation
  enc: 'UTF-8',  // optional, encoding to use for the text output
  mode: 'layout' // optional, mode to use when reading the pdf
}
const processor = pdf_extract(absolute_path_to_pdf, options)
processor.on('complete', data => callback(null, data))
processor.on('error', callback)
function callback(error, data) {
  error ? console.error(error) : console.log('data', data)
}
