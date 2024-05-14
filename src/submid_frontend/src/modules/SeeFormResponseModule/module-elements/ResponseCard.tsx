import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  QuestionInterface,
  ResponseAnswerInterface,
  ResponseCardInterface,
} from '../interface';
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

const ResponseCard: React.FC<ResponseCardInterface> = ({
  formData,
  questions,
  responses,
}) => {
  const getQuestionField = (
    question: QuestionInterface,
    responses: ResponseAnswerInterface[],
  ) => {
    switch (question.typeOfQuestion) {
      case '1':
        return (
          <>
            <Label
              className={`${question.needAnswer && "after:content-['*'] after:ml-0.5 after:text-red-500"}`}
            >
              {question.content}
            </Label>
            <Input value={responses[0].content} disabled />
          </>
        );

      case '2':
        return (
          <>
            <Label
              className={`${question.needAnswer && "after:content-['*'] after:ml-0.5 after:text-red-500"}`}
            >
              {question.content}
            </Label>
            {responses[0].content === '' ? (
              <p className="opacity-50 text-sm">
                The respondent didn't choose anything.
              </p>
            ) : (
              <RadioGroup value={responses[0].content}>
                {responses
                  .sort((a, b) => Number(a.index - b.index)) // turns out this sorting is not helping with anything
                  .map((response, index) => {
                    return (
                      <div
                        className="flex items-center space-x-3 space-y-0"
                        key={index}
                      >
                        <RadioGroupItem value={response.content} disabled />
                        <Label>{response.content}</Label>
                      </div>
                    );
                  })}
              </RadioGroup>
            )}
          </>
        );

      case '3':
        return (
          <>
            <Label
              className={`${question.needAnswer && "after:content-['*'] after:ml-0.5 after:text-red-500"}`}
            >
              {question.content}
            </Label>
            {responses.length === 0 ? (
              <p className="opacity-50 text-sm">
                The respondent didn't choose anything.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {responses
                  .sort((a, b) => Number(a.index - b.index))
                  .map((response, index) => {
                    return (
                      <div
                        className="flex flex-row items-start space-x-3 space-y-0"
                        key={index}
                      >
                        <Checkbox
                          value={response.content}
                          checked={true}
                          disabled
                        />
                        <Label>{response.content}</Label>
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        );
    }
  };

  // Convert nanoseconds to milliseconds
  const millisecondsSinceEpoch: number = Number(formData.createdAt) / 1000000;
  const date: Date = new Date(millisecondsSinceEpoch);

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>{formData.title}</CardTitle>
        <CardDescription>Submitted on: {date.toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
        {questions.map((question, index) => {
          return (
            <Card key={index} className="my-3">
              <CardContent className="flex flex-col gap-3 p-5">
                {getQuestionField(
                  question,
                  responses.filter(
                    (response) => Number(response.index) === index,
                  ),
                )}
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ResponseCard;
