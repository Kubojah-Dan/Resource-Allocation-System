/**
 * @typedef {'engineer' | 'designer' | 'pm' | 'qa' | 'devops'} ResourceRole
 * @typedef {'critical' | 'high' | 'medium' | 'low'} Priority
 * @typedef {'active' | 'planning' | 'on-hold' | 'completed'} ProjectStatus
 * @typedef {'admin' | 'manager' | 'viewer'} UserRole
 *
 * @typedef {Object} Skill
 * @property {string} name
 * @property {1|2|3|4|5} proficiency  - 1=beginner, 5=expert
 *
 * @typedef {Object} Resource
 * @property {string} id
 * @property {string} name
 * @property {ResourceRole} role
 * @property {string} avatar
 * @property {Skill[]} skills
 * @property {number} hourlyCost
 * @property {number} weeklyCapacity  - hours/week
 * @property {string} department
 * @property {string} location
 * @property {'available' | 'partially-available' | 'unavailable'} availability
 *
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} projectId
 * @property {string} name
 * @property {string[]} requiredSkills
 * @property {number} estimatedHours
 * @property {string[]} dependencies
 * @property {'todo' | 'in-progress' | 'done'} status
 * @property {Priority} priority
 *
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {Priority} priority
 * @property {string} deadline
 * @property {number} budget
 * @property {number} spent
 * @property {string[]} requiredSkills
 * @property {ProjectStatus} status
 * @property {string} description
 * @property {string} color
 *
 * @typedef {Object} Allocation
 * @property {string} id
 * @property {string} resourceId
 * @property {string} taskId
 * @property {string} projectId
 * @property {string} startDate
 * @property {string} endDate
 * @property {number} hoursPerWeek
 *
 * @typedef {Object} Conflict
 * @property {string} id
 * @property {'over-capacity' | 'double-booking' | 'skill-mismatch'} type
 * @property {string} resourceId
 * @property {string[]} allocationIds
 * @property {string} message
 * @property {'error' | 'warning'} severity
 *
 * @typedef {Object} Notification
 * @property {string} id
 * @property {'conflict' | 'deadline' | 'budget' | 'info'} type
 * @property {string} title
 * @property {string} message
 * @property {boolean} read
 * @property {string} createdAt
 *
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {UserRole} role
 * @property {string} avatar
 */

export const SKILL_NAMES = [
  'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'Go',
  'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes',
  'UI Design', 'UX Research', 'Figma', 'Illustration',
  'Project Management', 'Agile/Scrum', 'Risk Management',
  'QA Testing', 'Automation Testing', 'Selenium',
  'DevOps', 'CI/CD', 'Terraform', 'Linux'
];

export const ROLE_LABELS = {
  engineer: 'Engineer',
  designer: 'Designer',
  pm: 'Project Manager',
  qa: 'QA Engineer',
  devops: 'DevOps Engineer',
};

export const PRIORITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export const STATUS_COLORS = {
  active: '#6366f1',
  planning: '#64748b',
  'on-hold': '#f97316',
  completed: '#22c55e',
};
