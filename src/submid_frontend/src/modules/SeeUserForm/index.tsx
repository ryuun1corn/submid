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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState, FormEvent, useEffect, FormHTMLAttributes } from 'react';
import { submid_backend } from '@backend';
import { Principal } from '@dfinity/principal';

interface okForm {
    id: string;
    title: string;
    userId: Principal;
    createdAt: BigInt;
    description: string;
    updateAt: BigInt;
    numberOfQuestion: BigInt;
}

interface NotFoundForm {
    Err: {
        NotFound: string;
    }
}

const SeeUserForm = () => {
    const [principal, setPrincipal] = useState<string>('');
    const [user, setUser] = useState<string | null | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [listAllForms, setListAllForms] =
        useState<{
            id: string;
            title: string;
            userId: Principal;
            createdAt: bigint;
            description: string;
            updateAt: bigint;
            numberOfQuestion: bigint;
        }[]>([]);

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

    async function getForm() {
        const principal = await getPrincipal();
        if (principal.isAnonymous())
            return;

        const data = await submid_backend.getAllFormWithUserId(principal)
        if ('Err' in data && 'NotFound' in data.Err) {
            console.log("Ngga ada")
        } else if ('Ok' in data) {
            data.Ok.map(item => {
                let value = {
                    id: item.id,
                    title: item.title,
                    userId: item.userId,
                    createdAt: item.createdAt,
                    description: item.description,
                    updateAt: item.updateAt,
                    numberOfQuestion: item.numberOfQuestion
                }
                // setListAllForms(prev => [...prev, value])
            })
        }
    }

    useEffect(() => {
        getForm();
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

                    <button onClick={logoutUser}>Keluar anjing</button>
                </>
            )}
        </>)
};

export default SeeUserForm;
