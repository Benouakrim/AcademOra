import { reviewsAPI } from '../api'

export const ReviewsService = {
  list: reviewsAPI.list,
  upsert: reviewsAPI.upsert,
  remove: reviewsAPI.remove,
}


