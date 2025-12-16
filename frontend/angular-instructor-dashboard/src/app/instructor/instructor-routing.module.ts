// src/app/instructor/instructor-routing.module.ts (Conceptual)

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseManagerComponent } from './components/courses/course-manager/course-manager.component';
import { CourseEditorComponent } from './components/courses/course-editor/course-editor.component';
import { ExamBuilderComponent } from './components/exams/exam-builder/exam-builder.component';
import { AttemptReviewComponent } from './components/exams/attempt-review/attempt-review.component';
import { MessagingToolComponent } from './components/messaging/messaging-tool/messaging-tool.component';
import { DashboardHomeComponent } from './components/dashboard/dashboard-home/dashboard-home.component';

const routes: Routes = [
  // Instructor Dashboard Home
  { path: 'dashboard', component: DashboardHomeComponent },

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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InstructorRoutingModule { }