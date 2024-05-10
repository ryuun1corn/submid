import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { FormEvent, Suspense, useState } from 'react';
import { useAuthContext } from '../../contexts/UseAuthContext';
import { AuthenticationCardPropsInterface } from './interface';

const AuthenticationCard: React.FC<AuthenticationCardPropsInterface> = ({
  children,
}) => {
  const { isAuthenticated, login, profile, authClient, actor, createProfile } =
    useAuthContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!authClient || !actor) return;
    const formData = new FormData(event.target as HTMLFormElement);
    const name = formData.get('name') as string;

    setIsLoading(true);
    createProfile(name).then(() => {
      setIsLoading(false);
    });
  }

  const LoadComponent = () => {
    if (profile === undefined) throw new Promise(() => {});

    return !isAuthenticated ? (
      <div className="flex flex-col items-center gap-5">
        <div>You are not authenticated yet</div>

        <Button variant="secondary" onClick={login}>
          Login
        </Button>
      </div>
    ) : profile === null ? (
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Call yourself</CardTitle>
          <CardDescription>
            Initiate a call to yourself in one click.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action="#"
            onSubmit={handleSubmit}
            className="flex flex-col gap-3"
          >
            <label htmlFor="name">Enter your name: &nbsp;</label>
            <input
              id="name"
              name="name"
              alt="Name"
              type="text"
              className="border-[2px] rounded-md p-2 dark:text-black"
            />
            <Button type="submit" disabled={isLoading}>
              Click me!
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">Hi!</CardFooter>
      </Card>
    ) : (
      children
    );
  };

  return (
    <>
      <Suspense fallback={<div>loading...</div>}>
        <LoadComponent />
      </Suspense>
    </>
  );
};

export default AuthenticationCard;
