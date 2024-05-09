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
} from '@/lib/auth';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState, FormEvent, useEffect } from 'react';
import { submid_backend } from '@backend';

const CreateFormModule = () => {
  const [principal, setPrincipal] = useState<string>('');
  const [user, setUser] = useState<string | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("Title");
  const [description, setDescription] = useState<string>("Description.");
  const [numberOfQuestion, setNumberOfQuestion] = useState<number>(0);
  const [question, setQuestion] = useState<string[]>([]);
  const [typeOfanswer, setTypeOfAnswer] = useState<string[]>([]);
  const [needAnswer, setNeedAnswer] = useState<boolean[]>([]);
  const [questionChoice, setQuestionChoice] = useState<string[][]>([[]]);
  const [keyAnswer, setKeyAnswer] = useState<string[][]>([[]]);

  async function logoutUser() {
    setUser(undefined);
    await logout();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const principal = await getPrincipal();
    const user = {
      id: principal,
      name: name
    }

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

  function handleDeleteCheck(checkIndex: number, index: number) {
    setQuestionChoice(allChoice => allChoice.map((choices, i) => (i == index ? choices.filter((item, j) => (j != checkIndex && item == item)) : [...choices])))
  }


  function getQuestionMultiChoice(index: number) {
    let choices = new Array();
    questionChoice.map((item, i) => {
      if (index == i) {
        choices = item;
      }
    })

    return (
      <RadioGroup defaultValue="option-one" disabled>
        {choices.map((item, i) => (
          <div className='flex items-center space-x-2 justify-between'>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={`option-${index}-${i}`} id={`option-${index}-${i}`} />
              <Label htmlFor={`option-${index}-${i}`}>{item}</Label>
            </div>
            <button className='w-5 h-5 rounded-full flex text-center items-center text-rose-400 rounded border-solid border-2 border-rose-400 p-1' onClick={() => handleDeleteCheck(i, index)} > - </button>
          </div>

        ))
        }
      </RadioGroup >
    )

  }

  function getQuestionCheckBox(index: number) {
    let choices = new Array();
    questionChoice.map((item, i) => {
      if (index == i) {
        choices = item;
      }
    })

    return (
      <div className='flex gap-2 flex-col'>
        {choices.map((item, i) => (
          <div className="flex items-center space-x-2 justify-between">
            <div className='flex flex-row gap-2'>
              <Checkbox value={`check-${index}-${i}`} id={`option-${index}-${i}`} disabled />
              <Label htmlFor={`check-${index}-${i}`}>{item}</Label>
            </div>
            <button className='w-5 h-5 rounded-full flex text-center items-center text-rose-400 rounded border-solid border-2 border-rose-400 p-1' onClick={() => handleDeleteCheck(i, index)} > - </button>
          </div>
        ))}
      </div >
    )

  }

  function handleQuestionChange(txt: string, index: number) {
    setQuestion(currentQuestion => currentQuestion.map((item, i) => (i == index ? txt : item)))
  }

  function addMultichoice(e: FormEvent, index: number, txt: string) {
    e.preventDefault();
    let inputValue = document.getElementById(`${txt}-${index}`) as HTMLInputElement;
    if (inputValue != null) {
      let currentValue = inputValue.value
      setQuestionChoice(choices => choices.map((choice, i) =>
        (i == index) ? [...choice, currentValue] : [...choice]
      ))
    }
  }

  function getContent() {
    let questions = new Array();
    for (let i = 0; i < numberOfQuestion; i++) {
      const currentQuestion =
        <Card>
          <CardHeader>
            <CardTitle>
              Question number #{i + 1}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col gap-2'>
              <div>
                <Textarea placeholder="Question" onChange={(e) => handleQuestionChange(e.target.value, i)} />
              </div>
              <div className='flex flex-row gap-2'>
                <Select onValueChange={e =>
                  setTypeOfAnswer(currentArray => currentArray.map((item, index) => (i == index ? e : item)))}
                  defaultValue={typeOfanswer[i]}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Type Of Answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Type Of Answer</SelectLabel>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="1">Text</SelectItem>
                      <SelectItem value="2">Multiple choice</SelectItem>
                      <SelectItem value="3">Check box</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select onValueChange={e =>
                  setNeedAnswer(currentArray => currentArray.map((item, index) => (i == index ? (e == "0" ? false : true) : item)))}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Is it need an answer?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>User Response </SelectLabel>
                      <SelectItem value="0">No</SelectItem>
                      <SelectItem value="1">Yes</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {
                typeOfanswer[i] == "0" ?
                  "" :
                  (typeOfanswer[i] == "1" ?
                    <div>
                      <div>
                        <Input type="" placeholder="Answer" disabled />
                      </div>
                    </div> :
                    // radio
                    (typeOfanswer[i] == "2" ? <div>
                      <div className='flex flex-col gap-3'>
                        <form
                          action="#"
                          onSubmit={(e) => addMultichoice(e, i, "choice")}
                          className="flex flex-col gap-3"
                        >
                          <label htmlFor={`choice-${i}`}> Add new choice: &nbsp;</label>
                          <div className='flex w-full max-w-sm items-center space-x-2'>
                            <input
                              id={`choice-${i}`}
                              name={`choice-${i}`}
                              alt={`choice-${i}`}
                              type="text"
                              className="border-[2px] rounded-md p-2 dark:text-black basis-3/4"
                            />
                            <Button variant="secondary" type="submit" className='basis-1/4'>
                              Add Choice
                            </Button>
                          </div>
                        </form>
                        {getQuestionMultiChoice(i)}
                      </div>
                    </div> :
                      // multiselect
                      <div>
                        <div className='flex flex-col gap-3'>
                          <form
                            action="#"
                            onSubmit={(e) => addMultichoice(e, i, "check")}
                            className="flex flex-col gap-3"
                          >
                            <label htmlFor={`check-${i}`}> Add new check: &nbsp;</label>
                            <div className='flex w-full max-w-sm items-center space-x-2'>
                              <input
                                id={`check-${i}`}
                                name={`check-${i}`}
                                alt={`check-${i}`}
                                type="text"
                                className="border-[2px] rounded-md p-2 dark:text-black basis-3/4"
                              />
                              <Button variant="secondary" type="submit" className='basis-1/4'>
                                Add check
                              </Button>
                            </div>
                          </form>
                          {getQuestionCheckBox(i)}
                        </div>
                      </div>
                    )
                  )
              }

            </div>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={() => deleteQuestion(i)}>Delete Question</Button>
          </CardFooter>
        </Card>

      questions.push(currentQuestion);
    }
    return questions;
  }

  function addQuestion() {
    setNumberOfQuestion(numberOfQuestion + 1);
    setQuestion([...question, ""]);
    setKeyAnswer([...keyAnswer, new Array()]);
    setTypeOfAnswer([...typeOfanswer, "0"]);
    setNeedAnswer([...needAnswer, false]);
    setQuestionChoice([...questionChoice, new Array()]);
  }

  function deleteQuestion(index: number) {
    setNumberOfQuestion(numberOfQuestion - 1);
    setQuestion(prev => prev.filter((item, i) => (i != index && item == item)));
    setKeyAnswer(prev => prev.filter((item, i) => (i != index && item == item)));
    setQuestionChoice(prev => prev.filter((item, i) => (i != index && item == item)));
    setTypeOfAnswer(prev => prev.filter((item, i) => (i != index && item == item)));
    setNeedAnswer(prev => prev.filter((item, i) => (i != index && item == item)));
  }

  async function createForm() {
    let currentPageIndex = new Array()
    let currentKeyAnswer = new Array()
    let currentQuestionChoice = questionChoice;

    for (let i = 0; i < numberOfQuestion; i++) {
      currentPageIndex.push(BigInt(0));
      let tempArr = new Array();
      tempArr.push("");
      currentKeyAnswer.push(tempArr)
    }

    if (numberOfQuestion != currentQuestionChoice.length)
      currentQuestionChoice.pop();

    // console.log(currentPageIndex.length, currentKeyAnswer.length, currentQuestionChoice.length, numberOfQuestion)
    // console.log(question.length, typeOfanswer.length, needAnswer.length)

    let payload = {
      userId: await getPrincipal(),
      title: title,
      description: description,
      numberOfQuestion: BigInt(numberOfQuestion),
      pageIndex: currentPageIndex,
      contents: question,
      choice: currentQuestionChoice,
      typeOfQuestion: typeOfanswer,
      answerType: needAnswer,
      keyAnswer: currentKeyAnswer
    }


    const result = await submid_backend.addForm(payload)
    if ("Ok" in result) {
      console.log("berhasil")
      window.location.reload();
    }
    else {
      console.log(result)
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
          <div className='p-10 flex flex-col items-center gap-8 w-1/2'>
            <div className='flex flex-col gap-2'>
              <h1 className="scroll-m-20 text-3xl text-left font-extrabold tracking-tight lg:text-5xl">
                Welcome, {user}
              </h1>
              <p className="leading-7">
                Ready to build secure forms? Explore Submid form solutions and say goodbye to data worries!
              </p>
            </div>

            <Card className="w-full">
              <CardHeader>
                <CardTitle>
                  Creating Form
                </CardTitle>
                <CardDescription>
                  In order to be able creating form on submid you must create it accordingly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex flex-col gap-3'>
                  <div className="flex flex-col w-full max-w-sm gap-1.5 ml-1">
                    <Label htmlFor="title">Form Title</Label>
                    <Input id="title" placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="flex flex-col w-full max-w-sm gap-1.5 ml-1">
                    <Label htmlFor="description">Form Description</Label>
                    <Textarea id="description" placeholder="Description" onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  {
                    getContent()
                  }

                </div>
              </CardContent>
              <CardFooter className="flex flex-row gap-x-3">
                <Button variant='outline' className='flex basis-1/2 bg-blue-950 text-white' onClick={createForm}>Submit!</Button>
                <Button variant="secondary" className='flex basis-1/2' onClick={addQuestion}>Create New Question</Button>
              </CardFooter>
            </Card>

            <Button variant="destructive" className='w-full' onClick={logoutUser}>
              Logout
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default CreateFormModule;
