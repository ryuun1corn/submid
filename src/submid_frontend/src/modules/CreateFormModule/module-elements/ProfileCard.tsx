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
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card';
import { useState, FormEvent } from 'react';

const ProfileCard = () => {
  const { profile, actor, logout } = useAuthContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const name = formData.get('name') as string;

    setIsLoading(true);
    const result = await actor?.createUser(name);

    if (result && 'Succes' in result) {
      window.location.reload();
    }
  }

  if (profile === undefined) throw new Promise(() => {});

  return profile === null ? (
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
    <>
      <div>Welcome, {profile?.userName}</div>
      <Button variant="destructive" onClick={logout}>
        Logout
      </Button>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link">Show Principal</Button>
        </HoverCardTrigger>
        <HoverCardContent className="">
          <div className="flex justify-between space-x-4">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Your Principal:</h4>
              <p className="text-sm">{profile?.id.toString()}</p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </>
  );
};

export default ProfileCard;
