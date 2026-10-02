export const DEMO_MODE_DATA = {
  organizations: [
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Sinotex Industries - Textile Division' },
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Nairobi Textiles Ltd' },
    { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Bangalore Precision Machinery' },
  ],
  
  equipment: [
    {
      id: 'eq-001',
      name: 'Compressor AX-200',
      serialNumber: 'SN-20230415-001',
      model: 'Rotair AX-200',
      manufacturer: 'Rotair',
      status: 'operational',
    },
    {
      id: 'eq-002',
      name: 'Main Drive Motor',
      serialNumber: 'SN-20230515-002',
      model: 'EF-7.5kW',
      manufacturer: 'ABB',
      status: 'degraded',
    },
    {
      id: 'eq-003',
      name: 'Weaving Loom Unit 3',
      serialNumber: 'SN-20220920-045',
      model: 'Tsudakoma ZAX',
      manufacturer: 'Tsudakoma',
      status: 'operational',
    },
  ],

  failures: [
    {
      id: 'fail-001',
      equipmentId: 'eq-001',
      description: 'High-pitched noise from compressor, unusual vibration detected',
      severity: 'high',
      status: 'open',
    },
  ],

  diagnosis: {
    defect_label: 'Ball bearing degradation with inner race spalling',
    failure_category: 'Bearing Degradation',
    severity: 'high',
    confidence: 0.92,
    recommended_part: 'Ball Bearing 6205-2RS',
    reasoning_brief: 'Inner race shows characteristic spalling pattern consistent with fatigue failure. Typical lead time: 7 days.',
  },

  parts: [
    { id: 'part-001', name: 'Ball Bearing 6205-2RS', sku: 'BBR-6205', leadTimeDays: 7 },
    { id: 'part-002', name: 'Shaft Seal', sku: 'SEAL-305', leadTimeDays: 5 },
    { id: 'part-003', name: 'Timing Belt T-1600', sku: 'BELT-T1600', leadTimeDays: 3 },
  ],

  workflowStages: ['submitted', 'analysis', 'inspection', 'validation', 'sourcing', 'delivery', 'closed'],

  analyticsSnapshot: {
    topFailingEquipment: [
      { name: 'Compressor AX-200', failureCount: 8 },
      { name: 'Main Drive Motor', failureCount: 6 },
      { name: 'Weaving Loom Unit 3', failureCount: 3 },
    ],
    topRequestedParts: [
      { name: 'Ball Bearing 6205-2RS', count: 12 },
      { name: 'Shaft Seal', count: 8 },
      { name: 'Timing Belt T-1600', count: 5 },
    ],
    avgTimePerStage: {
      submitted: 0.5,
      analysis: 2.3,
      inspection: 4.1,
      validation: 1.8,
      sourcing: 96.5, // This is the key insight — sourcing takes longest!
      delivery: 3.2,
      closed: 0,
    },
  },
};
