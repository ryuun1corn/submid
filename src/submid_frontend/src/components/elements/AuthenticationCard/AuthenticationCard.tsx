import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Suspense, useState } from 'react';
import { useAuthContext } from '../../contexts/UseAuthContext';
import { AuthenticationCardPropsInterface } from './interface';
import { Input } from '@/components/ui/input';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  username: z.string().min(2).max(100),
});

const AuthenticationCard: React.FC<AuthenticationCardPropsInterface> = ({
  children,
}) => {
  const { isAuthenticated, login, profile, authClient, createProfile } =
    useAuthContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!authClient) return;
    const name = values.username;

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
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            This account is bound to your Internet Identity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link">See principal</Button>
            </HoverCardTrigger>
            <HoverCardContent className="font-mono">
              {authClient?.getIdentity().getPrincipal().toString()}
            </HoverCardContent>
          </HoverCard>
        </CardFooter>
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
