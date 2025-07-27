import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repoName');

    if (!owner || !repo) {
      return NextResponse.json({ error: 'Owner et repo requis' }, { status: 400 });
    }

    // Données d'analytics complètes avec données réelles simulées
    const analyticsData = {
      health: {
        score: 87,
        status: 'Excellent',
        complexity: 42,
        maintainability: 85,
        technicalDebt: 18,
        codeCoverage: 89
      },

      complexity: {
        cyclomaticComplexity: 3.8,
        codeDuplication: 8.5,
        testCoverage: 82,
        documentationCoverage: 75
      },

      performance: {
        buildTime: 2.1,
        testTime: 1.5,
        deploymentTime: 3.8,
        responseTime: 125
      },

      security: {
        score: 94,
        vulnerabilities: 1,
        criticalIssues: 0,
        compliance: 92
      },

      team: {
        activeMembers: 8,
        totalTeamSize: 12,
        newContributors: 3,
        activityRate: 1.8,
        topContributors: [
          { login: 'alice', contributions: 156, avatar: 'https://github.com/alice.png', profile: 'https://github.com/alice' },
          { login: 'bob', contributions: 134, avatar: 'https://github.com/bob.png', profile: 'https://github.com/bob' },
          { login: 'charlie', contributions: 98, avatar: 'https://github.com/charlie.png', profile: 'https://github.com/charlie' }
        ]
      },

      commits: {
        total: 1247,
        thisMonth: 89,
        thisWeek: 23,
        averagePerDay: 3.4,
        types: {
          feature: 45,
          fix: 28,
          docs: 12,
          refactor: 8,
          other: 6
        },
        trends: generateCommitTrends(),
        recentCommits: [
          { sha: 'a1b2c3d', message: 'feat: add new authentication system', author: 'alice', date: '2024-01-15T10:30:00Z', avatar: 'https://github.com/alice.png' },
          { sha: 'e4f5g6h', message: 'fix: resolve memory leak in cache', author: 'bob', date: '2024-01-14T15:45:00Z', avatar: 'https://github.com/bob.png' },
          { sha: 'i7j8k9l', message: 'docs: update API documentation', author: 'charlie', date: '2024-01-13T09:20:00Z', avatar: 'https://github.com/charlie.png' }
        ]
      },

      activity: generateActivityData(),
      
      repository: {
        name: repo,
        description: `Repository ${repo} by ${owner} - A modern web application with advanced features and real-time analytics`,
        language: 'TypeScript',
        size: 15420,
        stars: 1247,
        forks: 89,
        watchers: 156,
        openIssues: 23,
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2024-01-15T14:20:00Z',
        pushedAt: '2024-01-15T14:20:00Z',
        defaultBranch: 'main',
        topics: ['web', 'typescript', 'react', 'analytics', 'real-time'],
        license: 'MIT',
        archived: false,
        disabled: false
      },

      issues: {
        total: 156,
        open: 23,
        closed: 133,
        recentIssues: [
          { number: 245, title: 'Bug: Memory leak in authentication module', state: 'open', author: 'alice', createdAt: '2024-01-15T10:30:00Z', labels: ['bug', 'high-priority'] },
          { number: 244, title: 'Feature: Add dark mode support', state: 'open', author: 'bob', createdAt: '2024-01-14T15:45:00Z', labels: ['feature', 'enhancement'] },
          { number: 243, title: 'Documentation: Update API docs', state: 'closed', author: 'charlie', createdAt: '2024-01-13T09:20:00Z', labels: ['documentation'] }
        ],
        issueTypes: {
          bug: 45,
          feature: 38,
          enhancement: 25,
          documentation: 20,
          other: 28
        }
      },

      pulls: {
        total: 89,
        open: 12,
        merged: 67,
        closed: 10,
        recentPulls: [
          { number: 156, title: 'Add real-time analytics dashboard', state: 'open', author: 'alice', createdAt: '2024-01-15T10:30:00Z', additions: 245, deletions: 12 },
          { number: 155, title: 'Fix authentication bug', state: 'merged', author: 'bob', createdAt: '2024-01-14T15:45:00Z', mergedAt: '2024-01-15T09:20:00Z', additions: 89, deletions: 34 },
          { number: 154, title: 'Update dependencies', state: 'closed', author: 'charlie', createdAt: '2024-01-13T09:20:00Z', additions: 12, deletions: 8 }
        ]
      }
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Erreur analytics:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'analyse' }, { status: 500 });
  }
}

function generateCommitTrends() {
  const trends = [];
  const days = 30;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const baseCommits = 3.4;
    const variation = (Math.random() - 0.5) * 0.5;
    const dayCommits = Math.max(0, Math.floor(baseCommits * (1 + variation)));
    
    trends.push({
      date: date.toISOString().split('T')[0],
      commits: dayCommits
    });
  }
  
  return trends;
}

function generateActivityData() {
  const activity = {};
  const days = 30;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayKey = date.toISOString().split('T')[0];
    
    activity[dayKey] = Array(24).fill(0);
    
    // Générer de l'activité pour quelques heures par jour
    const activeHours = Math.floor(Math.random() * 8) + 4;
    
    for (let h = 0; h < activeHours; h++) {
      const hour = Math.floor(Math.random() * 24);
      const commits = Math.floor(Math.random() * 3) + 1;
      activity[dayKey][hour] = commits;
    }
  }
  
  return activity;
} 