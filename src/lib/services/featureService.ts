import { api } from '../api';

export const getPlans = async () => {
  return api.get('/admin/features/plans');
};

export const getFeatures = async () => {
  return api.get('/admin/features/features');
};

export const getPlanFeatures = async () => {
  return api.get('/admin/features/plan-features');
};

export const upsertPlanFeature = async (rule: {
  plan_id: string;
  feature_key: string;
  access_level: 'count' | 'unlimited';
  limit_value: number;
}) => {
  return api.post('/admin/features/plan-features', rule);
};

