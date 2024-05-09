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
import { Input } from "@/components/ui/input"
import { useState, FormEvent, useEffect } from 'react';
import { submid_backend } from '@backend';
import { QuestionLayout } from '@/components/ui/question-layout';
// import { Item } from '@radix-ui/react-dropdown-menu';

const FillForm = () => {
    const [principal, setPrincipal] = useState<string>('');
    const [user, setUser] = useState<string | null | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [valid, setValid] = useState<boolean>(false);
    const [questionResponse, setQuestionRespone] = useState<string[][]>([[]]);
    const [questionChoice, setQuestionChoice] = useState<{
        questionId: string;
        id: string;
        index: bigint;
        content: string;
    }[]>([])
    const [question, setQuestion] = useState<{
        formId: string;
        id: string,
        index: bigint,
        pageIndex: bigint,
        typeOfQuestion: string,
        needAnswer: boolean,
        content: string
    }[]>([]);
    const [form, setForm] = useState<{
        id: string;
        title: string;
        description: string;
        numberOfQuestion: bigint;
    } | undefined>(undefined);


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

    async function getQuestionChoice(id: string) {
        const result = await submid_backend.getAllQuestionChoiceWithQuestionId(id);
        if ("Ok" in result) {
            if (!question.some(item => item.id == id)) {
                result.Ok.map(item => {
                    setQuestionChoice(prev => [...prev, item]);
                })
            }
        }
    }

    async function handleSearch(event: FormEvent) {
        event.preventDefault();
        const formData = new FormData(event.target as HTMLFormElement);
        const id = formData.get("formId");

        if (id != null) {
            const result = await submid_backend.getFormWithId(id.toString());
            if ("Ok" in result) {
                setForm(result.Ok);
                setValid(true);
                const questionResult = await submid_backend.getQuestionWithFormId(id.toString());
                if ("Ok" in questionResult) {
                    let currentQuestion = questionResult.Ok;
                    let sortedQuestion = new Array();

                    questionResult.Ok.map(item => {
                        getQuestionChoice(item.id);
                    })

                    for (let i = 0; i < questionResult.Ok.length; i++) {
                        const indexQuestion = currentQuestion.find(prev => Number(prev.index) == i);
                        sortedQuestion.push(indexQuestion);
                    }
                    setQuestion(sortedQuestion);
                    let newResponse = new Array();
                    for (let i = 0; i < sortedQuestion.length; i++) {
                        newResponse.push(new Array());
                    }
                    setQuestionRespone(newResponse);
                }


            }
            else {
                alert("Form not found!!")
                setValid(false);
                setForm(undefined);
                setQuestion(prev => prev.filter((item) => (item != item)));
                setQuestionChoice(prev => prev.filter((item) => (item != item)))
                if (form == form) {
                    if (question == question) {
                        if (valid == valid) {

                        }
                    }
                }
            }
        }
    }

    function addQuestionResponse(index: number, value: string) {
        let newQuestionResponse = [...questionResponse];
        let currentCopy = [...newQuestionResponse[index]];
        currentCopy.push(value)
        newQuestionResponse[index] = currentCopy;
        setQuestionRespone(newQuestionResponse);
    }

    function deleteQuestionResponse(index: number, value: string) {
        let newQuestionResponse = [...questionResponse];
        let currentCopy = [...newQuestionResponse[index]];
        currentCopy = currentCopy.filter(item => item != value);
        newQuestionResponse[index] = currentCopy;
        setQuestionRespone(newQuestionResponse);
    }

    function updateQuestionResponse(index: number, value: string) {
        let newQuestionResponse = [...questionResponse];
        let currentCopy = [...newQuestionResponse[index]];
        currentCopy[0] = value;
        newQuestionResponse[index] = currentCopy;
        setQuestionRespone(newQuestionResponse);
    }

    async function createResponse() {
        setIsLoading(true);
        const principal = await getPrincipal();
        let formId = form?.id;
        let title = form?.title;
        const response = questionResponse;

        if (formId == undefined)
            formId = "";

        if (title == undefined)
            title = "";

        let payload = {
            userId: principal,
            formId: formId,
            title: title,
            listOfResponseAnswer: response
        }

        if (payload != undefined) {
            const result = await submid_backend.addFormResponse(payload);
            if ("Ok" in result) {
                alert("Succes adding the response");
            }
            else {
                alert("Failed adding the resposne");
            }
        }
        setIsLoading(false);

    }

    useEffect(() => {
        console.log("Que", questionResponse);
    }, [questionResponse])

    const getForm = () => {
        return (
            <div className='w-full'>
                {valid && (
                    question.map((item, index) => (
                        <QuestionLayout
                            currentQuestion={item}
                            currentQuestionChoice={questionChoice.filter(choice => choice.questionId === item.id)}
                            disabledOn={false}
                            index={index}
                            addResponse={addQuestionResponse}
                            deleteResponse={deleteQuestionResponse}
                            updateResponse={updateQuestionResponse}
                        />
                    ))
                )}
            </div>
        );
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
                                When filling out forms, stick with trusted individuals or organizations. Whether it's personal or for a group, prioritize trust to keep your information safe and secure.
                            </p>
                        </div>

                        <div className='w-full'>
                            <form className="w-full flex gap-x-4" action="" onSubmit={(e) => handleSearch(e)}>
                                <Input type="text" name="formId" placeholder="SubmiD Form ID" />
                                <Button type="submit">Search</Button>
                            </form>
                        </div>
                        {
                            valid &&
                            <Card className='w-full p-3'>
                                <CardHeader className=''>
                                    <CardTitle>{form?.title}</CardTitle>
                                    <CardDescription>{form?.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {getForm()}

                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" disabled={isLoading} onClick={createResponse}>
                                        Create Response
                                    </Button>
                                </CardFooter>
                            </Card>
                        }
                        <Button variant="destructive" className='w-full' onClick={logoutUser}>
                            Logout
                        </Button>
                    </div>
                </>
            )}
        </>
    );
};

export default FillForm;
