import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getRole, getLoginPageForRole } from './role';

type ComponentProps = Record<string, unknown>;

interface SecuredRouteProps<T extends ComponentProps> {
  element: React.ComponentType<T>;   // Component type to render
  requiredRole: string;              // Role required to access the route
  componentProps?: T;                // Props to be passed to the component
}

const SecuredRoute = <T extends ComponentProps>({
  element: Component,
  requiredRole,
  componentProps = {} as T,
}: SecuredRouteProps<T>): JSX.Element => {
  const role = getRole();
  const location = useLocation();

  if (role === requiredRole) {
    console.log(role,'role')
    console.log(requiredRole,'req')
    return <Component {...componentProps} />;
  } else {
    const loginPage = getLoginPageForRole(role);
    return <Navigate to={loginPage} state={{ from: location }} replace />;
  }
};

export default SecuredRoute;
