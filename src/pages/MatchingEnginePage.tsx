import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { matchingAPI, getCurrentUser } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Compass,
  DollarSign,
  Book,
  Flag,
  CheckCircle,
  Calendar,
  Sparkles,
  MapPin,
  FileText,
  Building
} from 'lucide-react';

// --- Data Types ---

interface University {
  id: string;
  name: string;
  country: string;
  description?: string;
  image_url?: string;
  avg_tuition_per_year: number;
  min_gpa: number;
  interests: string[];
  application_deadline: string;
  required_tests?: string[];
  program_url?: string;
}

interface Criteria {
  interests: string[];
  minGpa: number;
  maxBudget: number;
  country: string;
}

const allInterests = [
  'Computer Science',
  'Engineering',
  'Business',
  'Medicine',
  'Humanities',
  'Arts',
  'Physics',
  'Mathematics',
  'Biology',
  'Law',
  'Trades',
  'Nursing',
  'Liberal Arts',
];

const allCountries = ['Any', 'USA', 'Canada', 'France', 'UK'];

// --- Utility Components ---

const StepHeader = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="flex-shrink-0 w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

const Checkbox = ({ id, label, checked, onChange }: { id: string, label: string, checked: boolean, onChange: () => void}) => (
  <motion.label
    htmlFor={id}
    onClick={onChange}
    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
      checked ? 'bg-primary-50 border-primary-500 shadow-md' : 'bg-white border-gray-200 hover:border-gray-300'
    }`}
    whileTap={{ scale: 0.98 }}
  >
    <div
      className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center border-2 ${
        checked ? 'bg-primary-600 border-primary-600' : 'bg-gray-100 border-gray-300'
      }`}
    >
      {checked && <CheckCircle className="w-4 h-4 text-white" />}
    </div>
    <span className={`font-medium ${checked ? 'text-primary-700' : 'text-gray-700'}`}>{label}</span>
  </motion.label>
);

// --- Main Component ---

