import { describe, it, expect } from 'vitest';
import {
  validateWorkflow,
  evaluateWorkflow,
  STARTER_SERIALIZABLE_WORKFLOW,
} from '@/services/workflow';
import type { SerializableWorkflow } from '@/types/workflow';

describe('Workflow Validation Engine', () => {
  it('validates standard starter workflow as completely valid', () => {
    const result = validateWorkflow(STARTER_SERIALIZABLE_WORKFLOW);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.hasInput).toBe(true);
    expect(result.hasModel).toBe(true);
    expect(result.hasConditionOrDecision).toBe(true);
    expect(result.hasAction).toBe(true);
    expect(result.hasPathInputToAction).toBe(true);
  });

  it('rejects workflow missing an input node', () => {
    const invalidWorkflow: SerializableWorkflow = {
      ...STARTER_SERIALIZABLE_WORKFLOW,
      nodes: STARTER_SERIALIZABLE_WORKFLOW.nodes.filter((n) => n.type !== 'input'),
    };
    const result = validateWorkflow(invalidWorkflow);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Input node'))).toBe(true);
  });

  it('rejects workflow missing an action node', () => {
    const invalidWorkflow: SerializableWorkflow = {
      ...STARTER_SERIALIZABLE_WORKFLOW,
      nodes: STARTER_SERIALIZABLE_WORKFLOW.nodes.filter((n) => n.type !== 'action'),
    };
    const result = validateWorkflow(invalidWorkflow);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Safety Action node'))).toBe(true);
  });

  it('rejects workflow when no path connects input to action', () => {
    const disconnectedWorkflow: SerializableWorkflow = {
      ...STARTER_SERIALIZABLE_WORKFLOW,
      connections: [], // remove all connections
    };
    const result = validateWorkflow(disconnectedWorkflow);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('No connected pipeline path'))).toBe(true);
  });

  it('detects cycles in workflow connections', () => {
    const cyclicWorkflow: SerializableWorkflow = {
      ...STARTER_SERIALIZABLE_WORKFLOW,
      connections: [
        ...STARTER_SERIALIZABLE_WORKFLOW.connections,
        {
          id: 'edge-cycle',
          source: 'node-action-alert-01',
          target: 'node-camera-01',
          sourceHandle: 'output',
          targetHandle: 'input',
        },
      ],
    };
    const result = validateWorkflow(cyclicWorkflow);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('cycle loop'))).toBe(true);
  });
});

describe('Workflow Evaluation Engine', () => {
  it('correctly evaluates helmet detection as SAFE branch', () => {
    const result = evaluateWorkflow(STARTER_SERIALIZABLE_WORKFLOW, [
      { className: 'helmet', confidence: 0.94 },
    ]);

    expect(result.conditionResult).toBe('YES');
    expect(result.safetyDecision).toBe('SAFE');
    expect(result.explanation).toContain('branch YES → SAFE');
  });

  it('correctly evaluates missing helmet as UNSAFE branch triggering alert', () => {
    const result = evaluateWorkflow(STARTER_SERIALIZABLE_WORKFLOW, [
      { className: 'no_helmet', confidence: 0.92 },
    ]);

    expect(result.conditionResult).toBe('NO');
    expect(result.safetyDecision).toBe('UNSAFE');
    expect(result.explanation).toContain('branch NO → UNSAFE');
    expect(result.actionTriggered).toMatch(/ALERT/i);
  });
});
