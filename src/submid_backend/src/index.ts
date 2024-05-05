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
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const questionType = ['text', 'radio', 'multi-select', 'none'];
const Form = Record({
  id: text,
  userId: Principal,
  title: text,
  description: text,
  numberOfQuestion: nat64,
  createdAt: nat64,
  updateAt: nat64,
});
type Form = typeof Form.tsType;

const Question = Record({
  formId: text,
  id: text,
  index: nat64,
  pageIndex: nat64,
  typeOfQuestion: text,
  needAnswer: bool,
});
type Question = typeof Question.tsType;

const QuestionChoice = Record({
  questionId: text,
  id: text,
  index: nat64,
  content: text,
});
type QuestionChoice = typeof QuestionChoice.tsType;

const KeyAnswer = Record({
  questionId: text,
  id: text,
  content: text,
});
type KeyAnswer = typeof KeyAnswer.tsType;

const FormResponse = Record({
  userId: Principal,
  formId: text,
  id: text,
  title: text,
  createdAt: nat64,
  updateAt: nat64,
});
type FormResponse = typeof FormResponse.tsType;

const FormResponseAnswer = Record({
  responseId: text,
  id: text,
  index: nat64,
  content: text,
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
  pageIndex: Vec(nat64),
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
  userName: text,
  createdAt: nat64,
});
type User = typeof User.tsType;

const listOfForm = StableBTreeMap<text, Form>(0);
const listOfQuestion = StableBTreeMap<text, Question>(1);
const listOfFormResponse = StableBTreeMap<text, FormResponse>(2);
const listOfResponseAnswer = StableBTreeMap<text, FormResponseAnswer>(3);
const listOfUser = StableBTreeMap<Principal, User>(4);
const listOfQuestionChoice = StableBTreeMap<text, QuestionChoice>(5);
const listOfKeyAnswer = StableBTreeMap<text, KeyAnswer>(6);

