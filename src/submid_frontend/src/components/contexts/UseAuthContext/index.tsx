import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AuthContextInterface,
  AuthContextProviderProps,
  UserInterface,
} from './interface';
import { submid_backend } from '@backend';
import { AuthClient } from '@dfinity/auth-client';
import { _SERVICE } from '../../../../../declarations/submid_backend/submid_backend.did';

const AuthContext = createContext({} as AuthContextInterface);

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({
  children,
}) => {
  const [profile, setProfile] = useState<UserInterface | null>();
  const [authClient, setAuthClient] = useState<AuthClient>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>();

  // The current URL is for testing purposes
  const status = process.env.DFX_NETWORK;
  const IDENTITY_PROVIDER =
    status === 'local'
      ? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:8000`
      : `https://identity.ic0.app`;
  const MAX_TTL = BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000);

  const login = () => {
    if (!authClient) return;
    authClient.login({
      identityProvider: IDENTITY_PROVIDER,
      onSuccess: () => {
        setIsAuthenticated(true);
        getProfile();
      },
      maxTimeToLive: MAX_TTL,
    });
  };

  const logout = () => {
    if (!authClient) return;
    authClient.logout();
    setIsAuthenticated(false);
  };

  const getProfile = async () => {
    if (!authClient) return;

    const principal = authClient.getIdentity().getPrincipal();
    if (principal.isAnonymous()) setProfile(null);

    try {
      setProfile(undefined);
      const responseData = await submid_backend.getUserById(principal);
      if ('Err' in responseData && 'NotFound' in responseData.Err) {
        setProfile(null);
      } else if ('Ok' in responseData) {
        setProfile(responseData.Ok);
      }
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const createProfile = async (name: string) => {
    if (!authClient || name == '') return;

    try {
      const responseData = await submid_backend.createUser({
        id: authClient.getIdentity().getPrincipal(),
        name: name,
      });
      if ('Succes' in responseData) {
        getProfile();
      }
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  useEffect(() => {
    AuthClient.create().then(async (client) => {
      const isAnonymous = await client
        .getIdentity()
        .getPrincipal()
        .isAnonymous();

      setAuthClient(client);
      setIsAuthenticated(!isAnonymous);
    });
  }, []);

  useEffect(() => {
    if (authClient) {
      getProfile();
    }
  }, [authClient]);

  const contextValue = {
    profile: profile,
    authClient: authClient,
    isAuthenticated: isAuthenticated,
    createProfile: createProfile,
    login: login,
    logout: logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
