import { useState, useEffect } from 'react'
import { 
  MessageCircle, Users, Award, Star, Send, Search, 
  Clock, Eye, ThumbsUp, MessageSquare, User
} from 'lucide-react'

interface Mentor {
  id: string
  name: string
  avatar?: string
  university: string
  graduation_year: number
  major: string
  current_position?: string
  company?: string
  location?: string
  bio: string
  expertise: string[]
  languages: string[]
  response_rate: number
  response_time: string
  total_questions: number
  satisfaction_score: number
  badges: string[]
  is_alumni: boolean
  international_student?: boolean
  first_generation?: boolean
}

interface Question {
  id: string
  title: string
  content: string
  author: string
  mentor_id: string
  mentor_name: string
  created_at: string
  status: 'pending' | 'answered' | 'closed'
  views: number
  upvotes: number
  answers: number
  tags: string[]
}

interface MentorshipSystemProps {
  currentUser?: {
    id: string
    name: string
    university?: string
    major?: string
    international_student?: boolean
    interests?: string[]
  }
}

export default function MentorshipSystem({ currentUser }: MentorshipSystemProps) {
  const [activeTab, setActiveTab] = useState<'mentors' | 'questions'>('mentors')
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterExpertise, setFilterExpertise] = useState('')
  const [loading, setLoading] = useState(true)
  const [questionForm, setQuestionForm] = useState({ title: '', content: '' })
  const [showQuestionForm, setShowQuestionForm] = useState(false)

  useEffect(() => {
    // Simulate loading mentors and questions
    const loadMentors = async () => {
      setLoading(true)
      // Mock data - in real app, this would come from API
      const mockMentors: Mentor[] = [
        {
          id: '1',
          name: 'Sarah Chen',
          university: 'Stanford University',
          graduation_year: 2020,
          major: 'Computer Science',
          current_position: 'Software Engineer',
          company: 'Google',
          location: 'San Francisco, CA',
          bio: 'Passionate about helping international students navigate tech careers. Happy to share insights about Silicon Valley!',
          expertise: ['Career Development', 'Tech Industry', 'Internships', 'Resume Building'],
          languages: ['English', 'Mandarin'],
          response_rate: 95,
          response_time: '2 hours',
          total_questions: 127,
          satisfaction_score: 4.8,
          badges: ['Top Mentor', 'Quick Responder', 'Career Expert'],
          is_alumni: true,
          international_student: true
        },
        {
          id: '2',
          name: 'Michael Rodriguez',
          university: 'MIT',
          graduation_year: 2019,
          major: 'Mechanical Engineering',
          current_position: 'Product Manager',
          company: 'Tesla',
          location: 'Austin, TX',
          bio: 'First-generation college grad who loves helping students with engineering careers and graduate school applications.',
          expertise: ['Engineering Careers', 'Graduate School', 'Research', 'First Gen Support'],
          languages: ['English', 'Spanish'],
          response_rate: 88,
          response_time: '4 hours',
          total_questions: 89,
          satisfaction_score: 4.7,
          badges: ['First Gen Advocate', 'Grad School Expert'],
          is_alumni: true,
          first_generation: true
        },
        {
          id: '3',
          name: 'Emily Johnson',
          university: 'Harvard University',
          graduation_year: 2021,
          major: 'Economics',
          current_position: 'Investment Banking Analyst',
          company: 'Goldman Sachs',
          location: 'New York, NY',
          bio: 'Recent grad helping students break into finance. Can share tips on networking, interviews, and internships.',
          expertise: ['Finance Careers', 'Investment Banking', 'Networking', 'Interview Prep'],
          languages: ['English', 'French'],
          response_rate: 92,
          response_time: '3 hours',
          total_questions: 156,
          satisfaction_score: 4.9,
          badges: ['Finance Expert', 'Top Mentor', 'Interview Coach'],
          is_alumni: true
        }
      ]

      const mockQuestions: Question[] = [
        {
          id: '1',
          title: 'How to stand out in tech internship applications?',
          content: 'I am a sophomore CS student applying for summer internships. What makes candidates stand out?',
          author: 'Alex Kumar',
          mentor_id: '1',
          mentor_name: 'Sarah Chen',
          created_at: '2024-01-15',
          status: 'answered',
          views: 234,
          upvotes: 15,
          answers: 3,
          tags: ['internships', 'tech', 'career']
        },
        {
          id: '2',
          title: 'Is it worth pursuing a Master\'s degree right after undergrad?',
          content: 'I have offers for both jobs and MS programs. Should I work first or continue education?',
          author: 'Maria Garcia',
          mentor_id: '2',
          mentor_name: 'Michael Rodriguez',
          created_at: '2024-01-14',
          status: 'pending',
          views: 156,
          upvotes: 8,
          answers: 1,
          tags: ['graduate-school', 'career-decision']
        }
      ]

      setMentors(mockMentors)
      setQuestions(mockQuestions)
      setLoading(false)
    }

    loadMentors()
  }, [])

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.major.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesExpertise = !filterExpertise || mentor.expertise.includes(filterExpertise)
    return matchesSearch && matchesExpertise
  })

  const handleAskQuestion = async () => {
    if (!questionForm.title || !questionForm.content) return
    
    // Simulate asking a question
    const newQuestion: Question = {
      id: Date.now().toString(),
      title: questionForm.title,
      content: questionForm.content,
      author: currentUser?.name || 'Anonymous',
      mentor_id: selectedMentor?.id || '',
      mentor_name: selectedMentor?.name || 'Any Mentor',
      created_at: new Date().toISOString().split('T')[0],
      status: 'pending',
      views: 0,
      upvotes: 0,
      answers: 0,
      tags: []
    }

    setQuestions([newQuestion, ...questions])
    setQuestionForm({ title: '', content: '' })
    setShowQuestionForm(false)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading mentorship community...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6" />
            <div>
              <h3 className="text-lg font-bold">Peer Mentorship Network</h3>
              <p className="text-blue-100 text-sm">Connect with alumni and current students</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold">{mentors.length}</div>
              <div className="text-blue-100 text-sm">Active Mentors</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{questions.length}</div>
              <div className="text-blue-100 text-sm">Questions Answered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('mentors')}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'mentors'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-4 w-4" />
            Find Mentors
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'questions'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Q&A Community
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'mentors' ? (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search mentors by name, university, or major..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterExpertise}
                onChange={(e) => setFilterExpertise(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Expertise</option>
                <option value="Career Development">Career Development</option>
                <option value="Tech Industry">Tech Industry</option>
                <option value="Finance Careers">Finance Careers</option>
                <option value="Graduate School">Graduate School</option>
                <option value="First Gen Support">First Gen Support</option>
              </select>
            </div>

            {/* Mentors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMentors.map((mentor) => (
                <div key={mentor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {mentor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{mentor.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{mentor.satisfaction_score}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {mentor.major} • {mentor.university} • Class of {mentor.graduation_year}
                      </div>
                      
                      {mentor.current_position && (
                        <div className="text-sm text-gray-700 mb-2">
                          <strong>{mentor.current_position}</strong> at {mentor.company}
                        </div>
                      )}

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{mentor.bio}</p>

                      {/* Expertise Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {mentor.expertise.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                        {mentor.expertise.length > 3 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                            +{mentor.expertise.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Badges */}
                      {mentor.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {mentor.badges.slice(0, 2).map((badge, idx) => (
                            <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-full">
                              <Award className="h-3 w-3" />
                              {badge}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {mentor.total_questions} questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {mentor.response_time}
                          </span>
                        </div>
                        <span>{mentor.response_rate}% response rate</span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedMentor(mentor)
                          setShowQuestionForm(true)
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Ask Question
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Ask Question Button */}
            <button
              onClick={() => setShowQuestionForm(true)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              Ask a Question
            </button>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 flex-1">{question.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      question.status === 'answered' ? 'bg-green-100 text-green-700' :
                      question.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {question.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{question.content}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <span>Asked by {question.author}</span>
                      <span>•</span>
                      <span>Answered by {question.mentor_name}</span>
                      <span>•</span>
                      <span>{question.created_at}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {question.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {question.upvotes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {question.answers}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Form Modal */}
        {showQuestionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedMentor ? `Ask ${selectedMentor.name}` : 'Ask the Community'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowQuestionForm(false)
                      setSelectedMentor(null)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Title
                  </label>
                  <input
                    type="text"
                    value={questionForm.title}
                    onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                    placeholder="What would you like to know?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Details
                  </label>
                  <textarea
                    value={questionForm.content}
                    onChange={(e) => setQuestionForm({ ...questionForm, content: e.target.value })}
                    placeholder="Provide more context about your question..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {selectedMentor && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <User className="h-4 w-4" />
                      <span>This question will be directed to <strong>{selectedMentor.name}</strong></span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowQuestionForm(false)
                    setSelectedMentor(null)
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAskQuestion}
                  disabled={!questionForm.title || !questionForm.content}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Send Question
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
