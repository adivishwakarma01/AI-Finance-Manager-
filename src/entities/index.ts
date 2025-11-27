/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: financefaqs
 * Interface for FinanceFAQs
 */
export interface FinanceFAQs {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  question?: string;
  /** @wixFieldType text */
  answer?: string;
  /** @wixFieldType text */
  category?: string;
  /** @wixFieldType text */
  keywords?: string;
  /** @wixFieldType url */
  relatedLink?: string;
  /** @wixFieldType boolean */
  isFeatured?: boolean;
}


/**
 * Collection ID: financialgoals
 * Interface for FinancialGoals
 */
export interface FinancialGoals {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  goalName?: string;
  /** @wixFieldType number */
  targetAmount?: number;
  /** @wixFieldType number */
  currentProgress?: number;
  /** @wixFieldType date */
  deadline?: Date | string;
  /** @wixFieldType text */
  goalDescription?: string;
  /** @wixFieldType boolean */
  isAchieved?: boolean;
  /** @wixFieldType text */
  priorityLevel?: string;
}


/**
 * Collection ID: investmentsuggestions
 * Interface for InvestmentSuggestions
 */
export interface InvestmentSuggestions {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  investmentName?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType text */
  riskLevel?: string;
  /** @wixFieldType text */
  potentialReturns?: string;
  /** @wixFieldType text */
  investmentType?: string;
  /** @wixFieldType number */
  minimumInvestment?: number;
  /** @wixFieldType url */
  learnMoreUrl?: string;
  /** @wixFieldType image */
  investmentImage?: string;
}


/**
 * Collection ID: transactions
 * Interface for Transactions
 */
export interface Transactions {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType number */
  amount?: number;
  /** @wixFieldType text */
  type?: string;
  /** @wixFieldType date */
  date?: Date | string;
  /** @wixFieldType text */
  category?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType boolean */
  isRecurring?: boolean;
  /** @wixFieldType text */
  notes?: string;
}
