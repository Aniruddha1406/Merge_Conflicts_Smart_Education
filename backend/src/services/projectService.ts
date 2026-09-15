// src/lib/services/projectService.ts
// Automated Academic Credit (NEP 2020) & Proposal Scaffolding Engine (Sub-Engine 4)
// Auto-generates a 4-stage project milestone roadmap and calculates NEP 2020 ABC credit points.

export interface ScaffoldingMilestone {
  stage: number
  stageName: string
  title: string
  description: string
  dueDate: string
  studentHours: number
  creditPoints: number
  rubricWeight: number // percentage 0-100
  deliverables: string[]
}

export interface ProjectScaffold {
  recommendedTitle: string
  technicalAbstract: string
  totalExperientialHours: number
  totalABCCredits: number
  milestones: ScaffoldingMilestone[]
}

export function generateProjectScaffold(
  challengeTitle: string,
  domain: string,
  technicalCore: string
): ProjectScaffold {
  const dateOffset = (days: number) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
  }

  const milestones: ScaffoldingMilestone[] = [
    {
      stage: 1,
      stageName: 'Phase 1: Ground Survey & Need Assessment',
      title: 'Literature Review & Baseline Site Inspection',
      description: `Conduct ground field survey, baseline sample collection, and stakeholder interviews for ${challengeTitle}.`,
      dueDate: dateOffset(30),
      studentHours: 40,
      creditPoints: 1.5,
      rubricWeight: 20,
      deliverables: ['Baseline Survey Report', 'GIS Site Location Map', 'Stakeholder Interview Transcripts'],
    },
    {
      stage: 2,
      stageName: 'Phase 2: Prototyping & Lab Simulation',
      title: `${technicalCore.split('(')[0]} Engineering Prototype`,
      description: 'Fabricate initial benchtop prototype, perform CAD/chemical simulation, and lab validation tests.',
      dueDate: dateOffset(75),
      studentHours: 65,
      creditPoints: 2.5,
      rubricWeight: 35,
      deliverables: ['Functional Prototype Design', 'Lab Performance Data', 'CAD / Simulation Schematic'],
    },
    {
      stage: 3,
      stageName: 'Phase 3: Field Testing & Deployment',
      title: 'On-Site Field Testing & Community Pilot',
      description: 'Deploy prototype in target village/locality, measure flow/efficacy, and gather citizen feedback.',
      dueDate: dateOffset(120),
      studentHours: 50,
      creditPoints: 2.0,
      rubricWeight: 30,
      deliverables: ['Field Trial Log', 'Citizen Feedback Sign-off', 'Efficacy Performance Certificate'],
    },
    {
      stage: 4,
      stageName: 'Phase 4: Handover & Pilot Sign-off',
      title: 'Final Pilot Handover & Technical Documentation',
      description: 'Hand over working solution to local Gram Panchayat / authorities and publish open technical report.',
      dueDate: dateOffset(150),
      studentHours: 30,
      creditPoints: 1.0,
      rubricWeight: 15,
      deliverables: ['Official Handover Deed', 'Maintenance Manual', 'NEP 2020 Student Credit Report'],
    },
  ]

  const totalHours = milestones.reduce((sum, m) => sum + m.studentHours, 0)
  const totalCredits = milestones.reduce((sum, m) => sum + m.creditPoints, 0)

  return {
    recommendedTitle: `R&D Solution for ${challengeTitle}`,
    technicalAbstract: `Applied research project focusing on ${technicalCore}. Aligned with NEP 2020 Experiential Learning Framework.`,
    totalExperientialHours: totalHours,
    totalABCCredits: totalCredits,
    milestones,
  }
}
