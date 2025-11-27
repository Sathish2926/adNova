export function useAuth() {
  const role = localStorage.getItem('userRole');
  const email = localStorage.getItem('userEmail');
  return { role, email, isLogged: !!role };
}
