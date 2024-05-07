// import { AuthClient } from '@dfinity/auth-client';

// // that is the url of the webapp for the internet identity.
// // The current URL is for testing purposes
// const IDENTITY_PROVIDER = `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:8000`;
// const MAX_TTL = BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000);

// // export async function getAuthClient() {
// //   return await AuthClient.create();
// // }

// // export async function getPrincipal() {
// //   const authClient = await getAuthClient();
// //   return authClient.getIdentity()?.getPrincipal();
// // }

// // export async function getPrincipalText() {
// //   return (await getPrincipal()).toText();
// // }

// // export async function getIdentity() {
// //   const authClient = await getAuthClient();
// //   return authClient.getIdentity();
// // }

// // export async function isAuthenticated(): Promise<boolean> {
// //   try {
// //     const authClient = await getAuthClient();
// //     return await authClient.isAuthenticated();
// //   } catch (err) {
// //     logout();
// //     return false;
// //   }
// // }

// export async function login(authClient: AuthClient) {
//   const isAuthenticated = await authClient.isAuthenticated();

//   if (!isAuthenticated) {
//     await authClient.login({
//       identityProvider: IDENTITY_PROVIDER,
//       onSuccess: async () => {
//         window.location.reload();
//       },
//       maxTimeToLive: MAX_TTL,
//     });
//   }
// }

// export async function logout(authClient: AuthClient) {
//   authClient.logout();
//   window.location.reload();
// }
