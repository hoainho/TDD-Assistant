
declare const mammoth: any;

export const extractTextFromDocx = async (file: File): Promise<string> => {
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onload = async (event) => {
      if (!event.target?.result) {
        return reject(new Error("Failed to read file."));
      }

      try {
        const arrayBuffer = event.target.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve(result.value);
      } catch (error) {
        console.error("Error parsing DOCX:", error);
        if (error instanceof Error) {
            reject(new Error(`Failed to parse DOCX: ${error.message}`));
        } else {
            reject(new Error("An unknown error occurred during DOCX parsing."));
        }
      }
    };

    fileReader.onerror = () => {
      reject(new Error("Error reading file."));
    };

    fileReader.readAsArrayBuffer(file);
  });
};
