import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState, useEffect, Suspense } from 'react';
import { submid_backend } from '@backend';
import AuthenticationCard from '@/components/elements/AuthenticationCard/AuthenticationCard';
import { useAuthContext } from '@/components/contexts/UseAuthContext';
import { FormInterface } from './interface';
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ClipboardCopyIcon, ScrollTextIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

const seeUserForm = () => {
  const { logout, profile } = useAuthContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [listAllForms, setListAllForms] = useState<FormInterface[]>();

  async function getForm() {
    if (!profile) return;

    const data = await submid_backend.getAllFormWithUserId(profile.id);
    if ('Ok' in data) {
      setListAllForms(data.Ok);
    }
  }

  async function deleteFormId(id: string) {
    setIsLoading(true);
    const result = await submid_backend.deleteFormWithId(id);
    if (!('Succes' in result)) {
      alert('Fail deleting this form');
    } else window.location.reload();
    setIsLoading(false);
  }

  // For triggering the suspense
  const LoadFormList = () => {
    if (listAllForms === undefined) throw new Promise(() => {});

    return listAllForms.length > 0 ? (
      <Accordion type="multiple">
        {listAllForms.map((item) => (
          <AccordionItem value={item.id} key={item.id}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent className="flex flex-row justify-between">
              <div className="flex items-center gap-2 font-mono">
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(item.id);
                    toast('Successfully copied to clipboard!');
                  }}
                >
                  <ClipboardCopyIcon className="w-4 h-4" />
                </Button>
                {item.id}
              </div>
              <div className="flex flex-row gap-3">
                <Button className="flex basis-1/2" asChild disabled={isLoading}>
                  <Link to={`/forms/${item.id}`}>
                    <ScrollTextIcon />
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  className="flex basis-1/2"
                  onClick={() => deleteFormId(item.id)}
                  disabled={isLoading}
                >
                  <Trash2Icon />
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    ) : (
      <div className="text-center">You don't have any forms yet!</div>
    );
  };

  useEffect(() => {
    getForm();
  }, [profile]);

  return (
    <AuthenticationCard>
      <>
        <div className="w-[90%] md:w-1/2">
          <Suspense
            fallback={<div className="text-center">Loading your forms...</div>}
          >
            <LoadFormList />
          </Suspense>
        </div>
        <Button variant="destructive" onClick={logout}>
          Logout!
        </Button>
      </>
    </AuthenticationCard>
  );
};

export default seeUserForm;
