import { usersPublicAPI, notificationsAPI, userPreferencesAPI, savedMatchesAPI, profileSectionsAPI } from '../api'

export const UsersService = {
  public: usersPublicAPI,
  notifications: notificationsAPI,
  preferences: userPreferencesAPI,
  savedMatches: savedMatchesAPI,
  profileSections: profileSectionsAPI,
}


