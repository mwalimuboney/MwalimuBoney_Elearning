# ai_features/services/file_extraction_service.py

import io
from docx import Document # pip install python-docx
from PyPDF2 import PdfReader # pip install pypdf

class FileExtractionService:
    
    @staticmethod
    def extract_text(uploaded_file) -> str:
        """
        Extracts text content from a Django UploadedFile object.
        """
        filename = uploaded_file.name.lower()
        
        # Use io.BytesIO to read the file content without saving it to disk first
        file_stream = io.BytesIO(uploaded_file.read())

        if filename.endswith('.pdf'):
            return FileExtractionService._extract_from_pdf(file_stream)
        
        elif filename.endswith('.docx'):
            return FileExtractionService._extract_from_docx(file_stream)
            
        else:
            raise ValueError("Unsupported file format for extraction.")

    @staticmethod
    def _extract_from_pdf(stream: io.BytesIO) -> str:
        text = ""
        reader = PdfReader(stream)
        for page in reader.pages:
            text += page.extract_text() + "\n\n"
        return text

    @staticmethod
    def _extract_from_docx(stream: io.BytesIO) -> str:
        document = Document(stream)
        text = "\n\n".join([paragraph.text for paragraph in document.paragraphs])
        return text