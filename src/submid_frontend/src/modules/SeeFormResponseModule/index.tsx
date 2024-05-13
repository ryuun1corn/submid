import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useState, useEffect } from 'react';
import { submid_backend } from '@backend';
import { useAuthContext } from '@/components/contexts/UseAuthContext';
import { useParams } from 'react-router-dom';
import {
  FormDataInterface,
  QuestionInterface,
  ResponseAnswerInterface,
} from './interface';
import ResponseCard from './module-elements/ResponseCard';

const SeeFormResponse = () => {
  const { profile } = useAuthContext();
  const { id } = useParams();
  const [valid, setValid] = useState<boolean>(false);
  const [formResponse, setFormResponse] = useState<FormDataInterface[]>([]);
  const [questions, setQuestions] = useState<QuestionInterface[]>([]);
  const [answers, setAnswers] = useState<ResponseAnswerInterface[][]>([]);

  async function checkStatus() {
    if (!profile || !id) return;

    const form = await submid_backend.getFormWithId(id);
    if ('Err' in form) {
      window.location.href = '/notFound';
    } else {
      const formPrincipal = form.Ok.userId;

      if (formPrincipal.toString() !== profile.id.toString())
        window.location.href = '/notFound';

      setValid(true);
    }
  }

  async function getResponse() {
    if (!id) return;
    const result = await submid_backend.getAllFormResponseWithFormId(id);
    if ('Ok' in result) {
      if (formResponse.length == 0) {
        result.Ok.map((item) => {
          getResponseAnswer(item.id);
        });
        setFormResponse(result.Ok);
      }
    } else {
      console.log('Ngga ada');
    }
  }

  async function getQuestions(id: string) {
    const result = await submid_backend.getQuestionWithFormId(id);
    if ('Ok' in result) {
      const sortedQuestions = result.Ok.sort((a, b) =>
        Number(a.index - b.index),
      );
      setQuestions(sortedQuestions);
    }
  }

  async function getResponseAnswer(id: string) {
    const result = await submid_backend.getAnswerWithFormRespondId(id);
    if ('Ok' in result) {
      setAnswers((prev) => [...prev, result.Ok]);
    } else {
      console.log(result);
    }
  }

  useEffect(() => {
    if (valid && id) {
      getResponse();
      getQuestions(id);
    }
  }, [valid, id]);

  useEffect(() => {
    checkStatus();
  }, [profile]);

  return (
    <>
      {valid && (
        <>
          <div className="flex gap-3 flex-wrap w-[80%] md:w-1/2">
            {valid && answers.length === 0 ? (
              <p className="text-center m-auto">
                This form doesn't have any response yet!
              </p>
            ) : (
              <Carousel className="w-full">
                <CarouselContent className="">
                  {answers.map((answer, index) => {
                    return (
                      <CarouselItem key={index}>
                        <ResponseCard
                          formData={formResponse[index]}
                          questions={questions}
                          responses={answer}
                        />
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious className="-top-8 left-0 md:-left-12 md:top-1/2" />
                <CarouselNext className="-top-8 right-0 md:-right-12 md:top-1/2" />
              </Carousel>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default SeeFormResponse;
