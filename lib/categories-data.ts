import type { Category } from "./types"

export const categories: Category[] = [
  {
    id: "farmers",
    label: "Farmers",
    description: "Income support, crop insurance and irrigation schemes for cultivators.",
    icon: "Wheat",
    schemeCount: 12,
  },
  {
    id: "students",
    label: "Students",
    description: "Scholarships and education support for school and college students.",
    icon: "GraduationCap",
    schemeCount: 18,
  },
  {
    id: "women",
    label: "Women",
    description: "Savings, safety and empowerment schemes for women and girls.",
    icon: "Users",
    schemeCount: 9,
  },
  {
    id: "healthcare",
    label: "Healthcare",
    description: "Health insurance and medical assistance for families.",
    icon: "HeartPulse",
    schemeCount: 7,
  },
  {
    id: "employment",
    label: "Employment",
    description: "Skilling, wage support and job guarantee programmes.",
    icon: "Briefcase",
    schemeCount: 10,
  },
  {
    id: "housing",
    label: "Housing",
    description: "Affordable housing and home-loan subsidy schemes.",
    icon: "Home",
    schemeCount: 6,
  },
  {
    id: "senior-citizens",
    label: "Senior Citizens",
    description: "Pensions and income security for elderly citizens.",
    icon: "Users2",
    schemeCount: 8,
  },
  {
    id: "financial-assistance",
    label: "Financial Assistance",
    description: "Savings, insurance and credit-linked support schemes.",
    icon: "PiggyBank",
    schemeCount: 14,
  },
  {
    id: "entrepreneurs",
    label: "Entrepreneurs",
    description: "Collateral-free loans and support for small businesses.",
    icon: "Rocket",
    schemeCount: 11,
  },
  {
    id: "disability-support",
    label: "Disability Support",
    description: "Assistance and aids for persons with disabilities.",
    icon: "Accessibility",
    schemeCount: 5,
  },
]

export function getCategoryById(id: string) {
  return categories.find((c) => c.id === id)
}
