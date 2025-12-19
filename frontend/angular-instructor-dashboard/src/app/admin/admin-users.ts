
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'DEPT_ADMIN';
  school_id?: number;
  dept_id?: number;
  is_active: boolean;
  last_login?: string;
}

export class AdminUsersService {
  
}
