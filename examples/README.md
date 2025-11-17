# Example PDFs

This directory should contain example PDF files with AcroForm fields for testing.

## Creating Test PDFs

You can create test PDFs with form fields using tools like:
- Adobe Acrobat
- PDFtk
- LibreOffice (export to PDF with form fields)
- Online PDF form creators

## Test Cases

1. **Simple Text Fields**: PDF with text input fields
2. **Checkboxes**: PDF with checkbox fields
3. **Radio Buttons**: PDF with radio button groups
4. **Dropdowns**: PDF with dropdown/select fields
5. **Mixed Fields**: PDF with multiple field types
6. **No AcroForm**: Regular PDF without form fields (should return error)
7. **XFA Form**: PDF with XFA forms (should return error)

## Note

For security reasons, do not commit actual PDF files to the repository.
Instead, document how to create test PDFs or use a test fixture generator.

