# install node modeles
npm install

# install pdftk // splits multi-page pdf into single pages.
apt-get install pdftk
# install pdftotext // extract text out of searchable pdf documents
apt-get install poppler-utils
# install ghostscript // an ocr preprocessor which convert pdfs to tif files for input into tesseract
apt-get install ghostscript
# install tesseract // performs the actual ocr on your scanned images
apt-get install tesseract-ocr


# For the OCR to work, you need to have the tesseract-ocr binaries available on your path. 
# If you only need to handle ASCII characters, the accuracy of the OCR process can be increased by 
# limiting the tesseract output. To do this copy the alphanumeric file included with this pdf-extract 
# module into the tess-data folder on your system. Also the eng.traineddata included with the standard 
# tesseract-ocr package is out of date. This pdf-extract module provides an up-to-date version which you 
# should copy into the appropriate location on your system.
cd node_modules/pdf-extract/
cp ./share/eng.traineddata /usr/share/tesseract-ocr/4.00/tessdata/eng.traineddata 
cp ./share/configs/alphanumeric /usr/share/tesseract-ocr/4.00/tessdata/configs/alphanumeric
