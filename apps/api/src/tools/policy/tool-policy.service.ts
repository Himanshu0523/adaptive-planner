import { Injectable } from '@nestjs/common';
import { RiskLevel } from '@adaptive-planner/contracts';

export interface PolicyCheckResult {
  allowed: boolean;
  requiresApproval: boolean;
  reason: string;
}

@Injectable()
export class ToolPolicyService {
  /**
   * Enforces server-side risk and security policy on proposed tool actions.
   * Model cannot grant itself permissions or bypass human approval.
   */
  evaluateToolPolicy(riskLevel: RiskLevel, hasUserPreApproved = false): PolicyCheckResult {
    switch (riskLevel) {
      case 'READ_ONLY':
        return {
          allowed: true,
          requiresApproval: false,
          reason: 'Read-only action allowed with granted connection scope',
        };

      case 'LOW_RISK_INTERNAL_WRITE':
        return {
          allowed: true,
          requiresApproval: false,
          reason: 'Low-risk internal write allowed under workspace policy',
        };

      case 'EXTERNAL_WRITE':
        if (hasUserPreApproved) {
          return {
            allowed: true,
            requiresApproval: false,
            reason: 'External write allowed via explicit user pre-approval',
          };
        }
        return {
          allowed: true,
          requiresApproval: true,
          reason: 'External write requires explicit user approval before execution',
        };

      case 'SENSITIVE_ACTION':
        return {
          allowed: true,
          requiresApproval: true,
          reason: 'Sensitive action (e.g. sending email, modifying external code) requires human confirmation',
        };

      case 'HIGH_IMPACT_ACTION':
        return {
          allowed: false,
          requiresApproval: true,
          reason: 'High-impact irreversible action blocked by default policy',
        };

      default:
        return {
          allowed: false,
          requiresApproval: true,
          reason: 'Unknown risk level rejected by fail-closed policy',
        };
    }
  }
}
