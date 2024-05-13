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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FormEvent, useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { QuestionInterface } from '../interface';
import { Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { submid_backend } from '@backend';

const CreateFormCard = () => {
  const { profile, logout } = useAuthContext();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [questions, setQuestions] = useState<QuestionInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function getContent() {
    const QuestionComponents = questions.map((_, i) => {
      return (
        <Card>
          <CardHeader>
            <CardTitle>
              <div>
                <Textarea
                  placeholder="Insert your question here!"
                  onChange={(e) => handleQuestionChange(e.target.value, i)}
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <Button variant="destructive" onClick={() => deleteQuestion(i)}>
                  <Trash2Icon className="w-4 h-4" />
                </Button>
                <Select
                  onValueChange={(e: '1' | '2' | '3') => {
                    setQuestions((currentQuestions) =>
                      currentQuestions.map((question, index) =>
                        i == index
                          ? {
                              ...question,
                              type: e,
                            }
                          : question,
                      ),
                    );
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="1">Text</SelectItem>
                      <SelectItem value="2">Multiple choice</SelectItem>
                      <SelectItem value="3">Check box</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select
                  onValueChange={(e: '0' | '1') => {
                    setQuestions((currentQuestions) =>
                      currentQuestions.map((question, index) =>
                        i == index
                          ? {
                              ...question,
                              required: e === '1',
                            }
                          : question,
                      ),
                    );
                  }}
                  defaultValue="1"
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="1">Required</SelectItem>
                      <SelectItem value="0">Not required</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {questions[i].type === '0' ? (
                ''
              ) : questions[i].type === '1' ? (
                <div>
                  <div>
                    <Input type="" placeholder="Answer will go here" disabled />
                  </div>
                </div>
              ) : // radio
              questions[i].type === '2' ? (
                <div>
                  <div className="flex flex-col gap-3">
                    <form
                      action="#"
                      onSubmit={(e) => addOption(e, i, 'choice')}
                      className="flex flex-col gap-3 w-full mb-3"
                    >
                      <label htmlFor={`choice-${i}`}>
                        {' '}
                        Add new choice: &nbsp;
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2 w-full items-center space-x-2">
                        <Input
                          id={`choice-${i}`}
                          name={`choice-${i}`}
                          alt={`choice-${i}`}
                          type="text"
                          className="border-[2px] rounded-md p-2 dark:text-black basis-3/4 w-full"
                        />
                        <Button
                          variant="secondary"
                          type="submit"
                          className="basis-1/4"
                        >
                          Add Choice
                        </Button>
                      </div>
                    </form>
                    {getQuestionMultiChoice(i)}
                  </div>
                </div>
              ) : (
                // multiselect
                <div>
                  <div className="flex flex-col gap-3">
                    <form
                      action="#"
                      onSubmit={(e) => addOption(e, i, 'check')}
                      className="flex flex-col gap-3 mb-3"
                    >
                      <label htmlFor={`check-${i}`}> Add options: &nbsp;</label>
                      <div className="flex flex-col sm:flex-row gap-2 w-full items-center space-x-2">
                        <Input
                          id={`check-${i}`}
                          name={`check-${i}`}
                          alt={`check-${i}`}
                          type="text"
                          className="border-[2px] rounded-md p-2 dark:text-black basis-3/4"
                        />
                        <Button
                          variant="secondary"
                          type="submit"
                          className="basis-1/4"
                        >
                          Add option
                        </Button>
                      </div>
                    </form>
                    {getCheckboxQuestions(i)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    });

    return (
      <>
        {QuestionComponents.length !== 0 && <p>Questions:</p>}
        {QuestionComponents}
      </>
    );
  }

  function handleQuestionChange(txt: string, index: number) {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, i) =>
        i == index
          ? {
              ...question,
              question: txt,
            }
          : question,
      ),
    );
  }

  function addOption(e: FormEvent, index: number, txt: string) {
    e.preventDefault();
    let inputValue = document.getElementById(
      `${txt}-${index}`,
    ) as HTMLInputElement;
    if (inputValue != null && inputValue.value) {
      let currentValue = inputValue.value;

      setQuestions((currentQuestions) =>
        currentQuestions.map((question, i) =>
          i == index
            ? {
                ...question,
                answerChoices: [...question.answerChoices, currentValue],
              }
            : question,
        ),
      );
    }
  }

  function getQuestionMultiChoice(index: number) {
    const choices = questions[index].answerChoices;

    return (
      <RadioGroup defaultValue="option-one" disabled>
        {choices.map((item, i) => (
          <div className="flex items-center space-x-2 justify-between">
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={`option-${index}-${i}`}
                id={`option-${index}-${i}`}
              />
              <Label htmlFor={`option-${index}-${i}`}>{item}</Label>
            </div>
            <button
              className="w-5 h-5 flex text-center items-center text-rose-400 rounded border-solid border-2 border-rose-400 p-1"
              onClick={() => deleteOption(i, index)}
            >
              {' '}
              -{' '}
            </button>
          </div>
        ))}
      </RadioGroup>
    );
  }

  function deleteOption(checkIndex: number, index: number) {
    const prevChoices = questions[index].answerChoices;
    const updatedChoices = prevChoices.filter((_, i) => i !== checkIndex);

    setQuestions((currentQuestions) =>
      currentQuestions.map((question, i) =>
        i == index
          ? {
              ...question,
              answerChoices: updatedChoices,
            }
          : question,
      ),
    );
  }

  function addQuestion() {
    setQuestions([
      ...questions,
      {
        question: '',
        required: true,
        type: '0',
        answerChoices: new Array(),
        key: new Array(),
      },
    ]);
  }

  function deleteQuestion(index: number) {
    setQuestions((questions) => questions.filter((_, i) => i != index));
  }

  function getCheckboxQuestions(index: number) {
    const choices = questions[index].answerChoices;

    return (
      <div className="flex gap-2 flex-col">
        {choices.map((item, i) => (
          <div className="flex items-center space-x-2 justify-between">
            <div className="flex flex-row gap-2">
              <Checkbox
                value={`check-${index}-${i}`}
                id={`option-${index}-${i}`}
                disabled
              />
              <Label htmlFor={`check-${index}-${i}`}>{item}</Label>
            </div>
            <button
              className="w-5 h-5 flex text-center items-center text-rose-400 rounded border-solid border-2 border-rose-400 p-1"
              onClick={() => deleteOption(i, index)}
            >
              {' '}
              -{' '}
            </button>
          </div>
        ))}
      </div>
    );
  }

  function validateForm() {
    if (!title || !description) {
      throw new Error('Title or description of the form must not be empty!');
    }

    if (questions.length === 0) {
      throw new Error('There should be at least one question!');
    }

    for (const question of questions) {
      if (question.question === '')
        throw new Error("There are some questions that don't have a title!");
      if (question.type == '0')
        throw new Error("There are some questions that don't have a type yet!");

      if (
        (question.type === '2' || question.type === '3') &&
        question.answerChoices.length === 0
      )
        throw new Error(
          'Multiple choice or checkbox questions must have an option!',
        );
    }
  }

  async function createForm() {
    if (!profile) return;
    try {
      validateForm();
    } catch (err: any) {
      toast(err.message);
      return;
    }

    setIsLoading(true);
    let currentPageIndex = new Array();
    let currentKeyAnswer = new Array();
    // let currentQuestionChoice = questionChoice;

    for (let i = 0; i < questions.length; i++) {
      currentPageIndex.push(BigInt(0));
      let tempArr = new Array();
      tempArr.push('');
      currentKeyAnswer.push(tempArr);
    }

    // if (numberOfQuestion != currentQuestionChoice.length)
    //   currentQuestionChoice.pop();

    // console.log(currentPageIndex.length, currentKeyAnswer.length, currentQuestionChoice.length, numberOfQuestion)
    // console.log(question.length, typeOfanswer.length, needAnswer.length)

    let payload = {
      userId: profile.id,
      title: title,
      description: description,
      numberOfQuestion: BigInt(questions.length),
      pageIndex: currentPageIndex,
      contents: questions.map((question) => question.question),
      choice: questions.map((question) => question.answerChoices),
      typeOfQuestion: questions.map((question) => question.type),
      answerType: questions.map((question) => question.required),
      keyAnswer: questions.map((question) => question.key),
    };

    const result = await submid_backend.addForm(payload);
    if (result) {
      if ('Ok' in result) {
        console.log('berhasil');
        window.location.reload();
      } else {
        console.log(result);
      }
    }
    setIsLoading(false);
  }

  return (
    <>
      <div className="p-0 sm:p-10 flex flex-col items-center gap-8 w-[90%] xl:w-1/2">
        <div className="flex flex-col gap-2">
          <h1 className="scroll-m-20 text-3xl text-left font-extrabold tracking-tight lg:text-5xl">
            Welcome, {profile?.userName}
          </h1>
          <p className="leading-7">
            Ready to build secure forms? Explore SubmiD form solutions and say
            goodbye to data worries!
          </p>
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Create your form!</CardTitle>
            <CardDescription>
              Please fill in the required fields accordingly.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col w-full gap-1.5 ml-1">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Title of your form"
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col w-full gap-1.5 ml-1">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description of your form"
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">{getContent()}</div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 *:w-full">
            <Button
              variant="secondary"
              className="flex basis-1/2"
              onClick={addQuestion}
              disabled={isLoading}
            >
              Add a question
            </Button>
            <Button
              variant="outline"
              className="flex basis-1/2 bg-blue-950 text-white"
              onClick={createForm}
              disabled={isLoading}
            >
              Create Form!
            </Button>
          </CardFooter>
        </Card>
        <Button
          variant="destructive"
          className="w-full"
          onClick={logout}
          disabled={isLoading}
        >
          Logout
        </Button>
      </div>
    </>
  );
};

export default CreateFormCard;
