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
  logout,
  login,
  getPrincipalText,
  getPrincipal,
  getIdentity,
} from '@/lib/auth';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card';
import { useState, FormEvent, useEffect } from 'react';
import { createActor, submid_backend } from '@backend';

const CreateFormModule = () => {
  const [principal, setPrincipal] = useState<string>('');
  const [user, setUser] = useState<string | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function logoutUser() {
    setUser(undefined);
    await logout();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const identity = await getIdentity();

    const actor = createActor(
      process.env.CANISTER_ID_SUBMID_BACKEND as string,
      {
        agentOptions: {
          identity: identity,
        },
      },
    );

    setIsLoading(true);
    const result = await actor.createUser(name);

    if ('Succes' in result) {
      window.location.reload();
    }
  }

  async function getData() {
    const principal = await getPrincipal();

    if (principal.isAnonymous()) {
      setUser(undefined);
      return;
    }

    const principalText = await getPrincipalText();
    setPrincipal(principalText);

    const data = await submid_backend.getUserById(principal);
    if ('Err' in data && 'NotFound' in data.Err) {
      setUser(null);
    } else if ('Ok' in data) {
      setUser(data.Ok.userName);
    }
  }

  useEffect(() => {
    getData();
  }, [setUser, setPrincipal]);

  return (
    <>
      <div className="absolute top-10 left-10"></div>
      {user === undefined ? (
        <div className="flex flex-col items-center gap-5">
          <div>You are not authenticated yet</div>

          <Button variant="secondary" onClick={login}>
            Login
          </Button>
        </div>
      ) : user === null ? (
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
          <CardFooter className="flex justify-between">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="link">Show Principal</Button>
              </HoverCardTrigger>
              <HoverCardContent className="">
                <div className="flex justify-between space-x-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Your Principal:</h4>
                    <p className="text-sm">{principal}</p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </CardFooter>
        </Card>
      ) : (
        <>
          <div>Welcome, {user}</div>
          <Button variant="destructive" onClick={logoutUser}>
            Logout
          </Button>
        </>
      )}
    </>
  );
};

export default CreateFormModule;
