import { ModeToggle } from '@/components/mode-toggle';
import HomepageModule from './components/modules/HomepageModule';

function App() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-5">
      <div className="absolute top-10 right-10">
        <ModeToggle />
      </div>
      <HomepageModule />
    </main>
  );
}

export default App;
