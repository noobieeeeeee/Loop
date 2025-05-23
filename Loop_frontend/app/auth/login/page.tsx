// LoginPage.tsx
'use client'
import { FormEvent, useState } from 'react';
import { login } from './actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { NetworkError } from '@/utils/errors';
import { Button } from "@nextui-org/button";
import { Card, CardFooter, CardBody, CardHeader } from "@nextui-org/card";
import { Input } from '@nextui-org/input';
import { Divider } from "@nextui-org/divider";
import { useAuthStore } from '../../../lib/auth/authStore';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const data = await login(email, password);
      
      // Backend down response is handled in the API utility now
      // Handle the backend response format
      if (data && data.access_token && data.user_id && data.expires_at) {
        const expiresAt = new Date(data.expires_at);
        useAuthStore.getState().setAuth(data.access_token, data.user_id, expiresAt);
        toast.success('Login successful!');
        router.push('/');
      } else {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid credentials or server error');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      const errorMessage = error instanceof NetworkError ? error.message : 'Login failed. Please try again.';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <Card className="w-1/4">
        <CardHeader className="flex items-center justify-center pt-6">
          <h1 className="text-2xl font-bold">Login</h1>
        </CardHeader>
        <CardBody className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              variant="bordered"
              isRequired
              className="w-full"
              isDisabled={isLoading}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              variant="bordered"
              isRequired
              className="w-full"
              isDisabled={isLoading}
            />
            <Button 
              type="submit" 
              color="primary" 
              className="w-full"
              isLoading={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardBody>
        <CardFooter className="flex flex-col gap-2 px-6 pb-6">
          <Divider className="my-4" />
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
