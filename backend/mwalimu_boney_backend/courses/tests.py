from django.test import TestCase
# courses/tests.py (for Antivirus Security)

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from courses.validators import AntivirusValidator
from rest_framework.serializers import ValidationError
from unittest.mock import patch

class ResourceValidationTests(APITestCase):
    
    # EICAR test string: Standard string used to test antivirus software detection
    EICAR_STRING = b'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*'
    
    def setUp(self):
        self.validator = AntivirusValidator()
        self.clean_file = SimpleUploadedFile("clean.txt", b"This is a clean file.")
        self.infected_file = SimpleUploadedFile("infected.txt", self.EICAR_STRING)

    # Use a mock patch to simulate the AV service response in a real environment
    @patch('courses.validators.requests.post')
    def test_file_is_clean(self, mock_post):
        """A clean file should pass validation."""
        # Mock the AV API response to be 'CLEAN'
        mock_post.return_value.json.return_value = {'status': 'CLEAN'}
        
        # Validation should succeed without raising an error
        try:
            self.validator(self.clean_file)
        except ValidationError:
            self.fail("Clean file raised ValidationError unexpectedly!")

    @patch('courses.validators.requests.post')
    def test_infected_file_raises_validation_error(self, mock_post):
        """An infected file must raise a ValidationError."""
        # Mock the AV API response to be 'INFECTED' and include a reason
        mock_post.return_value.json.return_value = {
            'status': 'INFECTED', 
            'reason': 'EICAR-Test-File'
        }
        
        with self.assertRaisesMessage(ValidationError, "File upload failed: Malware detected (EICAR-Test-File)."):
            self.validator(self.infected_file)