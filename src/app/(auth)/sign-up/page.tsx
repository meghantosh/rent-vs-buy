import { AuthForm } from "@/components/auth-form";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <AuthForm mode="sign-up" />
    </div>
  );
}
