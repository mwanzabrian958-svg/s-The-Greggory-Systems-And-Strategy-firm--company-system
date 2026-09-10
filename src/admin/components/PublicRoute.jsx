import React from 'react';

/**
 * PublicRoute - No authentication required
 * Renders children directly without checking login status.
 * Used for pages like DepartmentsHub that should be publicly accessible.
 */
export function PublicRoute({ children }) {
  return children;
}

export default PublicRoute;
