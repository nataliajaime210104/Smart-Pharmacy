import { useEffect } from 'react';

function formatRoleName(role: string): string {
  if (role === 'Medico') {
    return 'Médico';
  }

  return role;
}

function useDocumentTitle(
  role: string,
  moduleName: string,
): void {
  useEffect(() => {
    const formattedRole = formatRoleName(role);

    document.title = `${formattedRole} | ${moduleName}`;
  }, [role, moduleName]);
}

export default useDocumentTitle;