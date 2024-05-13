import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HomepageModule = () => {
  return (
    <>
      <h1 className="font-bold tracking-tighter sm:text-5xl text-6xl md:text-7xl">
        SubmiD
      </h1>
      <p className="max-w-[90%] text-gray-500 text-xs sm:text-xl dark:text-gray-400 text-center">
        Secure, Decentralized, and Intuitive Form on the Blockchain. <br />
        Effortlessly build and share forms for any purpose.
      </p>
      <div className="flex flex-col sm:flex-row gap-5 *:w-30 w-[90%] justify-center my-3 md:my-0">
        <Button asChild>
          <Link to={'/create'}>Create Form</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to={'/fill'}>Fill a Form</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to={'/forms'}>My Forms</Link>
        </Button>
      </div>
    </>
  );
};

export default HomepageModule;