export default function MatchingEnginePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [criteria, setCriteria] = useState<Criteria>({
    interests: [],
    minGpa: 2.5,
    maxBudget: 30000,
    country: 'Any',
  });
  const [results, setResults] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  const handleInterestToggle = (interest: string) => {
    setCriteria(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleCriteriaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCriteria(prev => ({
      ...prev,
      [name]: name === 'minGpa' || name === 'maxBudget' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const matches = await matchingAPI.getMatches(criteria);
      setResults(matches);
      setCurrentStep(5); // Move to results step
    } catch (err: any) {
      setError(err.message || 'Failed to find matches.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(s => (s < 4 ? s + 1 : s));
  const prevStep = () => setCurrentStep(s => (s > 1 ? s - 1 : s));

  const steps = [
    // --- Step 1: Interests ---
    {
      id: 1,
      title: "What are your interests?",
      description: "Select one or more fields you're passionate about.",
      icon: Book,
      content: (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {allInterests.map(interest => (
            <Checkbox
              key={interest}
              id={interest}
              label={interest}
              checked={criteria.interests.includes(interest)}
              onChange={() => handleInterestToggle(interest)}
            />
          ))}
        </div>
      )
    },
    // --- Step 2: Academics ---
    {
      id: 2,
      title: "What are your academics?",
      description: "Provide your current Grade Point Average (GPA).",
      icon: Building,
      content: (
        <div className="space-y-4">
          <label htmlFor="minGpa" className="block text-sm font-medium text-gray-700">
            Your GPA (on a 4.0 scale)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              id="minGpa"
              name="minGpa"
              min="2.0"
              max="4.0"
              step="0.1"
              value={criteria.minGpa}
              onChange={handleCriteriaChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg"
            />
            <span className="text-2xl font-bold text-primary-600 w-20 text-center">{criteria.minGpa.toFixed(1)}</span>
          </div>
        </div>
      )
    },
    // --- Step 3: Financials ---
    {
      id: 3,
      title: "What's your budget?",
      description: "What is the maximum annual tuition you can afford?",
      icon: DollarSign,
      content: (
        <div className="space-y-4">
          <label htmlFor="maxBudget" className="block text-sm font-medium text-gray-700">
            Max Annual Tuition Budget
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              id="maxBudget"
              name="maxBudget"
              min="1000"
              max="80000"
              step="1000"
              value={criteria.maxBudget}
              onChange={handleCriteriaChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg"
            />
            <span className="text-2xl font-bold text-primary-600 w-28 text-center">${criteria.maxBudget.toLocaleString()}</span>
          </div>
        </div>
      )
    },
    // --- Step 4: Location ---
    {
      id: 4,
      title: "Where to?",
      description: "Select your preferred country of study.",
      icon: Flag,
      content: (
        <div className="space-y-4">
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Preferred Country
          </label>
          <select
            id="country"
            name="country"
            value={criteria.country}
            onChange={handleCriteriaChange}
            className="w-full p-4 border-2 border-gray-200 rounded-lg text-lg focus:border-primary-500 focus:ring-primary-500"
          >
            {allCountries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
      )
    },
  ];

  const currentStepData = steps.find(s => s.id === currentStep);
  const progressPercent = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Compass className="w-8 h-8 text-primary-600" />
              <h1 className="text-3xl font-bold text-gray-900">University Matching Engine</h1>
            </div>
            <p className="text-gray-600 mt-1">Find your perfect university and get a personalized plan.</p>
          </div>

          <AnimatePresence mode="wait">
            {/* --- Results View (Step 5) --- */}
            {currentStep === 5 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="p-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="text-primary-600" />
                    Your Personalized Matches
                  </h2>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-sm font-medium text-primary-600 hover:underline"
                  >
                    Start Over
                  </button>
                </div>

                {loading && (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                  </div>
                )}

                {!loading && results.length === 0 && (
                  <div className="text-center py-20">
                    <h3 className="text-xl font-semibold text-gray-700">No matches found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your criteria for a broader search.</p>
                  </div>
                )}

                <div className="space-y-6">
                  {results.map((uni, index) => (
                    <motion.div
                      key={uni.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border-2 border-gray-200 rounded-lg shadow-sm overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-primary-700">{uni.name}</h3>
                            <p className="flex items-center gap-2 text-gray-600 font-medium">
                              <MapPin className="w-4 h-4" /> {uni.country}
                            </p>
                          </div>
                          <span className="text-2xl font-bold text-green-600">
                            ${uni.avg_tuition_per_year.toLocaleString()}
                            <span className="text-sm font-normal text-gray-500">/year</span>
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mt-3">{uni.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-4">
                          {uni.interests.map(interest => (
                            <span key={interest} className="text-xs font-medium bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* --- Roadmap --- */}
                      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-800 uppercase mb-3">Your Roadmap</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-red-600" />
                            <div>
                              <p className="text-xs text-gray-500">Apply By</p>
                              <p className="font-medium text-gray-900">
                                {uni.application_deadline ? new Date(uni.application_deadline).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-500">Tests</p>
                              <p className="font-medium text-gray-900">
                                {uni.required_tests?.join(', ') || 'Check Website'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Link to={uni.program_url || '#'} target="_blank" className="flex items-center gap-2 text-primary-600 hover:underline">
                              <Compass className="w-4 h-4" />
                              <span className="font-medium">Visit Program Page</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              // --- Form Steps (1-4) ---
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                    <span>Step {currentStep} of 4</span>
                    <span>{progressPercent}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <motion.div
                      className="bg-primary-600 h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    />
                  </div>
                </div>

                {/* Step Content */}
                {currentStepData && (
                  <>
                    <StepHeader
                      icon={currentStepData.icon}
                      title={currentStepData.title}
                      description={currentStepData.description}
                    />
                    <div className="mt-6">
                      {currentStepData.content}
                    </div>
                  </>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200">
                  <motion.button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </motion.button>

                  {currentStep < 4 ? (
                    <motion.button
                      onClick={nextStep}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Find Matches
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
