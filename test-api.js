#!/usr/bin/env node

/**
 * Security Testing Script for LNQ Health API
 * This script tests the registration and authentication flow
 */

const BASE_URL = 'https://backend.lnq.health/api';

// Generate random test data
function generateRandomUser() {
  const randomId = Math.floor(Math.random() * 1000000);
  return {
    firstName: `Test${randomId}`,
    lastName: `User${randomId}`,
    email: `test${randomId}@example.com`,
    providerId: `PROV${randomId}`,
    phone: `+1555${String(randomId).padStart(7, '0').slice(0, 7)}`,
    password: `SecurePass${randomId}!`,
    specialty: 'Radiology',
    stateLicenses: ['CA', 'NY'],
    hasMalpracticeInsurance: true
  };
}

async function registerUser(userData) {
  console.log('\n=== Registering New User ===');
  console.log('User Data:', JSON.stringify(userData, null, 2));

  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Registration failed:', data);
    throw new Error(`Registration failed: ${JSON.stringify(data)}`);
  }

  console.log('Registration successful!');
  console.log('Access Token:', data.jwt?.accessToken);

  return data;
}

async function loginUser(email, password) {
  console.log('\n=== Logging In ===');

  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Login failed:', data);
    throw new Error(`Login failed: ${JSON.stringify(data)}`);
  }

  console.log('Login successful!');
  console.log('Access Token:', data.jwt?.accessToken);

  return data;
}

async function searchProviders(accessToken, groupId, searchTerm = 'a') {
  console.log('\n=== Searching Providers ===');
  console.log(`Group ID: ${groupId}`);
  console.log(`Search Term: ${searchTerm}`);

  const response = await fetch(
    `${BASE_URL}/group/${groupId}/providers/search?search=${searchTerm}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  const data = await response.json();

  console.log('Search response:', JSON.stringify(data, null, 2));

  return data;
}

async function getUserProfile(accessToken) {
  console.log('\n=== Getting User Profile ===');

  const response = await fetch(`${BASE_URL}/user/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const data = await response.json();

  if (response.ok) {
    console.log('User Profile:', JSON.stringify(data, null, 2));
  } else {
    console.log('Profile fetch response:', data);
  }

  return data;
}

async function main() {
  try {
    console.log('🔐 LNQ Health API Security Test');
    console.log('================================\n');

    // Generate random user data
    const userData = generateRandomUser();

    // Register new user
    const registerResponse = await registerUser(userData);
    const accessToken = registerResponse.jwt?.accessToken;

    if (!accessToken) {
      console.error('No access token received from registration');
      return;
    }

    console.log('\n=== CURL Commands for Testing ===\n');

    // Login curl
    console.log('1. Login:');
    console.log(`curl -s "${BASE_URL}/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({ email: userData.email, password: userData.password })}'`);

    // Search providers curl (using the group ID from the user's example)
    console.log('\n2. Search Providers:');
    console.log(`curl -s "${BASE_URL}/group/652020c6-9ea9-458e-8669-29bebc26d658/providers/search?search=a" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${accessToken}"`);

    // Get user profile curl
    console.log('\n3. Get User Profile:');
    console.log(`curl -s "${BASE_URL}/user/me" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${accessToken}"`);

    // Try to get user profile
    await getUserProfile(accessToken);

    // Try searching providers with the group ID from the example
    const groupId = '652020c6-9ea9-458e-8669-29bebc26d658';
    try {
      await searchProviders(accessToken, groupId, 'a');
    } catch (error) {
      console.log('Provider search might require specific group membership');
    }

    console.log('\n✅ Test completed successfully!');
    console.log('\n=== Test Account Credentials ===');
    console.log(`Email: ${userData.email}`);
    console.log(`Password: ${userData.password}`);
    console.log(`Access Token: ${accessToken}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
