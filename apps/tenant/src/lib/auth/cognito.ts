import { Amplify } from 'aws-amplify'
import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  fetchAuthSession,
  getCurrentUser,
  type SignInOutput,
} from 'aws-amplify/auth'

// Configure Amplify once at module level
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      loginWith: {
        email: true,
        oauth: {
          domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
          scopes: ['email', 'openid', 'profile'],
          redirectSignIn: [process.env.NEXT_PUBLIC_APP_URL + '/auth/callback'],
          redirectSignOut: [process.env.NEXT_PUBLIC_APP_URL + '/login'],
          responseType: 'code',
        },
      },
    },
  },
})

export interface CognitoSession {
  accessToken: string
  idToken: string
  expiresAt: number
}

export async function cognitoSignIn(email: string, password: string): Promise<SignInOutput> {
  return signIn({ username: email, password })
}

export async function cognitoSignOut(): Promise<void> {
  return signOut()
}

export async function cognitoSignUp(
  email: string,
  password: string,
  fullName: string,
  phone?: string
): Promise<void> {
  await signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        name: fullName,
        ...(phone ? { phone_number: phone } : {}),
      },
    },
  })
}

export async function cognitoConfirmSignUp(email: string, code: string): Promise<void> {
  await confirmSignUp({ username: email, confirmationCode: code })
}

export async function cognitoResetPassword(email: string): Promise<void> {
  await resetPassword({ username: email })
}

export async function cognitoConfirmResetPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  await confirmResetPassword({ username: email, confirmationCode: code, newPassword })
}

export async function getSession(): Promise<CognitoSession | null> {
  try {
    const session = await fetchAuthSession()
    const accessToken = session.tokens?.accessToken?.toString()
    const idToken = session.tokens?.idToken?.toString()
    const expiresAt = session.tokens?.accessToken?.payload?.exp as number

    if (!accessToken || !idToken) return null

    return { accessToken, idToken, expiresAt }
  } catch {
    return null
  }
}

export async function getCurrentUserInfo() {
  try {
    return await getCurrentUser()
  } catch {
    return null
  }
}
