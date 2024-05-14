export interface CreateFormInterface {
  title: string;
  description: string;
  questions: QuestionInterface[];
}

export interface QuestionInterface {
  question: string;
  required: boolean;
  type: '0' | '1' | '2' | '3';
  answerChoices: string[];
  key: string[];
}
