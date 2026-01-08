/**
 * Documentation Service
 * 
 * Provides utilities for accessing and managing documentation content.
 */

import {
  FeatureDocumentation,
  DocumentationCategory,
  DocumentationLevel,
  getDocumentation,
  getDocumentationByCategory,
  searchDocumentation,
  getRelatedDocumentation,
  getAllFAQs,
  getFAQsByCategory,
} from '@/lib/data/documentation';

export class DocumentationService {
  /**
   * Get documentation by ID
   */
  static getById(id: string): FeatureDocumentation | undefined {
    return getDocumentation(id);
  }

  /**
   * Get all documentation for a category
   */
  static getByCategory(category: DocumentationCategory): FeatureDocumentation[] {
    return getDocumentationByCategory(category);
  }

  /**
   * Search documentation
   */
  static search(query: string): FeatureDocumentation[] {
    return searchDocumentation(query);
  }

  /**
   * Get related documentation
   */
  static getRelated(id: string): FeatureDocumentation[] {
    return getRelatedDocumentation(id);
  }

  /**
   * Get all FAQs
   */
  static getAllFAQs() {
    return getAllFAQs();
  }

  /**
   * Get FAQs by category
   */
  static getFAQsByCategory(category: DocumentationCategory) {
    return getFAQsByCategory(category);
  }

  /**
   * Get quick help text for a feature
   */
  static getQuickHelp(featureId: string): string | undefined {
    const doc = this.getById(featureId);
    return doc?.overview.what;
  }

  /**
   * Get help tooltip content for a feature
   */
  static getTooltipContent(featureId: string): { title?: string; content: string } | undefined {
    const doc = this.getById(featureId);
    if (!doc) return undefined;

    return {
      title: doc.title,
      content: doc.overview.what,
    };
  }

  /**
   * Get step-by-step guide for a feature
   */
  static getStepByStepGuide(featureId: string) {
    const doc = this.getById(featureId);
    if (!doc) return undefined;

    return {
      title: doc.title,
      steps: doc.detailedGuide.steps,
      introduction: doc.detailedGuide.introduction,
    };
  }

  /**
   * Get use cases for a feature
   */
  static getUseCases(featureId: string) {
    const doc = this.getById(featureId);
    return doc?.useCases || [];
  }

  /**
   * Get best practices for a feature
   */
  static getBestPractices(featureId: string) {
    const doc = this.getById(featureId);
    return doc?.bestPractices || [];
  }

  /**
   * Get FAQs for a feature
   */
  static getFAQs(featureId: string) {
    const doc = this.getById(featureId);
    return doc?.faqs || [];
  }
}

// Feature ID constants for easy reference
export const FEATURE_IDS = {
  GETTING_STARTED: 'getting-started-overview',
  PARTIES_OVERVIEW: 'parties-overview',
  PARTIES_ADDING: 'parties-adding',
  INVENTORY_OVERVIEW: 'inventory-overview',
  INVOICES_OVERVIEW: 'invoices-overview',
  PAYMENTS_OVERVIEW: 'payments-overview',
  REPORTS_OVERVIEW: 'reports-overview',
  BUSINESS_OVERVIEW: 'business-overview',
} as const;


