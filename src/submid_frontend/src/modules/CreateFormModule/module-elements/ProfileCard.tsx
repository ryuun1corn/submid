import { useAuthContext } from '@/components/contexts/UseAuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { useState, FormEvent } from 'react';
import CreateFormCard from './CreateFormCard';

const ProfileCard = () => {
  const { profile, actor, authClient, createProfile } = useAuthContext();
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

  return (
    profile !== undefined &&
    (profile === null ? (
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
      <CreateFormCard />
    ))
  );
};

export default ProfileCard;
