import type { VerificationPolicy } from "./contracts.js";

export const verificationPolicy: VerificationPolicy = {
  groundingThresholds: {
    1: 0.85,
    2: 0.8,
    3: 0.75,
  },
  crossReferenceThresholds: {
    1: 0.85,
    2: 0.8,
    3: 0.75,
  },
  semanticThresholds: {
    1: 0.85,
    2: 0.8,
    3: 0.75,
  },
  commitAgreementThreshold: 0.67,
  rollbackOnBlockingFailure: true,
};
