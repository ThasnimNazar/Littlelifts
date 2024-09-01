import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getRole } from './role';

type ComponentProps = Record<string, unknown>;

interface PublicRouteProps<T extends ComponentProps> {
  element: React.ComponentType<T>;  
  componentProps?: T;                
}

const PublicRoute = <T extends ComponentProps>({
  element: Component,
  componentProps = {} as T,
}: PublicRouteProps<T>): JSX.Element => {
  const role = getRole();
  const location = useLocation();

  return (
    !role
      ? <Component {...componentProps} />
      : <Navigate to="/" state={{ from: location }} replace />
  );
};

export default PublicRoute;
