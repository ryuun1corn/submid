"use-client"

import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"

interface choiceQuestion {
    questionId: string;
    id: string;
    index: bigint;
    content: string;
}

interface basicQuestion {
    formId: string,
    id: string,
    index: bigint,
    pageIndex: bigint,
    typeOfQuestion: string,
    needAnswer: boolean,
    content: string
}


// import * as React from 'react';
const setTypeLayout =
    (
        type: string,
        valid: boolean,
        choices: choiceQuestion[],
        index: number,
        addResponse: (index: number, value: string) => void,
        deleteResponse: (index: number, value: string) => void,
        updateResponse: (index: number, value: string) => void
    ) => {
        let [choicePicked, setChoicePicked] = useState<string[]>([]);

        const handleChange = (e: string) => {
            updateResponse(index, e);
        }

        const handleChangeSelect = (e: number) => {
            if (choicePicked.some(item => item == choices[e].content)) {
                setChoicePicked(prev => prev.filter(item => item != choices[e].content));
                deleteResponse(index, choices[e].content);
            }
            else {
                setChoicePicked([...choicePicked, choices[e].content]);
                addResponse(index, choices[e].content);
            }
        }

        useEffect(() => {
            console.log(choicePicked)
        }, [choicePicked])

        switch (type) {
            case "1":
                return <Input placeholder="Answer" disabled={valid} onChange={(e) => handleChange(e.target.value)}></Input>
                break;
            case "2":
                return (
                    <RadioGroup disabled={valid} onValueChange={(e) => handleChange(e)}>
                        {choices.map((item, i) => (
                            <div className='flex items-center space-x-2 justify-between'>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value={item.content} id={`option-${i}`} />
                                    <Label htmlFor={`option-${i}`}>{item.content}</Label>
                                </div>
                            </div>
                        ))}
                    </RadioGroup >
                )
                break;
            case "3":
                return (
                    <div>
                        {
                            choices.map((item, i) => (
                                <div className="flex items-center space-x-2 justify-between">
                                    <div className='flex flex-row gap-2'>
                                        <Checkbox value={`check-${i}`} id={`check-${i}`} disabled={valid} onCheckedChange={() => handleChangeSelect(i)} />
                                        <Label htmlFor={`check-${i}`}>{item.content}</Label>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )
                break;

            default:
                return "";
                break;
        }
    }

const QuestionLayout = (props: {
    currentQuestion: basicQuestion,
    currentQuestionChoice: choiceQuestion[],
    disabledOn: boolean,
    index: number
    addResponse: (index: number, value: string) => void
    deleteResponse: (index: number, value: string) => void
    updateResponse: (index: number, value: string) => void
}
) => {
    return (
        <div className='flex justify-start flex-col align-left w-full'>
            <div>
                <h1>
                    {props.currentQuestion.content}
                </h1>
                {setTypeLayout(
                    props.currentQuestion.typeOfQuestion,
                    props.disabledOn,
                    props.currentQuestionChoice,
                    props.index,
                    props.addResponse,
                    props.deleteResponse,
                    props.updateResponse
                )}
            </div>
        </div>
    )
}

export {
    QuestionLayout
}