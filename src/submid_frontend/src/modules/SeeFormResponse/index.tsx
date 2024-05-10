import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { logout, login, getPrincipalText, getPrincipal } from '@/lib/auth';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useState, FormEvent, useEffect } from 'react';
import { submid_backend } from '@backend';

interface responseInterface {
  formId: string;
  id: string;
  title: string;
  createdAt: bigint;
  updateAt: bigint;
}

interface basicQuestion {
  formId: string;
  id: string;
  index: bigint;
  pageIndex: bigint;
  typeOfQuestion: string;
  needAnswer: boolean;
  content: string;
}

interface responseAnswer {
  responseId: string;
  id: string;
  index: bigint;
  content: string;
}

const SeeFormResponse = () => {
  const [principal, setPrincipal] = useState<string>('');
  const [user, setUser] = useState<string | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [valid, setValid] = useState<boolean>(false);
  const [formResponse, setFormRespone] = useState<responseInterface[]>([]);
  const [question, setQuestion] = useState<basicQuestion[][]>([[]]);
  const [answer, setAnswer] = useState<responseAnswer[][]>([[]]);

  async function logoutUser() {
    setUser(undefined);
    await logout();
    window.location.href = '/seeForm';
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const principal = await getPrincipal();
    const user = {
      id: principal,
      name: name,
    };

    setIsLoading(true);
    const result = await submid_backend.createUser(user);
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

  async function checkStatus() {
    const idArray = window.location.pathname.split('/');
    let id = idArray[idArray.length - 1];

    const form = await submid_backend.getFormWithId(id);
    if ('Err' in form) {
      window.location.href = '/notFound';
    } else {
      const formPrincipal = form.Ok.userId;
      const currentPrincipal = await getPrincipal();

      if (JSON.stringify(formPrincipal) !== JSON.stringify(currentPrincipal))
        window.location.href = '/notFound';

      setValid(true);
      // getResponse();
    }
  }

  async function getResponse() {
    const idArray = window.location.pathname.split('/');
    let id = idArray[idArray.length - 1];

    const result = await submid_backend.getAllFormResponseWithFormId(id);
    if ('Ok' in result) {
      if (formResponse.length == 0) {
        result.Ok.map((item) => {
          getQuestion(item.formId);
          getResponseAnswer(item.id);
          setFormRespone((prev) => [...prev, item]);
        });
      }
    } else {
      console.log('Ngga ada');
    }
  }

  async function getQuestion(id: string) {
    const result = await submid_backend.getQuestionWithFormId(id);
    if ('Ok' in result) {
      const sortedQuestion = new Array();
      for (let i = 0; i < result.Ok.length; i++) {
        const item = result.Ok.find((item) => Number(item.index) == i);
        sortedQuestion.push(item);
      }
      setQuestion((prev) => [...prev, sortedQuestion]);
    }
  }

  async function getResponseAnswer(id: string) {
    const result = await submid_backend.getAnswerWithFormRespondId(id);
    console.log(result);
    if ('Ok' in result) {
      setAnswer((prev) => [...prev, result.Ok]);
    } else {
      console.log(result);
    }
  }

  useEffect(() => {
    if (valid) getResponse();
  }, [valid]);

  useEffect(() => {
    console.log('AA', answer);
  }, [answer]);

  // useEffect(() => {
  //     console.log("Bb", formResponse);
  // }, [formResponse])

  useEffect(() => {
    checkStatus();
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
          {valid ? (
            <>
              <div className="flex gap-3 flex-wrap">
                {valid && (
                  <Carousel className="w-full max-w-xs">
                    <CarouselContent>
                      {question.map((item, index) =>
                        index != 0 ? (
                          <CarouselItem key={index}>
                            <div className="p-1">
                              <Card>
                                <CardHeader>
                                  {formResponse[index - 1].title}
                                </CardHeader>
                                <CardContent className="flex gap-2 aspect-square items-center justify-center p-6 flex-col">
                                  {item.map((value, indexCol) => (
                                    <div className="flex flex-col justify-center ">
                                      <div>
                                        <b>
                                          {indexCol + 1} .{value.content}
                                        </b>
                                      </div>
                                      <div>
                                        {answer.map((answers, i) =>
                                          i == index
                                            ? answers.map((value) =>
                                                Number(value.index) ==
                                                indexCol ? (
                                                  <div>{value.content}</div>
                                                ) : (
                                                  ''
                                                ),
                                              )
                                            : '',
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </CardContent>
                              </Card>
                            </div>
                          </CarouselItem>
                        ) : (
                          ''
                        ),
                      )}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                )}
              </div>
              <Button variant="destructive" onClick={logoutUser}>
                Logout!
              </Button>
            </>
          ) : (
            ''
          )}
        </>
      )}
    </>
  );
};

export default SeeFormResponse;
