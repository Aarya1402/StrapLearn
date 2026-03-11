import { getCurrentUser, getDashboardPath } from '@/lib/server-auth';
import { getPublicOrganizations } from '@/lib/organization';
import { redirect } from 'next/navigation';
import RegisterForm from './RegisterForm';

export default async function RegisterPage() {
  // If already logged in, redirect to dashboard
  const user = await getCurrentUser();
  if (user) redirect(getDashboardPath(user.role_type));

  const organizations = await getPublicOrganizations();

  return (
    <main style={{ maxWidth: 400, margin: '80px auto', fontFamily: 'monospace' }}>
      <h1>Register — StrapLearn</h1>
      <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>Join an organization to start learning or teaching.</p>
      
      <RegisterForm organizations={organizations} />
      
      <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14 }}>
        Already have an account? <a href="/login" style={{ color: '#000', fontWeight: 'bold' }}>Login</a>
      </p>
    </main>
  );
}
