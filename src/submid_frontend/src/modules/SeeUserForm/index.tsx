import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { getPrincipal } from '@/lib/auth';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { submid_backend } from '@backend';
import AuthenticationCard from '@/components/elements/AuthenticationCard/AuthenticationCard';
import { useAuthContext } from '@/components/contexts/UseAuthContext';

const seeUserForm = () => {
  const { logout, profile } = useAuthContext();
  const [btnLoad, seBtnLoad] = useState<string[]>([]);
  const [listAllForms, setListAllForms] = useState<
    | {
        id: string;
        title: string;
        createdAt: bigint;
        description: string;
        updateAt: bigint;
        numberOfQuestion: bigint;
      }[]
    | undefined
  >(undefined);

  async function getForm() {
    const principal = await getPrincipal();
    if (principal.isAnonymous()) return;

    const data = await submid_backend.getAllFormWithUserId(principal);
    if ('Ok' in data) {
      setListAllForms(data.Ok);
    }
  }

  async function deleteFormId(id: string) {
    seBtnLoad((prev) => [...prev, id]);
    const result = await submid_backend.deleteFormWithId(id);
    if (!('Succes' in result)) {
      alert('Fail deleting this form');
    }
  }

  useEffect(() => {
    getForm();
  }, [profile]);

  return (
    <AuthenticationCard>
      <>
        <div className="flex gap-3 flex-wrap">
          {listAllForms?.map((item) => (
            <Card className="w-[350px]">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <p>Form Id:</p>
                  <p>{item.id}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-3">
                <Button className="flex basis-1/2">
                  <Link to={`/seeForm/${item.id}`}>See Form Response</Link>
                </Button>
                <Button
                  variant="destructive"
                  className="flex basis-1/2"
                  onClick={() => deleteFormId(item.id)}
                  disabled={btnLoad.some((btn) => btn == item.id)}
                >
                  Delete Form
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <Button variant="destructive" onClick={logout}>
          Logout!
        </Button>
      </>
    </AuthenticationCard>
  );
};

export default seeUserForm;
