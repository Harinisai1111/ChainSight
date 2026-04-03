import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

const AuthButton = () => {
  const { user } = useUser();

  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="ghost" className="text-gray-300 hover:text-white">
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
            <span className="text-sm text-white">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</span>
          </div>
          {/* Clerk's UserButton provides avatar, account management, and sign-out */}
          <UserButton afterSignOutUrl="/cryptoflow/" />
        </div>
      </SignedIn>
    </>
  );
};

export default AuthButton;
