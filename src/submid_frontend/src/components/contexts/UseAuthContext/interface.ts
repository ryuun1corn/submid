import { ActorSubclass } from '../../../../../../node_modules/@dfinity/agent';
import { _SERVICE } from '../../../../../declarations/submid_backend/submid_backend.did';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '../../../../../../node_modules/@dfinity/principal';
import { ReactNode } from 'react';

export interface AuthContextProviderProps {
  children: ReactNode;
}

export interface AuthContextInterface {
  profile: UserInterface | null | undefined;
  authClient: AuthClient | undefined;
  actor: ActorSubclass<_SERVICE> | undefined;
  isAuthenticated: boolean | undefined;
  createProfile: (name: string) => Promise<void>;
  login: () => void;
  logout: () => void;
}

export interface UserInterface {
  id: Principal;
  userName: string;
  createdAt: bigint;
}
