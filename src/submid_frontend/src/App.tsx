import { ModeToggle } from '@/components/mode-toggle';
import { HomeIcon } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function App() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-5">
      <nav className="fixed top-0 flex flex-row items-center justify-between w-full p-10">
        <Button asChild variant="ghost">
          <Link to={'/'}>
            <HomeIcon className="h-6 w-6" />
          </Link>
        </Button>
        <ModeToggle />
      </nav>
      <Outlet />
    </main>
  );
}

export default App;
