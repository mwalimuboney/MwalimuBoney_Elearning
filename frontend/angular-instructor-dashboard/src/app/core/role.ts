export enum UserRole {
  Student = 'STUDENT',
  Teacher = 'TEACHER',
  Parent = 'PARENT',
  SuperAdmin = 'SUPER_ADMIN',
  SchoolAdmin = 'SCHOOL_ADMIN',
  DeptAdmin = 'DEPT_ADMIN',
  Administrator = 'ADMINISTRATOR'
}


export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  phone_number?: string;
  profile_picture?: string;
}