import { FormEvent, useState } from "react";
import { submid_backend } from "../../declarations/submid_backend";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function App() {
  const [greeting, setGreeting] = useState<string>("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    // Assuming you have a form field with name="name", you can extract its value like this:
    const name = formData.get("name") as string;

    submid_backend.greet(name).then((greeting: string) => {
      setGreeting(greeting);
    });
    return false;
  }

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
              className="border-[2px] rounded-md"
            />
            <button type="submit">Click Me!</button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <section id="greeting">{greeting}</section>
        </CardFooter>
      </Card>
    </main>
  );
}

export default App;
