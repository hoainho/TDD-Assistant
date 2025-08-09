
export interface TDDStructure {
  title: string;
  generalOverview: string;
  coreFeatures: CoreFeature[];
  appendix: Appendix;
}

export interface CoreFeature {
  name: string;
  techSolution: string;
  techNotes: string;
  dataChanges: string;
  diagram: string;
}

export interface Appendix {
  newMetrics: string;
  tools: string;
  compatibility: string;
}

// New types for Implementation Plan Generation
export interface ImplementationPlan {
  featureName: string;
  featuresToImplement: string[];
  frontendSteps: string[];
  backendSteps: string[];
  integrationSteps: string[];
}
