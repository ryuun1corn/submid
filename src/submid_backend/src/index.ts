import { content } from '@/src/submid_frontend/tailwind.config';
import {
  Canister,
  query,
  ic,
  text,
  update,
  Void,
  Principal,
  Variant,
  Err,
  Ok,
  Record,
  nat64,
  bool,
  StableBTreeMap,
  Vec,
  Result,
  int64,
  blob,
  nat,
} from 'azle';
import { response } from 'express';
import { object } from 'firebase-functions/v1/storage';
import { TypeOfExpression, sys } from 'typescript';
import { v4 as uuidv4 } from 'uuid';

const questionType = ['text', 'radio', 'select', 'none'];
const Question = Record({
  id: text,
  index: nat64,
  typeOfQuestion: text,
  choice: Vec(text),
  needAnswer: bool,
  keyAnswer: Vec(text),
});
type Question = typeof Question.tsType;

const Form = Record({
  id: text,
  title: text,
  description: text,
  numberOfQuestion: nat64,
  listOfQuestion: Vec(text),
  listOfResponse: Vec(text),
  createdAt: nat64,
  updateAt: nat64,
});
type Form = typeof Form.tsType;

const FormResponse = Record({
  userId: Principal,
  formId: text,
  id: text,
  title: text,
  listOfResponseAnswer: Vec(text),
  createdAt: nat64,
  updateAt: nat64,
});
type FormResponse = typeof FormResponse.tsType;

const FormResponseAnswer = Record({
  id: text,
  index: nat64,
  type: text,
  content: Vec(text),
  createdAt: nat64,
  updateAt: nat64,
});
type FormResponseAnswer = typeof FormResponseAnswer.tsType;

const Message = Variant({
  NotFound: text,
  Succes: text,
  Fail: text,
});
type Message = typeof Message.tsType;

const FormPayload = Record({
  userId: Principal,
  title: text,
  numberOfQuestion: nat64,
  description: text,
  contents: Vec(text),
  choice: Vec(Vec(text)),
  typeOfQuestion: Vec(text),
  answerType: Vec(bool),
  keyAnswer: Vec(Vec(text)),
});

const FormResponsePayload = Record({
  userId: Principal,
  formId: text,
  title: text,
  listOfResponseAnswer: Vec(Vec(text)),
});

const User = Record({
  id: Principal,
  listOfForm: Vec(text),
  listOfAnswer: Vec(text),
  userName: text,
  createdAt: nat64,
});
type User = typeof User.tsType;

const listOfForm = StableBTreeMap<text, Form>(0);
const listOfQuestion = StableBTreeMap<text, Question>(1);
const listOfFormResponse = StableBTreeMap<text, FormResponse>(2);
const listOfResponseAnswer = StableBTreeMap<text, FormResponseAnswer>(3);
const listOfUser = StableBTreeMap<Principal, User>(4);