let message = '';
export default Canister({
  // Create new User
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

  // Update
  updateUser: update([User], Message, (user) => {
    const exist = listOfUser.get(user.id);
    if ('None' in exist)
      return { NotFound: `cannot update user with id=${user.id} not found` };

    listOfUser.insert(exist.Some.id, user);
    return { Succes: 'Success updating user' };
  }),

  // get All User
  getAllUser: query([], Vec(User), () => {
    return listOfUser.values();
  }),

  // Get User by id
  getUserById: query([Principal], Result(User, Message), (id) => {
    const user = listOfUser.get(id);
    if ('None' in user)
      return Err({ NotFound: `user with id=${id} not found` });

    return Ok(user.Some);
  }),

  // Get all Form
  getAllForm: query([], Vec(Form), () => {
    return listOfForm.values();
  }),

  // Create a New Form
  addForm: update([FormPayload], Result(Form, Message), (payload) => {
    if (typeof payload !== 'object' || Object.keys(payload).length === 0) {
      return Err({ NotFound: 'invalid payoad' });
    }

    if (
      payload.numberOfQuestion != BigInt(payload.keyAnswer.length) ||
      payload.numberOfQuestion != BigInt(payload.pageIndex.length) ||
      payload.numberOfQuestion != BigInt(payload.contents.length) ||
      payload.numberOfQuestion != BigInt(payload.choice.length) ||
      payload.numberOfQuestion != BigInt(payload.answerType.length) ||
      payload.numberOfQuestion != BigInt(payload.typeOfQuestion.length)
    )
      return Err({
        Fail: 'Invalid payload!! number of question must be the same with the other vector size',
      });

    let formRequest = {
      id: uuidv4(),
      createdAt: ic.time(),
      updateAt: ic.time(),
      ...payload,
    };

    for (let i = 0; i < payload.numberOfQuestion; i++) {
      let questionRequest = {
        formId: formRequest.id,
        id: uuidv4(),
        index: BigInt(i),
        pageIndex: payload.pageIndex[i],
        typeOfQuestion: payload.typeOfQuestion[i],
        choice:
          payload.typeOfQuestion[i] == 'text' ? new Array() : payload.choice[i],
        needAnswer: payload.answerType[i],
        keyAnswer: payload.answerType[i] ? payload.keyAnswer[i] : new Array(),
      };

      for (let i = 0; i < questionRequest.keyAnswer.length; i++) {
        let keyAnswer = {
          questionId: questionRequest.id,
          id: uuidv4(),
          content: questionRequest.keyAnswer[i],
        };
        listOfKeyAnswer.insert(keyAnswer.id, keyAnswer);
      }

      listOfQuestion.insert(questionRequest.id, questionRequest);
    }

    listOfForm.insert(formRequest.id, formRequest);
    return Ok(formRequest);
  }),

  // Delete form with Id
  deleteFormWithId: update([text], Message, (id) => {
    let form = listOfForm.get(id);
    if ('None' in form) return { NotFound: `There is no from with id: ${id}` };

    listOfQuestion.values().map((question) => {
      if (question.formId === id) {
        listOfQuestionChoice.values().map((questionChoice) => {
          if (questionChoice.questionId == question.id) {
            listOfQuestionChoice.remove(questionChoice.id);
          }
        });
        listOfKeyAnswer.values().map((keyAnswer) => {
          if (keyAnswer.questionId == question.id) {
            listOfKeyAnswer.remove(keyAnswer.id);
          }
        });
        listOfQuestion.remove(question.id);
      }
    });

    listOfFormResponse.values().map((response) => {
      if (response.formId == id) {
        listOfResponseAnswer.values().map((answer) => {
          if (answer.responseId == response.id) {
            listOfResponseAnswer.remove(answer.id);
          }
        });
        listOfFormResponse.remove(response.id);
      }
    });

    listOfForm.remove(id);
    return { Succes: 'Success deleting a form' };
  }),

  // Get Form with Id
  getFormWithId: query([text], Result(Form, Message), (id) => {
    const formRequest = listOfForm.get(id);
    if ('None' in formRequest)
      return Err({ NotFound: `form with id=${id} not found` });

    return Ok(formRequest.Some);
  }),

  // Get All Form that have userId
  getAllFormWithUserId: query([Principal], Result(Vec(Form), Message), (id) => {
    let user = listOfUser.get(id);
    if ('None' in user)
      return Err({ NotFound: `form with id=${id} not found` });

    let forms = new Array();
    listOfForm.values().map((key, value) => {
      if (key.userId.compareTo(id) == 'eq') forms.push(key);
    });

    return Ok(forms);
  }),

  // Get Question that it's Form Id
  getQuestionWithFromId: query([text], Result(Vec(Question), Message), (id) => {
    const formRequest = listOfForm.get(id);
    if ('None' in formRequest)
      return Err({ NotFound: `form with id=${id} not found` });

    let answer = new Array();
    listOfQuestion.values().map((question) => {
      if (question.formId == formRequest.Some.id) {
        answer.push(question);
      }
    });

    return Ok(answer);
  }),

  // Get All Question Choice Form a Question using Id
  getAllQuestionChoiceWithQuestionId: query(
    [text],
    Result(Vec(QuestionChoice), Message),
    (id) => {
      const question = listOfQuestion.get(id);
      if ('None' in question)
        return Err({ NotFound: `question with id=${id} not found` });

      let answer = new Array();
      listOfQuestionChoice.values().map((questions) => {
        if (questions.questionId == questions.questionId) {
          answer.push(question);
        }
      });

      return Ok(answer);
    },
  ),

  // Create Response of Form
  addFormResponse: update(
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

      let form = listOfForm.get(response.formId);
      if ('None' in form) return Err({ NotFound: 'invalid Person' });

      for (let i = 0; i < response.listOfResponseAnswer.length; i++) {
        response.listOfResponseAnswer[i].map((answer) => {
          let questionAnswer = {
            responseId: form.Some.id,
            id: uuidv4(),
            index: BigInt(i),
            content: answer,
          };

          listOfResponseAnswer.insert(questionAnswer.id, questionAnswer);
        });
      }

      listOfFormResponse.insert(formResponse.id, formResponse);
      return Ok(formResponse);
    },
  ),

  // Delete Form Response That have User Id
  deleteFormResponseWithUserId: update([text], Message, (id) => {
    let form = listOfFormResponse.get(id);
    if ('None' in form)
      return { NotFound: `There is no answer response with id: ${id}` };

    listOfFormResponse.values().map((response) => {
      if (response.formId == form.Some.id) {
        listOfResponseAnswer.values().map((answer) => {
          if (answer.responseId == response.id) {
            listOfResponseAnswer.remove(answer.id);
          }
        });
        listOfFormResponse.remove(response.id);
      }
    });

    return { Succes: 'Success deleting all answer response from a user' };
  }),

  // Delete a Form Response with Id
  deleteFormResponseWithId: update([text], Message, (id) => {
    let answer = listOfResponseAnswer.get(id);
    if ('None' in answer)
      return { NotFound: `There is no from with id: ${id}` };

    listOfResponseAnswer.values().map((answer) => {
      if (answer.responseId == answer.id) {
        listOfResponseAnswer.remove(answer.id);
      }
    });
    listOfFormResponse.remove(id);

    return { Succes: 'Success deleting an answer' };
  }),

  // Get Form Response with Id
  getFormResponseWithId: query([text], Result(FormResponse, Message), (id) => {
    const formRequest = listOfFormResponse.get(id);
    if ('None' in formRequest)
      return Err({ NotFound: `answer with id=${id} not found` });

    return Ok(formRequest.Some);
  }),

  // Get All Form Response
  getAllFormResponse: query([], Vec(FormResponse), () => {
    return listOfFormResponse.values();
  }),

  // Get All Form Response from user id
  getAllFormResponseWithUserId: query(
    [Principal],
    Result(Vec(FormResponse), Message),
    (id) => {
      let user = listOfUser.get(id);
      if ('None' in user)
        return Err({ NotFound: `answer with id=${id} not found` });

      let answers = new Array();
      listOfFormResponse.values().map((response) => {
        if (response.userId.compareTo(user.Some.id) == 'eq') {
          answers.push(response);
        }
      });

      return Ok(answers);
    },
  ),

  // Get All Form Response from a Form id
  getAllFormResponseWithFormId: query(
    [text],
    Result(Vec(FormResponse), Message),
    (id) => {
      let user = listOfForm.get(id);
      if ('None' in user)
        return Err({ NotFound: `answer with id=${id} not found` });

      let answers = new Array();
      listOfFormResponse.values().map((response) => {
        if (response.formId == id) {
          answers.push(response);
        }
      });

      return Ok(answers);
    },
  ),

  // Get All Answer form a Respond
  getAnswerWithFormRespondId: query(
    [text],
    Result(Vec(FormResponseAnswer), Message),
    (id) => {
      let respondAnswer = listOfFormResponse.get(id);
      if ('None' in respondAnswer)
        return Err({ NotFound: `answer with id=${id} not found` });

      let answers = new Array();
      listOfResponseAnswer.values().map((response) => {
        if (response.responseId == id) {
          answers.push(response);
        }
      });

      return Ok(answers);
    },
  ),

  greet: query([text], text, (name) => {
    return 'Hello ' + name;
  }),
});
