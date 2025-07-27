import { NextResponse } from 'next/server';

export async function GET() {
  const analyticsData = {
    health: {
      score: 85,
      status: 'Excellent',
      complexity: 45,
      maintainability: 78,
      technicalDebt: 22,
      codeCoverage: 82
    },
    complexity: {
      cyclomaticComplexity: 4.2,
      codeDuplication: 12.5,
      testCoverage: 78,
      documentationCoverage: 65
    },
    performance: {
      buildTime: 2.3,
      testTime: 1.8,
      deploymentTime: 4.2,
      responseTime: 145
    },
    security: {
      score: 92,
      vulnerabilities: 1,
      criticalIssues: 0,
      compliance: 88
    },
    team: {
      activeMembers: 6,
      totalTeamSize: 8,
      newContributors: 2,
      activityRate: 1.2
    },
    commits: {
      total: 342,
      thisMonth: 28,
      thisWeek: 7,
      averagePerDay: 0.9,
      types: {
        feature: 12,
        fix: 8,
        docs: 3,
        refactor: 3,
        other: 2
      },
      trends: []
    },
    activity: {}
  };

  return NextResponse.json(analyticsData);
} 