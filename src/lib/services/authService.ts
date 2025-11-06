import { authAPI } from '../api'

export const AuthService = {
  login: authAPI.login,
  signup: authAPI.signup,
  me: authAPI.me,
  updateProfile: authAPI.updateProfile,
  oauthGoogleStart: authAPI.oauthGoogleStart,
  oauthLinkedInStart: authAPI.oauthLinkedInStart,
}


