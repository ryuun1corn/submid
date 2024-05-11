import { z } from 'zod';

export interface FormInterface {
  id: string;
  title: string;
  description: string;
  numberOfQuestion: bigint;
}

export interface QuestionInterface {
  formId: string;
  id: string;
  index: bigint;
  pageIndex: bigint;
  typeOfQuestion: string;
  needAnswer: boolean;
  content: string;
  choices: QuestionChoiceInterface[];
}

export interface QuestionChoiceInterface {
  questionId: string;
  id: string;
  index: bigint;
  content: string;
}

export interface FillFormPropsInterface {
  questions: QuestionInterface[];
  formData: FormInterface;
}

export interface FormSchemaInterface {
  [key: string]: z.ZodTypeAny;
}
