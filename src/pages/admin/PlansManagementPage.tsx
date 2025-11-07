import React, { useEffect, useState } from 'react';
import { getPlans, getFeatures, getPlanFeatures, upsertPlanFeature } from '../../lib/services/featureService';

type Plan = { id: string; key: string; name: string };
type Feature = { id: string; key: string; name: string };
type PlanFeature = {
  plan_id: string;
  feature_key: string;
  access_level: 'count' | 'unlimited';
  limit_value: number;
};

export default function PlansManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [rules, setRules] = useState<Record<string, PlanFeature>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [plansData, featuresData, rulesData] = await Promise.all([
          getPlans(),
          getFeatures(),
          getPlanFeatures(),
        ]);

        setPlans(plansData || []);
        setFeatures(featuresData || []);

        const rulesMap = (rulesData || []).reduce<Record<string, PlanFeature>>((acc, rule: PlanFeature) => {
          acc[`${rule.plan_id}-${rule.feature_key}`] = rule;
          return acc;
        }, {});
        setRules(rulesMap);
      } catch (error) {
        console.error('Failed to load plans management data', error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleRuleChange = (
    planId: string,
    featureKey: string,
    field: 'access_level' | 'limit_value',
    value: string | number
  ) => {
    const key = `${planId}-${featureKey}`;
    const existingRule = rules[key] || {
      plan_id: planId,
      feature_key: featureKey,
      access_level: 'count' as const,
      limit_value: 0,
    };

    setRules({
      ...rules,
      [key]: {
        ...existingRule,
        [field]: value,
      },
    });
  };

  const handleSaveRule = async (planId: string, featureKey: string) => {
    const key = `${planId}-${featureKey}`;
    const rule = rules[key];
    if (!rule) return;

    try {
      await upsertPlanFeature({
        ...rule,
        limit_value: Number(rule.limit_value),
      });
      window.alert('Rule saved!');
    } catch (error) {
      console.error('Failed to save rule', error);
      window.alert('Failed to save rule.');
    }
  };

  if (loading) {
    return <div className="p-6">Loading feature management...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Feature &amp; Plan Management</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-4 border-b text-left">Feature</th>
              {plans.map((plan) => (
                <th key={plan.id} className="py-2 px-4 border-b text-center">{plan.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => (
              <tr key={feature.id} className="border-b">
                <td className="py-3 px-4 font-medium">{feature.name}</td>
                {plans.map((plan) => {
                  const key = `${plan.id}-${feature.key}`;
                  const rule = rules[key];
                  const access = rule?.access_level || 'count';
                  const limit = rule?.limit_value ?? 0;

                  return (
                    <td key={plan.id} className="py-3 px-4 text-center border-l">
                      <div className="flex flex-col gap-2 items-center">
                        <select
                          value={access}
                          onChange={(e) => handleRuleChange(plan.id, feature.key, 'access_level', e.target.value)}
                          className="p-1 border rounded"
                        >
                          <option value="count">Count</option>
                          <option value="unlimited">Unlimited</option>
                        </select>
                        <input
                          type="number"
                          value={limit}
                          disabled={access === 'unlimited'}
                          onChange={(e) => handleRuleChange(plan.id, feature.key, 'limit_value', Number(e.target.value))}
                          className="p-1 border rounded w-24 mx-auto disabled:bg-gray-100"
                          min={0}
                        />
                        <button
                          onClick={() => handleSaveRule(plan.id, feature.key)}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          Save
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

