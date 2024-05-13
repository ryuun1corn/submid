import { useAuthContext } from '@/components/contexts/UseAuthContext';
import { Button } from '@/components/ui/button';

const UserInfo = () => {
  const { profile, logout } = useAuthContext();
  return (
    profile && (
      <Button
        onClick={() => {
          logout();
          window.location.reload();
        }}
        variant="destructive"
      >
        Logout
      </Button>
    )
  );
};

export default UserInfo;
