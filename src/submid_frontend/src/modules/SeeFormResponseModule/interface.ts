export interface FormDataInterface {
  formId: string;
  id: string;
  title: string;
  createdAt: bigint;
  updateAt: bigint;
}

export interface QuestionInterface {
  formId: string;
  id: string;
  index: bigint;
  pageIndex: bigint;
  typeOfQuestion: string;
  needAnswer: boolean;
  content: string;
}

export interface ResponseAnswerInterface {
  responseId: string;
  id: string;
  index: bigint;
  content: string;
}

export interface ResponseCardInterface {
  formData: FormDataInterface;
  questions: QuestionInterface[];
  responses: ResponseAnswerInterface[];
}
