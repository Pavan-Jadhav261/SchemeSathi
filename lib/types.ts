export type CategoryId =
  | "farmers"
  | "students"
  | "women"
  | "healthcare"
  | "employment"
  | "housing"
  | "senior-citizens"
  | "financial-assistance"
  | "entrepreneurs"
  | "disability-support"

export interface Category {
  id: CategoryId
  label: string
  description: string
  icon: string
  schemeCount: number
}

export interface EligibilityCheck {
  label: string
  met: boolean
}

export interface RequiredDocument {
  id: string
  name: string
  reason: string
  required: boolean
}

export interface SchemeSource {
  department: string
  sourceUrl: string
  lastVerified: string
}

export interface Scheme {
  id: string
  name: string
  shortName: string
  category: CategoryId
  department: string
  state: string
  overview: string
  description: string
  benefit: string
  benefitAmount?: string
  eligibility: EligibilityCheck[]
  eligibilitySummary: string[]
  documents: RequiredDocument[]
  officialUrl: string
  applicationSteps: string[]
  lastUpdated: string
  source: SchemeSource
  tags: string[]
  ageGroup?: string
  incomeLimit?: string
  gender?: "all" | "female" | "male"
  occupation?: string[]
}

export interface SchemeMatch extends Scheme {
  matchScore: number
}

export interface UserProfile {
  fullName?: string
  age?: string
  gender?: string
  state?: string
  district?: string
  occupation?: string
  employmentStatus?: string
  occupationType?: "farmer" | "student" | "business-owner" | "employee" | "other"
  annualIncome?: string
  incomeCategory?: string
  bplStatus?: string
  landOwnership?: string
  landSize?: string
  cropType?: string
  irrigation?: string
  educationLevel?: string
  course?: string
  institutionType?: string
  pensionStatus?: string
  query?: string
}

export interface SavedScheme {
  schemeId: string
  savedAt: string
  matchScore?: number
}

export interface RecentSearch {
  id: string
  query: string
  searchedAt: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  suggestions?: string[]
}
