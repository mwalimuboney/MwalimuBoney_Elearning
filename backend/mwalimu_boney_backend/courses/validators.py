# courses/validators.py (Conceptual Django File)

from django.core.exceptions import ValidationError
from django.conf import settings
import socket # Used to communicate with the ClamAV daemon

# Configuration (Assume you set CLAMAV_HOST and CLAMAV_PORT in settings.py)
CLAMAV_HOST = getattr(settings, 'CLAMAV_HOST', '127.0.0.1')
CLAMAV_PORT = getattr(settings, 'CLAMAV_PORT', 3310)
CLAMAV_MAX_SIZE = getattr(settings, 'CLAMAV_MAX_SIZE', 10 * 1024 * 1024) # 10MB default

class FileAntiVirusValidator:
    """
    Connects to a running ClamAV daemon (clamd) to scan uploaded files.
    """
    def __call__(self, value):
        # 1. Check file size limit before scanning
        if value.size > CLAMAV_MAX_SIZE:
             raise ValidationError(
                f"File size exceeds the limit of {CLAMAV_MAX_SIZE / (1024*1024):.0f}MB.", 
                code='file_too_large'
            )

        # 2. Establish connection to ClamAV
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((CLAMAV_HOST, CLAMAV_PORT))
        except socket.error:
            # If ClamAV is down, you may choose to raise an error or log a warning and proceed
            print("WARNING: Could not connect to ClamAV. Skipping scan.")
            return # Proceed without scanning if the service is unavailable (DANGEROUS in production)
            
        # 3. Use INSTREAM command for scanning files without saving them first
        sock.sendall(b'zINSTREAM\0')

        chunk_size = 4096
        # Reset file pointer to the beginning
        value.seek(0)
        
        # 4. Stream the file data to ClamAV
        for chunk in value.chunks():
            sock.sendall(len(chunk).to_bytes(4, byteorder='big'))
            sock.sendall(chunk)
            
        # Send zero-length block to signify end of file stream
        sock.sendall(b'\0\0\0\0')
        
        # 5. Receive and parse the response
        response = sock.recv(1024).decode().strip()
        sock.close()

        # Expected infected response format: 'stream: FOUND VIRUS_NAME'
        if 'FOUND' in response:
            virus_name = response.split(' ')[-1]
            raise ValidationError(
                f"The file contains malware ({virus_name}) and cannot be uploaded.", 
                code='malware_detected'
            )
        
        # Ensure the file pointer is reset for Django to save the file later
        value.seek(0)

class MaxFileSizeValidator:
    """
    Validates that the uploaded file does not exceed a maximum size.
    """
    def __init__(self, max_size):
        self.max_size = max_size

    def __call__(self, value):
        if value.size > self.max_size:
            raise ValidationError(
                f"File size exceeds the limit of {self.max_size / (1024*1024):.0f}MB.", 
                code='file_too_large'
            )
# Example usage:
# In your serializers.py or forms.py, you can use these validators as follows:
# from .validators import FileAntiVirusValidator, MaxFileSizeValidator
