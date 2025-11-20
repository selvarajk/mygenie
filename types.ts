import React from 'react';

export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  REVIEW = 'Review'
}

export interface Circular {
  id: string;
  referenceNumber: string;
  title: string;
  date: string; // ISO string
  regulator: 'RBI' | 'SEBI' | 'IRDAI';
  status: 'New' | 'Processing' | 'Analyzed' | 'Actioned';
  summary?: AISummary;
  originalText?: string; // For the simulation
}

export interface AISummary {
  whatChanged: string[];
  impactedDepartments: Array<{ name: string; impact: string }>;
  deadline: string;
  priority: Priority;
  rawOutput: string; // Full AI text for fallback
}

export interface Task {
  id: string;
  circularId: string;
  title: string;
  assignedTo: string; // Department or User
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}