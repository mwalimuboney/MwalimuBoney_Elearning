// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-resource-uploader',
//   imports: [],
//   templateUrl: './resource-uploader.html',
//   styleUrl: './resource-uploader.css',
// })


// ... imports
import { Component } from '@angular/core';
import { ResourceService } from '../../core/services/resource.service';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-resource-uploader',
  templateUrl: './resource-uploader.component.html',
  styleUrls: ['./resource-uploader.component.scss'],
  providers: [ResourceService]
})
export class ResourceUploaderComponent {
  uploadProgress: number = 0;
  uploadError: string | null = null;

  constructor(private resourceService: ResourceService) {}

  /**
   * Handles file upload with detailed error handling for specific cases.
   * @param file The file to be uploaded.
   */
  uploadResource(file: File): void {
    this.uploadProgress = 0;
    this.uploadError = null;

    const uploadData = new FormData();
    uploadData.append('file', file);

    this.resourceService.uploadResource(uploadData).subscribe({
      next: (event) => { /* handle progress */ },
      error: (err) => this.handleUploadError(err),
      complete: () => { /* success */ }
    });
  }

  /**
   * Handles specific upload errors and sets user-friendly messages.
   * @param error The error response from the upload attempt.
   */
  private handleUploadError(error: any): void {
    const errorDetail = error.error?.file?.[0]; // Access the error message for the 'file' field
    
    if (errorDetail) {
      if (errorDetail.code === 'malware_detected') {
        this.uploadError = `Security Alert: Upload failed. ${errorDetail.message}`;
      } else if (errorDetail.code === 'file_too_large') {
        this.uploadError = `Upload failed: File size exceeded.`;
      } else {
        this.uploadError = `Upload failed: Invalid file type or general error.`;
      }
    } else {
      this.uploadError = 'An unknown error occurred during upload.';
    }
  }
}
