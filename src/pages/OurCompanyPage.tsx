import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import AnimatedBackground from '../components/AnimatedBackground'
import { AboutContent } from './AboutPage'
import { CareersContent } from './CareersPage'
import { ContactContent, ContactFormData } from './ContactPage'
import { PolicyContent } from './PolicyPage'
import { BookOpen, ArrowRight } from 'lucide-react'

type TabId = 'about' | 'join' | 'contact' | 'policy' | 'docs'

interface OurCompanyPageProps {
  initialTab?: TabId
}

const COMPANY_TABS: { id: TabId; label: string }[] = [
  { id: 'about', label: 'About Us' },
  { id: 'join', label: 'Join Us' },
  { id: 'contact', label: 'Contact Us' },
  { id: 'policy', label: 'Privacy Policy' },
  { id: 'docs', label: 'Our Docs' },
]

interface DocEntry {
  id: string
  title: string
  slug: string
  description: string
  category: string
  updated_at: string
}

const DOCS_DATA: DocEntry[] = [
  {
    id: '1',
    title: 'Getting Started Guide',
    slug: 'getting-started',
    description: 'Complete guide to getting started with AcademOra platform. Learn how to navigate the interface, create your profile, and start exploring academic resources.',
    category: 'User Guide',
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'API Documentation',
    slug: 'api-docs',
    description: 'Technical documentation for AcademOra API endpoints. Learn how to integrate with our RESTful API and access programmatic features.',
    category: 'Technical',
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Feature Overview',
    slug: 'feature-overview',
    description: 'Comprehensive overview of all AcademOra features including matching algorithms, comparison tools, and academic resources.',
    category: 'Features',
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'University Matching System',
    slug: 'university-matching',
    description: 'Detailed explanation of our university matching algorithm and how to use it effectively to find your perfect academic fit.',
    category: 'Features',
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Study Abroad Guide',
    slug: 'study-abroad-guide',
    description: 'Everything you need to know about studying abroad, from application procedures to cultural adaptation tips.',
    category: 'User Guide',
    updated_at: new Date().toISOString(),
  },
]

export default function OurCompanyPage({ initialTab = 'about' }: OurCompanyPageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromQuery = useMemo(() => {
    const value = searchParams.get('tab') as TabId | null
    return COMPANY_TABS.some(tab => tab.id === value) ? value : null
  }, [searchParams])

  const [activeTab, setActiveTab] = useState<TabId>(tabFromQuery ?? initialTab)
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  useEffect(() => {
    const nextTab = tabFromQuery ?? initialTab
    if (activeTab !== nextTab) {
      setActiveTab(nextTab)
    }
  }, [tabFromQuery, initialTab])

  useEffect(() => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev)
      if (activeTab === 'about') {
        params.delete('tab')
      } else {
        params.set('tab', activeTab)
      }
      return params
    }, { replace: true })
  }, [activeTab, setSearchParams])

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
  }

  const handleContactChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setContactForm(prev => ({ ...prev, [name]: value }))
  }

  const handleContactSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    alert('Thank you for your message! We will get back to you soon.')
    setContactForm({ name: '', email: '', subject: '', message: '' })
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'about':
        return <AboutContent />
      case 'join':
        return <CareersContent />
      case 'contact':
        return (
          <ContactContent
            formData={contactForm}
            onChange={handleContactChange}
            onSubmit={handleContactSubmit}
          />
        )
      case 'policy':
        return <PolicyContent />
      case 'docs':
        return <DocsTabContent docs={DOCS_DATA} />
      default:
        return <AboutContent />
    }
  }

  return (
    <div className="relative bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] min-h-screen py-20 overflow-hidden">
      <SEO title="Our Company - AcademOra" description="Explore the story behind AcademOra — who we are, how we work, and the resources we offer." />
      <AnimatedBackground
        colors={['var(--chart-color-2)', 'var(--chart-color-5)', 'var(--chart-color-4)', 'var(--chart-color-1)']}
        orbCount={4}
        duration={18}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="text-sm font-medium text-white/80">Inside AcademOra</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
            Discover Our Company
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Learn about our mission, meet the team, explore upcoming opportunities, get in touch, review our policies, and dive into documentation—all in one place.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-gray-900/40 border border-gray-800/60 backdrop-blur-sm rounded-2xl p-2 flex flex-wrap justify-center gap-2 mb-12"
        >
          {COMPANY_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab.id === activeTab
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        <div className="space-y-12">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  )
}

function DocsTabContent({ docs }: { docs: DocEntry[] }) {
  const formattedDocs = useMemo(() => {
    return docs.map(doc => ({
      ...doc,
      updatedLabel: new Date(doc.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    }))
  }, [docs])

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4">
          <BookOpen className="w-4 h-4 text-blue-200" />
          <span className="text-sm font-medium text-blue-100">Documentation</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-400 bg-clip-text text-transparent">
          Knowledge Library
        </h2>
        <p className="text-gray-300 max-w-3xl mx-auto">
          Access guides, tutorials, and technical notes to help you make the most of AcademOra.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {formattedDocs.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            whileHover={{ y: -8 }}
            className="group bg-gradient-to-br from-gray-800/50 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-blue-400/70 transition-all duration-300 overflow-hidden"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-blue-200 bg-blue-500/20 px-3 py-1 rounded-full">
                  {doc.category}
                </span>
                <span className="text-xs text-gray-400">Updated {doc.updatedLabel}</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-200 transition-colors">
                {doc.title}
              </h3>
              <p className="text-gray-400 flex-1 leading-relaxed">
                {doc.description}
              </p>
              <motion.a
                href={`/docs/${doc.slug}`}
                className="mt-6 inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 font-semibold"
                whileHover={{ x: 4 }}
              >
                Read Doc
                <ArrowRight className="h-4 w-4" />
              </motion.a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

