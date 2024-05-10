import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/components/contexts/UseAuthContext';
import ProfileCard from './module-elements/ProfileCard';
import { Suspense } from 'react';

const CreateFormModule = () => {
  const { login, isAuthenticated } = useAuthContext();

  const LoadComponent = () => {
    if (isAuthenticated === undefined) throw new Promise(() => {});

    return !isAuthenticated ? (
      <div className="flex flex-col items-center gap-5">
        <div>You are not authenticated yet</div>

        <Button variant="secondary" onClick={login}>
          Login
        </Button>
      </div>
    ) : (
      <ProfileCard />
    );
  };

  return (
    <>
      <Suspense fallback={<div>loading...</div>}>
        <LoadComponent />
      </Suspense>
    </>
  );
};

export default CreateFormModule;
