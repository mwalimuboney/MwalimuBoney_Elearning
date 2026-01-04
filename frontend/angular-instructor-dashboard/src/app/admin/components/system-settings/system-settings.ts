

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sound-settings',
  templateUrl: './system-settings.html',
  styleUrl: './system-settings.css',
  imports: [ 
    CommonModule
  ],
 
})
export class SoundSettingsComponent implements OnInit {
  soundSettings: Array<{ name: string; eventKey: string; event_key: string; url: string }> = [];
  
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}
  
  ngOnInit() {
    // 1. Fetch current sound settings (event_key and current audio_file.url)
    this.http.get('/api/admin/sounds/').subscribe({
      next: (data: any) => this.soundSettings = data || [],
      error: (err) => {
        console.error('Failed to load sound settings', err);
        this.soundSettings = [];
      }
    });
  }
  
  testSound(url: string): void {
    if (url) {
      new Audio(url).play();
    }
  }

  getSafeUrl(url?: string): SafeUrl | null {
    if (!url) return null;
    // Use DomSanitizer to avoid Angular blocking the resource URL in templates
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  handleFileUpload(event: any, eventKey: string): void {
    const file = event.target.files[0];
    if (file) {
      // 2. Upload the file to the dedicated Django endpoint
      const formData = new FormData();
      formData.append('audio_file', file);
      formData.append('event_key', eventKey);
      
      this.http.post('/api/admin/sounds/upload/', formData).subscribe({
        next: (response: any) => {
          alert(`Successfully updated sound for ${eventKey}`);
          // Update the local URL to the new file URL
          const setting = this.soundSettings.find(s => s.eventKey === eventKey || s.event_key === eventKey);
          // backend may return new_url or audio_file.url — handle both
          const newUrl = response.new_url || response.audio_file?.url || response.url;
          if (setting && newUrl) {
            setting.url = newUrl;
          }
        },
        error: (err) => alert('Upload failed: Ensure file is valid audio.')
      });
    }
  }
}
