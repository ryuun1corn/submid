import { FormEvent, useEffect, useState } from "react";
import { submid_backend } from "../../declarations/submid_backend";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./components/ui/button";
import { getPrincipalText, isAuthenticated, login, logout } from "./lib/auth";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [principal, setPrincipal] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const name = formData.get("name") as string;

    submid_backend.greet(name).then((greeting: string) => {
      setGreeting(greeting);
    });
    return false;
  }

  useEffect(() => {
    const getAuth = async () => {
      setAuthenticated(await isAuthenticated());
    };

    getAuth();
  }, [setAuthenticated]);

  useEffect(() => {
    const getData = async () => {
      setPrincipal(await getPrincipalText());
    };

    getData();
  }, [setPrincipal]);

  return (
    <main className="min-h-screen bg-slate-400 flex flex-col items-center justify-center gap-5">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-white">
        SubmiD
      </h1>
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
              className="border-[2px] rounded-md p-2"
            />
            <Button type="submit">Click me!</Button>
            <section id="greeting">{greeting}</section>
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

          {authenticated ? (
            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
          ) : (
            <Button variant="secondary" onClick={login}>
              Login
            </Button>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}

export default App;
