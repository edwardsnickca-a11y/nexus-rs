export const AAR_LABELS = ['Effective', 'Generally Effective', 'Needs Improvement', 'Not Observed']

export const ROLE_DIMENSIONS = {
  remote_sensing_coordinator: [
    'Regional prioritization',
    'Asset allocation',
    'Coordination with State J3',
    'Partner-agency coordination',
    'Approval of collection plans',
    'Management of unmet needs',
    'Protection of higher-priority missions',
    'Operational period transition',
    'Shared situational awareness',
  ],
  remote_sensing_manager: [
    'Mission execution',
    'Sortie management',
    'Retasking discipline',
    'Gain-loss assessment',
    'Airspace and timing coordination',
    'Platform constraint awareness',
    'Protection of approved missions',
    'Communication with the Coordinator and Collection Manager',
    'Execution risk management',
  ],
  collection_manager: [
    'Requirement validation',
    'WHAT / WHERE / WHEN / WHY / WHO completeness',
    'PIR / EEI linkage',
    'NAI development',
    'Effects-based collection requests',
    'Existing-source checks',
    'Organic asset suitability',
    'Requirement prioritization',
    'Duplicate and conflicting requirement management',
    'Collection result evaluation',
    'Recollection decisions',
  ],
  upad_lno: [
    'Production prioritization',
    'Product burden awareness',
    'PAD architecture management',
    'Analyst assignment',
    'Timeliness',
    'Product quality',
    'Dissemination method',
    'Customer receipt verification',
    'Customer feedback',
    'Identification of remaining information gaps',
  ],
}

export const ROLE_NAMES = {
  remote_sensing_coordinator: 'Remote Sensing Coordinator',
  remote_sensing_manager: 'Remote Sensing Manager',
  collection_manager: 'Collection Manager',
  upad_lno: 'UPAD LNO',
}

export const AUTHORITY_MODEL = [
  {
    role: 'State J3',
    authority: 'Allocates or recalls state-controlled assets and approves additional or different asset support.',
  },
  {
    role: 'Remote Sensing Coordinator',
    authority: 'Regionally allocates approved assets, approves the collection plan, coordinates unmet needs and partner support, and requests additional capability through State J3.',
  },
  {
    role: 'Remote Sensing Manager',
    authority: 'Executes approved missions, manages sortie timing and operational retasking, and conducts gain-loss assessment before major retasking.',
  },
  {
    role: 'Collection Manager',
    authority: 'Develops and validates collection requirements, prioritizes requirements, matches effects to capabilities, and evaluates whether collection answered the requirement.',
  },
  {
    role: 'UPAD LNO',
    authority: 'Manages processing, assessment, production, dissemination, and customer verification.',
  },
]

export const REQUIREMENT_RESULTS = [
  'Satisfied',
  'Partially Satisfied',
  'Unsatisfied',
  'Cancelled',
  'Superseded',
  'Still Open',
]
