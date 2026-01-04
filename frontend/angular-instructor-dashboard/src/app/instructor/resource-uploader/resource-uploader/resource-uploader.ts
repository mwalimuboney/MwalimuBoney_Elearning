import { Component, OnDestroy, Input } from '@angular/core';
import { ResourceService } from '../../services/resource';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
// Security: Max file size 50 MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'audio/mpeg',
  'audio/wav'
];

@Component({
  selector: 'app-resource-uploader',
  templateUrl: './resource-uploader.html',
  styleUrls: ['./resource-uploader.css'],
  providers: [ResourceService],
  imports: [CommonModule]
})
export class ResourceUploaderComponent implements OnDestroy {
  @Input() lessonId!: number;
  uploadProgress = 0;
  uploadError: string | null = null;

  private uploadSub?: Subscription;

  constructor(private resourceService: ResourceService) {}

  /**
   * Validates and uploads a file with client-side security checks.
   * @param file The file to be uploaded.
   * @param title The title of the resource.
   * @param courseId The ID of the course.
   */
  uploadResource(file: File, title: string, courseId: number): void {
    this.uploadError = null;

    // Security: Validate file before upload
    const validationError = this.validateFile(file);
    if (validationError) {
      this.uploadError = validationError;
      return;
    }

    this.reset();
    const uploadData = {
      title: title,
      courseId: courseId,
      file: file
    };

    this.uploadSub = this.resourceService.uploadResource(uploadData).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const loaded = event.loaded ?? 0;
          const total = event.total ?? 0;
          this.uploadProgress = total ? Math.round((loaded / total) * 100) : 0;
        } else if (event.type === HttpEventType.Response) {
          this.uploadProgress = 100;
        }
      },
      error: (err) => this.handleUploadError(err),
      complete: () => {
        // Upload successful
      }
    });
  }

  /**
   * Validates file size and type before upload.
   * Returns error message if invalid, null if valid.
   */
  private validateFile(file: File): string | null {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds limit (max ${MAX_FILE_SIZE / (1024 * 1024)}MB).`;
    }

    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return 'File type not allowed. Supported types: PDF, Office docs, images, audio, video.';
    }

    // Sanitize filename check (prevent directory traversal)
    if (file.name.includes('..') || file.name.includes('/')) {
      return 'Invalid filename.';
    }

    return null;
  }

  private reset(): void {
    this.uploadProgress = 0;
    if (this.uploadSub) {
      this.uploadSub.unsubscribe();
      this.uploadSub = undefined;
    }
  }

  /**
   * Handles upload errors with typed error checking to prevent injection.
   */
  private handleUploadError(error: any): void {
    // Type guard: ensure error object is safe
    const errorDetail = error?.error?.file?.[0];

    if (errorDetail && typeof errorDetail === 'object') {
      const code = String(errorDetail.code ?? '').toLowerCase();
      const msg = String(errorDetail.message ?? '').slice(0, 100); // Limit message length

      if (code === 'malware_detected') {
        this.uploadError = `Security Alert: File was rejected by security scan.`;
      } else if (code === 'file_too_large') {
        this.uploadError = `Upload failed: File size exceeded server limit.`;
      } else {
        this.uploadError = `Upload failed: Invalid file or format.`;
      }
    } else if (error?.message && typeof error.message === 'string') {
      this.uploadError = `Upload failed: Please try again.`;
    } else {
      this.uploadError = 'An unknown error occurred during upload.';
    }
  }

  ngOnDestroy(): void {
    if (this.uploadSub) {
      this.uploadSub.unsubscribe();
    }
  }
};
