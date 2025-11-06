import { universitiesAPI } from '../api'

export const UniversitiesService = {
  getUniversityBySlug: universitiesAPI.getUniversityBySlug,
  list: universitiesAPI.list,
  create: (universitiesAPI as any).create,
  update: (universitiesAPI as any).update,
}


