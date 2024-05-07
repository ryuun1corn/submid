import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import { useAuthContext } from '@/components/contexts/UseAuthContext';
import ProfileCard from './module-elements/ProfileCard';

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
      <div className="absolute top-10 left-10"></div>
      <Suspense fallback={<div>loading...</div>}>
        <LoadComponent />
      </Suspense>
    </>
  );
};

export default CreateFormModule;
