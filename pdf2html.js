const path = require("path")
const pdf2html = require('pdf2html')
var fs = require('fs')

const absolute_path_to_pdf = path.resolve(process.argv[2])
if (absolute_path_to_pdf.includes(" ")) throw new Error("will fail for paths w spaces like " + absolute_path_to_pdf)

pdf2html.html(absolute_path_to_pdf, (err, html) => {
    if (err) {
        console.error('Conversion error: ' + err)
        return
    }
    const parts = absolute_path_to_pdf.split('/')
    out_put_path = `./temp/${parts[parts.length-1]}.html`
    fs.writeFile(out_put_path, html, (err) => {
        if (err) {
            console.error('file save error: ' + err)
            return
        }

        console.log("The file was saved!");
    })
})
