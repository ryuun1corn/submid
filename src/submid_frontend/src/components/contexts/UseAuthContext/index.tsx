import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AuthContextInterface,
  AuthContextProviderProps,
  UserInterface,
} from './interface';
import { createActor, canisterId } from '@backend';
import { AuthClient } from '@dfinity/auth-client';
import { ActorSubclass } from '../../../../../../node_modules/@dfinity/agent';
import { _SERVICE } from '../../../../../declarations/submid_backend/submid_backend.did';

const AuthContext = createContext({} as AuthContextInterface);

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({
  children,
}) => {
  const [profile, setProfile] = useState<UserInterface | null>();
  const [authClient, setAuthClient] = useState<AuthClient>();
  const [actor, setActor] = useState<ActorSubclass<_SERVICE>>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>();

  // The current URL is for testing purposes
  const IDENTITY_PROVIDER = `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:8000`;
  const MAX_TTL = BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000);

  const login = () => {
    authClient?.login({
      identityProvider: IDENTITY_PROVIDER,
      onSuccess: () => {
        initActor();
        setIsAuthenticated(true);
      },
      maxTimeToLive: MAX_TTL,
    });
  };

  const logout = () => {
    authClient?.logout();
    setIsAuthenticated(false);
    setActor(undefined);
    window.location.reload();
  };

  const initActor = () => {
    const actor = createActor(canisterId as string, {
      agentOptions: {
        identity: authClient?.getIdentity(),
      },
    });

    setActor(actor as ActorSubclass<_SERVICE>);
  };

  const getProfile = async () => {
    if (!authClient || !actor) return;

    const principal = await authClient.getIdentity().getPrincipal();
    if (principal.isAnonymous()) setProfile(null);

    const responseData = await actor?.getUserById(principal);
    if ('Err' in responseData && 'NotFound' in responseData.Err) {
      setProfile(null);
    } else if ('Ok' in responseData) {
      setProfile(responseData.Ok);
    }
  };

  useEffect(() => {
    AuthClient.create().then(async (client) => {
      const isAuthenticated = await client.isAuthenticated();

      setAuthClient(client);
      setIsAuthenticated(isAuthenticated);
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      initActor();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (actor) {
      getProfile();
    }
  }, [actor]);

  const contextValue = {
    profile: profile,
    authClient: authClient,
    actor: actor,
    isAuthenticated: isAuthenticated,
    login: login,
    logout: logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
