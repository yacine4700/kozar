import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      {/* Decorative background elements */}
      <div className="fixed top-0 right-0 w-[40rem] h-[40rem] bg-indigo-100/50 rounded-full -mr-[20rem] -mt-[20rem] blur-3xl -z-10"></div>
      <div className="fixed bottom-0 left-0 w-[30rem] h-[30rem] bg-indigo-200/40 rounded-full -ml-[15rem] -mb-[15rem] blur-3xl -z-10"></div>
      
      <LoginForm />
    </div>
  );
}
