import type { ValidationWorkflow, WorkflowStatus } from '../types/workflows';

type RegistrationRequestSnapshot = {
  id: string;
  fullName: string;
  requestedStatus: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
};

import { getStorageKey } from '../lib/storage/storageUtils';
export const workflowsStorageKey = getStorageKey('validationWorkflows', 'v1');
const registrationStorageKey = getStorageKey('registrationRequests', 'v2');

function readStoredWorkflows(): ValidationWorkflow[] {
  const stored = localStorage.getItem(workflowsStorageKey);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as ValidationWorkflow[];
  } catch {
    return [];
  }
}

function readRegistrationRequests(): RegistrationRequestSnapshot[] {
  const stored = localStorage.getItem(registrationStorageKey);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as RegistrationRequestSnapshot[];
  } catch {
    return [];
  }
}

function mapRegistrationStatus(status: RegistrationRequestSnapshot['status']): WorkflowStatus {
  if (status === 'accepted') return 'accepted';
  if (status === 'rejected') return 'rejected';
  return 'pending';
}

function workflowFromRegistration(request: RegistrationRequestSnapshot): ValidationWorkflow {
  const status = mapRegistrationStatus(request.status);
  return {
    id: `WF-INS-${request.id}`,
    source: 'registration',
    sourceId: request.id,
    title: `Demande d'inscription - ${request.requestedStatus}`,
    requesterName: request.fullName,
    status,
    createdAt: request.createdAt,
    updatedAt: request.createdAt,
    internalNote: '',
    finalDecision: '',
    history: [
      {
        id: `ACT-${request.id}-created`,
        status: 'sent',
        label: 'Demande envoyée depuis la page inscription',
        at: request.createdAt,
        by: 'system',
      },
      {
        id: `ACT-${request.id}-pending`,
        status,
        label: 'En attente de décision humaine',
        at: request.createdAt,
        by: 'system',
      },
    ],
  };
}

export function readWorkflows(): ValidationWorkflow[] {
  const stored = readStoredWorkflows();
  const bySourceId = new Set(stored.map((workflow) => workflow.sourceId).filter(Boolean));
  const fromRegistrations = readRegistrationRequests()
    .filter((request) => !bySourceId.has(request.id))
    .map(workflowFromRegistration);
  return [...stored, ...fromRegistrations];
}

export function saveWorkflows(workflows: ValidationWorkflow[]) {
  localStorage.setItem(workflowsStorageKey, JSON.stringify(workflows));
}