let message = '';
export default Canister({
  // user
  createUser: update([text], Message, (name) => {
    let newUser = {
      id: ic.caller(),
      listOfForm: new Array(),
      listOfAnswer: new Array(),
      userName: name,
      createdAt: ic.time(),
    };
    listOfUser.insert(newUser.id, newUser);
    return { Succes: 'Success adding new user' };
  }),

  updateUser: update([User], Message, (user) => {
    const exist = listOfUser.get(user.id);
    if ('None' in exist)
      return { NotFound: `cannot update user with id=${user.id} not found` };

    listOfUser.insert(exist.Some.id, user);
    return { Succes: 'Success updating user' };
  }),

  getAllUser: query([], Vec(User), () => {
    return listOfUser.values();
  }),

  getUserById: query([Principal], Result(User, Message), (id) => {
    const user = listOfUser.get(id);
    if ('None' in user)
      return Err({ NotFound: `form with id=${id} not found` });

    return Ok(user.Some);
  }),

  // Create Form
  getAllForm: query([], Vec(Form), () => {
    return listOfForm.values();
  }),

  addForm: update([FormPayload], Result(Form, Message), (payload) => {
    if (typeof payload !== 'object' || Object.keys(payload).length === 0) {
      return Err({ NotFound: 'invalid payoad' });
    }

    let formRequest = {
      id: uuidv4(),
      listOfQuestion: new Array(),
      listOfResponse: new Array(),
      createdAt: ic.time(),
      updateAt: ic.time(),
      ...payload,
    };

    let user = listOfUser.get(payload.userId);
    user.Some?.listOfForm.push(formRequest.id);

    for (let i = 0; i < payload.numberOfQuestion; i++) {
      let questionRequest = {
        formId: formRequest.id,
        id: uuidv4(),
        index: BigInt(i),
        typeOfQuestion: payload.typeOfQuestion[i],
        choice:
          payload.typeOfQuestion[i] == 'text' ? new Array() : payload.choice[i],
        needAnswer: payload.answerType[i],
        keyAnswer: payload.answerType[i] ? payload.keyAnswer[i] : new Array(),
      };
      listOfQuestion.insert(questionRequest.id, questionRequest);
      formRequest.listOfQuestion.push(questionRequest.id);
    }

    listOfForm.insert(formRequest.id, formRequest);
    return Ok(formRequest);
  }),

  deleteFormWithId: update([text], Message, (id) => {
    let form = listOfForm.get(id);
    if ('None' in form) return { NotFound: `There is no from with id: ${id}` };

    form.Some.listOfQuestion.map((id) => {
      listOfQuestion.remove(id);
    });

    form.Some.listOfResponse.map((id) => {
      listOfFormResponse.remove(id);
    });

    return { Succes: 'Success deleting a form' };
  }),

  getFormWithId: query([text], Result(Form, Message), (id) => {
    const formRequest = listOfForm.get(id);
    if ('None' in formRequest)
      return Err({ NotFound: `form with id=${id} not found` });

    return Ok(formRequest.Some);
  }),

  getFormFromUser: query([Principal], Result(Vec(Form), Message), (id) => {
    let user = listOfUser.get(id);
    if ('None' in user)
      return Err({ NotFound: `form with id=${id} not found` });

    let forms = new Array();
    user.Some.listOfForm.map((id) => {
      let form = listOfForm.get(id);
      forms.push(form);
    });

    return Ok(forms);
  }),

  getQuestionIndexFromId: query(
    [text, int64],
    Result(Question, Message),
    (id, index) => {
      const formRequest = listOfForm.get(id);
      if ('None' in formRequest)
        return Err({ NotFound: `form with id=${id} not found` });

      let indexToNumber = Number(index);
      let answer = listOfQuestion.get(
        formRequest.Some.listOfQuestion[indexToNumber],
      );
      if ('None' in answer)
        return Err({
          NotFound: `Question at index ${index} with id=${id} not found`,
        });

      return Ok(answer.Some);
    },
  ),
  // Create an Answer
  addAnswer: update(
    [FormResponsePayload],
    Result(FormResponse, Message),
    (response) => {
      if (typeof response !== 'object' || Object.keys(response).length === 0) {
        return Err({ NotFound: 'invalid payoad' });
      }

      let formResponse = {
        id: uuidv4(),
        createdAt: ic.time(),
        updateAt: ic.time(),
        ...response,
        listOfResponseAnswer: new Array(),
      };

      let user = listOfUser.get(response.userId);
      user.Some?.listOfAnswer.push(formResponse.id);

      let form = listOfForm.get(response.formId);
      if ('None' in form) return Err({ NotFound: 'invalid Person' });

      for (let i = 0; i < response.listOfResponseAnswer.length; i++) {
        let answers = new Array();
        response.listOfResponseAnswer[i].map((answer) => {
          answers.push(answer);
        });

        let question = listOfQuestion.get(form.Some?.listOfQuestion[i]);
        let QuestionAnswer = {
          id: uuidv4(),
          index: BigInt(i),
          type: question.Some?.typeOfQuestion || 'text',
          content: answers,
          createdAt: ic.time(),
          updateAt: ic.time(),
        };

        formResponse.listOfResponseAnswer.push(QuestionAnswer.id);
        listOfResponseAnswer.insert(formResponse.id, QuestionAnswer);
      }

      listOfFormResponse.insert(formResponse.id, formResponse);
      return Ok(formResponse);
    },
  ),

  deleteAnswerWithId: update([text], Message, (id) => {
    let form = listOfFormResponse.get(id);
    if ('None' in form) return { NotFound: `There is no from with id: ${id}` };

    form.Some.listOfResponseAnswer.map((id) => {
      listOfResponseAnswer.remove(id);
    });

    return { Succes: 'Success deleting an answer' };
  }),

  getAnswerWithId: query([text], Result(FormResponse, Message), (id) => {
    const formRequest = listOfFormResponse.get(id);
    if ('None' in formRequest)
      return Err({ NotFound: `form with id=${id} not found` });

    return Ok(formRequest.Some);
  }),

  getAnsweerFromUser: query(
    [Principal],
    Result(Vec(FormResponse), Message),
    (id) => {
      let user = listOfUser.get(id);
      if ('None' in user)
        return Err({ NotFound: `form with id=${id} not found` });

      let forms = new Array();
      user.Some.listOfAnswer.map((id) => {
        let form = listOfFormResponse.get(id);
        forms.push(form);
      });

      return Ok(forms);
    },
  ),

  getAnswerIndexFromId: query(
    [text, int64],
    Result(FormResponseAnswer, Message),
    (id, index) => {
      const formRequest = listOfFormResponse.get(id);
      if ('None' in formRequest)
        return Err({ NotFound: `form with id=${id} not found` });

      let indexToNumber = Number(index);
      let answer = listOfResponseAnswer.get(
        formRequest.Some.listOfResponseAnswer[indexToNumber],
      );
      if ('None' in answer)
        return Err({
          NotFound: `answer form at index ${index} with id=${id} not found`,
        });

      return Ok(answer.Some);
    },
  ),

  greet: query([text], text, (name) => {
    return 'Hello ' + name;
  }),
});
