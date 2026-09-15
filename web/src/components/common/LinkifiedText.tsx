import React from 'react'
import { ExternalLink } from 'lucide-react'

interface LinkifiedTextProps {
  text: string
  isDarkBg?: boolean
  className?: string
  showIcon?: boolean
}

// Regex matching URLs: http/https/www or common web links
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi

// Characters that often end a sentence and shouldn't be part of the URL
const TRAILING_PUNCTUATION_REGEX = /[.,;:!?)]+$/

export const LinkifiedText: React.FC<LinkifiedTextProps> = ({
  text,
  isDarkBg = false,
  className = '',
  showIcon = true,
}) => {
  if (!text) return null

  // Split text by URL while capturing matches
  const parts = text.split(URL_REGEX)

  return (
    <span className={`whitespace-pre-wrap ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null

        if (part.match(/^(https?:\/\/|www\.)/i)) {
          let cleanUrl = part
          let trailingPunctuation = ''

          const punctMatch = part.match(TRAILING_PUNCTUATION_REGEX)
          if (punctMatch) {
            trailingPunctuation = punctMatch[0]
            cleanUrl = part.slice(0, -trailingPunctuation.length)
          }

          const href = cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')
            ? cleanUrl
            : `https://${cleanUrl}`

          return (
            <React.Fragment key={index}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`inline-flex items-center gap-1 font-semibold underline underline-offset-2 break-all transition-all hover:scale-[1.01] ${
                  isDarkBg
                    ? 'text-blue-300 hover:text-blue-100 decoration-blue-400/60 hover:decoration-blue-200'
                    : 'text-[#1f29de] hover:text-[#151cb0] decoration-[#1f29de]/50 hover:decoration-[#1f29de]'
                }`}
                title={`Abrir link: ${href}`}
              >
                <span>{cleanUrl}</span>
                {showIcon && (
                  <ExternalLink size={12} className="inline-block shrink-0 opacity-80" />
                )}
              </a>
              {trailingPunctuation}
            </React.Fragment>
          )
        }

        return <span key={index}>{part}</span>
      })}
    </span>
  )
}
