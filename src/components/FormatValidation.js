import * as XLSX from 'xlsx';
class FormatValidation {
  validateFile(selectedFile, onValidationComplete) {
    const handleValidation = () => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const expectedHeaders = ['QuestionId', 'Question Title', 'Difficulty Level', 'Subject'];
          const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

         
          if (sheetData.length === 0) {
            console.error('No data found in the Excel sheet.');
            onValidationComplete(false);
            return;
          }

         
          const isValidFormat = expectedHeaders.every(header => sheetData[0].includes(header));
          onValidationComplete(isValidFormat);
        };
        reader.readAsArrayBuffer(selectedFile);
      } catch (error) {
        console.error('Error reading or validating the file:', error);
        onValidationComplete(false);
      }
    };

    handleValidation();
  }
}

export default FormatValidation;
