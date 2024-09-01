export const getRole = (): string => {
    const rolesMap: { [key: string]: string } = {
      adminRole: 'admin',
      parentRole: 'parent',
      sitterRole: 'sitter',
    };
  
    for (const key in rolesMap) {
      const storedRole = localStorage.getItem(key);
      if (storedRole) {
        return rolesMap[key];
      }
    }
  
    return '';
  };
  
  

  export const getLoginPageForRole = (role: string | null): string => {
    switch (role) {
      case 'admin':
        return '/admin/login';
      case 'sitter':
        return '/sitter/sitterlogin';
      case 'parent':
        return '/parent/parentlogin';
      default:
        return '/login';
    }
  };
  