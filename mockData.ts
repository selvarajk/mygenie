import { Circular, Priority, Task, TaskStatus } from "./types";

export const MOCK_CIRCULARS: Circular[] = [
  {
    id: 'c1',
    referenceNumber: 'RBI/2024-25/42',
    title: 'Master Direction – Reserve Bank of India (NBFC – Scale Based Regulation) Directions, 2023',
    date: '2024-02-15T10:00:00Z',
    regulator: 'RBI',
    status: 'Analyzed',
    summary: {
      whatChanged: [
        'Revised capital adequacy norms for Upper Layer NBFCs.',
        'New governance guidelines regarding Chief Risk Officer tenure.',
        'Updated disclosure requirements for annual financial statements.'
      ],
      impactedDepartments: [
        { name: 'Risk Management', impact: 'Update CRO policy and tenure tracking.' },
        { name: 'Finance', impact: 'Adjust capital calculation models.' }
      ],
      deadline: '2024-04-01',
      priority: Priority.HIGH,
      rawOutput: ''
    }
  },
  {
    id: 'c2',
    referenceNumber: 'SEBI/HO/MIRSD/2024/11',
    title: 'Streamlining of onboarding process of FPIs',
    date: '2024-03-01T14:30:00Z',
    regulator: 'SEBI',
    status: 'New',
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    circularId: 'c1',
    title: 'Update Capital Adequacy Policy Document',
    assignedTo: 'Finance Team',
    dueDate: '2024-03-25',
    priority: Priority.HIGH,
    status: TaskStatus.IN_PROGRESS
  },
  {
    id: 't2',
    circularId: 'c1',
    title: 'Review CRO Appointment Terms',
    assignedTo: 'HR & Legal',
    dueDate: '2024-03-20',
    priority: Priority.MEDIUM,
    status: TaskStatus.COMPLETED
  }
];