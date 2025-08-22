import React, { useEffect } from 'react';

/**
 * FASE 3: SEO OPTIMIZATION
 * Enhanced SEO component with structured data and meta tags
 */

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image';
  jsonLd?: Record<string, any>;
  noIndex?: boolean;
  noFollow?: boolean;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
}

const EnhancedSEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  jsonLd,
  noIndex = false,
  noFollow = false,
  author,
  publishedTime,
  modifiedTime,
  section,
}) => {
  useEffect(() => {
    // Set document title
    if (title) {
      document.title = `${title} | I Malati dello Sport`;
    }

    // Remove existing meta tags and add new ones
    const existingTags = document.querySelectorAll(
      'meta[data-enhanced-seo="true"], link[data-enhanced-seo="true"]'
    );
    existingTags.forEach(tag => tag.remove());

    const head = document.head;

    // Helper function to create meta tag
    const createMetaTag = (attributes: Record<string, string>) => {
      const meta = document.createElement('meta');
      Object.entries(attributes).forEach(([key, value]) => {
        meta.setAttribute(key, value);
      });
      meta.setAttribute('data-enhanced-seo', 'true');
      head.appendChild(meta);
    };

    // Helper function to create link tag
    const createLinkTag = (attributes: Record<string, string>) => {
      const link = document.createElement('link');
      Object.entries(attributes).forEach(([key, value]) => {
        link.setAttribute(key, value);
      });
      link.setAttribute('data-enhanced-seo', 'true');
      head.appendChild(link);
    };

    // Basic meta tags
    if (description) {
      createMetaTag({ name: 'description', content: description });
    }

    if (keywords.length > 0) {
      createMetaTag({ name: 'keywords', content: keywords.join(', ') });
    }

    if (author) {
      createMetaTag({ name: 'author', content: author });
    }

    // Robots meta tag
    const robotsContent = [];
    if (noIndex) robotsContent.push('noindex');
    if (noFollow) robotsContent.push('nofollow');
    if (robotsContent.length === 0) {
      robotsContent.push('index', 'follow');
    }
    createMetaTag({ name: 'robots', content: robotsContent.join(', ') });

    // Canonical URL
    if (canonical) {
      createLinkTag({ rel: 'canonical', href: canonical });
    }

    // Open Graph tags
    createMetaTag({ property: 'og:site_name', content: 'I Malati dello Sport' });
    createMetaTag({ property: 'og:type', content: ogType });
    
    if (ogTitle || title) {
      createMetaTag({ property: 'og:title', content: ogTitle || title || '' });
    }
    
    if (ogDescription || description) {
      createMetaTag({ property: 'og:description', content: ogDescription || description || '' });
    }
    
    if (ogImage) {
      createMetaTag({ property: 'og:image', content: ogImage });
      createMetaTag({ property: 'og:image:alt', content: ogTitle || title || '' });
      createMetaTag({ property: 'og:image:width', content: '1200' });
      createMetaTag({ property: 'og:image:height', content: '630' });
    }

    createMetaTag({ property: 'og:url', content: canonical || window.location.href });

    // Article specific Open Graph tags
    if (ogType === 'article') {
      if (publishedTime) {
        createMetaTag({ property: 'article:published_time', content: publishedTime });
      }
      if (modifiedTime) {
        createMetaTag({ property: 'article:modified_time', content: modifiedTime });
      }
      if (author) {
        createMetaTag({ property: 'article:author', content: author });
      }
      if (section) {
        createMetaTag({ property: 'article:section', content: section });
      }
      if (keywords.length > 0) {
        keywords.forEach(keyword => {
          createMetaTag({ property: 'article:tag', content: keyword });
        });
      }
    }

    // Twitter Card tags
    createMetaTag({ name: 'twitter:card', content: twitterCard });
    createMetaTag({ name: 'twitter:site', content: '@MalatiDelloSport' });
    
    if (ogTitle || title) {
      createMetaTag({ name: 'twitter:title', content: ogTitle || title || '' });
    }
    
    if (ogDescription || description) {
      createMetaTag({ name: 'twitter:description', content: ogDescription || description || '' });
    }
    
    if (ogImage) {
      createMetaTag({ name: 'twitter:image', content: ogImage });
    }

    // Additional meta tags for better SEO
    createMetaTag({ name: 'language', content: 'it' });
    createMetaTag({ name: 'geo.region', content: 'IT' });
    createMetaTag({ name: 'geo.country', content: 'Italy' });
    createMetaTag({ name: 'theme-color', content: '#ff3036' });
    
    // Mobile optimization
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      createMetaTag({ 
        name: 'viewport', 
        content: 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes' 
      });
    }

    // JSON-LD structured data
    if (jsonLd) {
      const existingJsonLd = document.querySelector('script[type="application/ld+json"][data-enhanced-seo="true"]');
      if (existingJsonLd) {
        existingJsonLd.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-enhanced-seo', 'true');
      script.textContent = JSON.stringify(jsonLd);
      head.appendChild(script);
    }

    // Cleanup function
    return () => {
      const tagsToRemove = document.querySelectorAll(
        'meta[data-enhanced-seo="true"], link[data-enhanced-seo="true"], script[data-enhanced-seo="true"]'
      );
      tagsToRemove.forEach(tag => tag.remove());
    };
  }, [
    title, description, keywords, canonical, ogTitle, ogDescription, ogImage, 
    ogType, twitterCard, jsonLd, noIndex, noFollow, author, publishedTime, 
    modifiedTime, section
  ]);

  return null;
};

// Hook for generating structured data
export const useStructuredData = () => {
  const generateArticleStructuredData = (article: {
    title: string;
    description: string;
    author: string;
    publishedDate: string;
    modifiedDate?: string;
    image?: string;
    category: string;
    url: string;
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.description,
    image: article.image ? [article.image] : [],
    datePublished: article.publishedDate,
    dateModified: article.modifiedDate || article.publishedDate,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'I Malati dello Sport',
      logo: {
        '@type': 'ImageObject',
        url: `${window.location.origin}/assets/images/logo-malati-dello-sport.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
    articleSection: article.category,
    inLanguage: 'it-IT',
  });

  const generateWebsiteStructuredData = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'I Malati dello Sport',
    description: 'La migliore piattaforma italiana per news sportive',
    url: window.location.origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${window.location.origin}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'it-IT',
  });

  const generateOrganizationStructuredData = () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'I Malati dello Sport',
    description: 'Piattaforma italiana di news sportive con copertura completa di calcio, tennis, F1, NBA e NFL',
    url: window.location.origin,
    logo: `${window.location.origin}/assets/images/logo-malati-dello-sport.png`,
    sameAs: [
      'https://twitter.com/MalatiDelloSport',
      'https://facebook.com/MalatiDelloSport',
      'https://instagram.com/MalatiDelloSport',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Italian',
    },
  });

  return {
    generateArticleStructuredData,
    generateWebsiteStructuredData,
    generateOrganizationStructuredData,
  };
};

export default EnhancedSEO;