import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState, FormEvent, Suspense } from 'react';
import { submid_backend } from '@backend';
import { useAuthContext } from '@/components/contexts/UseAuthContext';
import AuthenticationCard from '@/components/elements/AuthenticationCard/AuthenticationCard';
import { FormInterface, QuestionInterface } from './interface';
import FillForm from './module-elements/FillForm';
// import { Item } from '@radix-ui/react-dropdown-menu';

const FillFormModule = () => {
  const { profile, logout } = useAuthContext();
  const [questions, setQuestions] = useState<QuestionInterface[]>([]);
  const [form, setForm] = useState<FormInterface>();

  async function getQuestionChoice(id: string) {
    const result = await submid_backend.getAllQuestionChoiceWithQuestionId(id);
    if ('Ok' in result) {
      return result.Ok.sort((a, b) => Number(a.index - b.index));
    }

    return [];
  }

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const id = formData.get('formId');

    const empty = () => {
      setForm(undefined);
      setQuestions([]);
    };
    empty();

    if (id != null) {
      const result = await submid_backend.getFormWithId(id.toString());
      if ('Ok' in result) {
        setForm(result.Ok);
        const questionResult = await submid_backend.getQuestionWithFormId(
          id.toString(),
        );
        if ('Ok' in questionResult) {
          let currentQuestion = questionResult.Ok;

          let sortedQuestion = currentQuestion.sort((a, b) =>
            Number(a.index - b.index),
          );

          const questionWithChoices = sortedQuestion.map(async (question) => {
            const choices = await getQuestionChoice(question.id);
            return {
              ...question,
              choices: choices,
            };
          });

          Promise.all(questionWithChoices).then((questionList) => {
            setQuestions(questionList);
          });
        }
      } else {
        alert('Form not found!!');
        setForm(undefined);
        setQuestions([]);
      }
    }
  }

  return (
    <AuthenticationCard>
      <div className="flex flex-col items-center gap-8 max-w-[80%] lg:w-1/2">
        <div className="flex flex-col gap-2">
          <h1 className="scroll-m-20 text-3xl text-left font-extrabold tracking-tight lg:text-5xl">
            Welcome, {profile?.userName}
          </h1>
          <p className="leading-relaxed text-sm md:text-base">
            When filling out forms, stick with trusted individuals or
            organizations. Whether it's personal or for a group, prioritize
            trust to keep your information safe and secure.
          </p>
        </div>

        <div className="w-full">
          <form
            className="w-full flex flex-col sm:flex-row gap-4"
            action=""
            onSubmit={(e) => handleSearch(e)}
          >
            <Input type="text" name="formId" placeholder="SubmiD form ID" />
            <Button type="submit">Search</Button>
          </form>
        </div>
        {form && (
          <Card className="w-full md:p-3">
            <CardHeader className="">
              <CardTitle>{form?.title}</CardTitle>
              <CardDescription>{form?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading...</div>}>
                {questions.length > 0 && (
                  <FillForm questions={questions} formData={form} />
                )}
              </Suspense>
            </CardContent>
          </Card>
        )}
        <Button variant="destructive" className="w-full" onClick={logout}>
          Logout
        </Button>
      </div>
    </AuthenticationCard>
  );
};

export default FillFormModule;
