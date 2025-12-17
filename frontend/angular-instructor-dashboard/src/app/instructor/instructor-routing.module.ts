// src/app/instructor/instructor-routing.module.ts (Conceptual)

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseManagerComponent } from './course-manager/course-manager/course-manager';
import { CourseEditorComponent } from './course-editor/course-editor';
import { ExamBuilderComponent } from './components/exams/exam-builder/exam-builder/exam-builder';
import { AttemptReviewComponent } from './components/exams/attempt-review/attempt-review';
import { MessagingToolComponent } from './components/messaging/messaging-tool/messaging-tool';
import { DashboardHomeComponent } from './components/dashboard/dashboard-home/dashboard-home';

const routes: Routes = [
  // Instructor Dashboard Home
  { path: '', component: DashboardHomeComponent },

  // Course Content Management
  { path: 'courses', component: CourseManagerComponent },
  { path: 'courses/new', component: CourseEditorComponent },
  { path: 'courses/:id/edit', component: CourseEditorComponent },
  
  // Assessment Management
  { path: 'exams/new', component: ExamBuilderComponent },
  { path: 'exams/:id/edit', component: ExamBuilderComponent },
  { path: 'attempts/:id/review', component: AttemptReviewComponent }, // Grading UI

  // Communication Tools
  { path: 'messages', component: MessagingToolComponent },

  // Default redirect for the instructor segment
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 

  
  { path: 'courses', component: CourseManagerComponent },
  { path: 'courses/:id/edit', component: CourseEditorComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' } // default to /instructor/dashboard
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InstructorRoutingModule { }