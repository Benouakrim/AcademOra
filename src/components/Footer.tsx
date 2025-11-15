import { Link } from 'react-router-dom'
import { GraduationCap, Mail, Github, Twitter, Linkedin, Sparkles, Heart } from 'lucide-react'
import ThemeModeToggle from './ThemeModeToggle'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-[var(--color-bg-secondary)] via-[var(--color-bg-primary)] to-[var(--color-accent-secondary)]/20 text-[var(--color-text-primary)] mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  boxShadow: ["0 0 20px var(--color-accent-secondary)/50", "0 0 40px var(--color-accent-secondary)/80", "0 0 20px var(--color-accent-secondary)/50"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <GraduationCap className="h-10 w-10 text-[var(--color-accent-secondary)] group-hover:text-[var(--color-accent-primary)] transition-colors" />
              </motion.div>
              <span className="text-3xl font-black bg-gradient-to-r from-[var(--color-accent-secondary)] via-[var(--color-accent-primary)] to-[var(--heatmap-good)] bg-clip-text text-transparent">
                AcademOra
              </span>
            </Link>
            <p className="text-[var(--color-text-tertiary)] text-sm leading-relaxed">
              Your gateway to finding the perfect university match. Connect with institutions worldwide and discover your academic future.
            </p>
            <div className="flex space-x-4">
              {[
                { href: "https://github.com", icon: Github, label: "GitHub" },
                { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
                { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-text-tertiary)] hover:text-[var(--color-accent-secondary)] transition-colors p-2 bg-[var(--color-interactive-bg)] backdrop-blur-sm rounded-lg border border-[var(--color-border-primary)] hover:bg-[var(--color-accent-secondary)]/20 hover:border-[var(--color-accent-secondary)]/30"
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] bg-clip-text text-transparent">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/blog", label: "Read" },
                { to: "/orientation", label: "Explore" },
                { to: "/matching-engine", label: t('common.matcher') },
                { to: "/about", label: "About Us" },
                { to: "/careers", label: "Careers" },
                { to: "/pricing", label: "Pricing" }
              ].map((link, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 + (index * 0.05) }}
                >
                  <Link
                    to={link.to}
                    className="text-[var(--color-text-tertiary)] hover:text-[var(--color-accent-secondary)] transition-all duration-300 text-sm flex items-center gap-2 group"
                  >
                    <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-[var(--heatmap-good)] to-[var(--heatmap-best)] bg-clip-text text-transparent">
              Resources
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/contact", label: "Contact Us" },
                { to: "/policy", label: "Privacy Policy" },
                { to: "/our-company?tab=docs", label: "Documentation" },
                { to: "/compare", label: "Compare Universities" }
              ].map((link, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + (index * 0.05) }}
                >
                  <Link
                    to={link.to}
                    className="text-[var(--color-text-tertiary)] hover:text-[var(--heatmap-good)] transition-all duration-300 text-sm flex items-center gap-2 group"
                  >
                    <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-[var(--heatmap-best)] to-[var(--ambient-color-3)] bg-clip-text text-transparent">
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <motion.li 
                className="flex items-start space-x-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <motion.div
                  animate={{ 
                    boxShadow: ["0 0 20px var(--heatmap-best)/50", "0 0 40px var(--heatmap-best)/80", "0 0 20px var(--heatmap-best)/50"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Mail className="h-5 w-5 text-[var(--heatmap-best)] mt-0.5 flex-shrink-0" />
                </motion.div>
                <a
                  href="mailto:contact@academora.com"
                  className="text-[var(--color-text-tertiary)] hover:text-[var(--heatmap-best)] transition-colors text-sm"
                >
                  contact@academora.com
                </a>
              </motion.li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          className="border-t border-[var(--color-border-secondary)] mt-12 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-[var(--color-text-tertiary)] text-sm flex items-center gap-2">
              © {currentYear} AcademOra. All rights reserved.
            </p>
            <motion.div 
              className="text-[var(--color-text-tertiary)] text-xs flex items-center gap-2"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Made with 
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-[var(--heatmap-risk)] fill-current" />
              </motion.div>
              for students worldwide
            </motion.div>
            {/* Public theme mode toggle in footer */}
            <ThemeModeToggle className="ml-0 md:ml-4" />
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
