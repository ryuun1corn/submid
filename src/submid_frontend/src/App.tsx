import { ModeToggle } from '@/components/mode-toggle';
import { ChevronsLeft } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function App() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-5">
      <div className="absolute top-10 flex flex-row items-center justify-between w-full px-10">
        <Button asChild variant="outline">
          <Link to={'/'}>
            <ChevronsLeft className="h-4 w-4" />
          </Link>
        </Button>
        <ModeToggle />
      </div>
      <Outlet />
    </main>
  );
}

export default App;
