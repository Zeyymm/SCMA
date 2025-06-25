#!/usr/bin/env node

/**
 * SDK 53 Compatibility Verification Script
 * Sequential MCP + Context7 Implementation
 * 
 * This script verifies all dependencies are compatible with Expo SDK 53
 */

const fs = require('fs');
const path = require('path');

// SDK 53 Compatible Versions
const SDK53_COMPATIBLE_VERSIONS = {
  // Core Expo packages
  'expo': '~53.0.0',
  'expo-status-bar': '~2.0.0',
  'expo-image-picker': '~15.0.7',
  'expo-linking': '~7.0.3',
  'expo-notifications': '~0.29.9',
  
  // React packages
  'react': '18.3.1',
  'react-native': '0.76.3',
  
  // Navigation packages
  '@react-navigation/native': '^6.1.18',
  '@react-navigation/bottom-tabs': '^6.6.1',
  '@react-navigation/stack': '^6.4.1',
  'react-native-screens': '~4.1.0',
  'react-native-safe-area-context': '~4.12.0',
  
  // Storage and utilities
  '@react-native-async-storage/async-storage': '~2.1.0',
  'react-native-url-polyfill': '^2.0.0',
  
  // Third-party libraries
  '@supabase/supabase-js': '^2.45.4',
  'victory-native': '^37.1.2',
  'react-native-youtube-iframe': '^2.3.0',
  '@google/generative-ai': '^0.21.0',
  
  // Development dependencies
  '@babel/core': '^7.25.0',
  '@types/react': '~18.3.12',
  '@types/react-native': '~0.76.0',
  'typescript': '^5.6.0'
};

function loadPackageJson() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    return JSON.parse(packageContent);
  } catch (error) {
    console.error('❌ Error loading package.json:', error.message);
    process.exit(1);
  }
}

function checkVersionCompatibility(packageName, currentVersion, expectedVersion) {
  // Simple version comparison - in production, use semver library
  const isCompatible = currentVersion === expectedVersion || 
                      currentVersion.includes(expectedVersion.replace(/[~^]/g, ''));
  
  return {
    package: packageName,
    current: currentVersion,
    expected: expectedVersion,
    compatible: isCompatible,
    status: isCompatible ? '✅' : '❌'
  };
}

function verifyDependencies() {
  console.log('🔍 Verifying SDK 53 Compatibility...\n');
  
  const packageJson = loadPackageJson();
  const allDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  const results = [];
  let incompatibleCount = 0;
  
  // Check each dependency
  Object.entries(SDK53_COMPATIBLE_VERSIONS).forEach(([packageName, expectedVersion]) => {
    const currentVersion = allDependencies[packageName];
    
    if (!currentVersion) {
      results.push({
        package: packageName,
        current: 'NOT INSTALLED',
        expected: expectedVersion,
        compatible: false,
        status: '⚠️'
      });
      incompatibleCount++;
    } else {
      const result = checkVersionCompatibility(packageName, currentVersion, expectedVersion);
      results.push(result);
      if (!result.compatible) {
        incompatibleCount++;
      }
    }
  });
  
  // Display results
  console.log('📦 Dependency Compatibility Report:\n');
  console.log('Package'.padEnd(40) + 'Current'.padEnd(15) + 'Expected'.padEnd(15) + 'Status');
  console.log('-'.repeat(80));
  
  results.forEach(result => {
    console.log(
      result.package.padEnd(40) + 
      result.current.padEnd(15) + 
      result.expected.padEnd(15) + 
      result.status
    );
  });
  
  console.log('\n' + '='.repeat(80));
  
  if (incompatibleCount === 0) {
    console.log('🎉 All dependencies are compatible with SDK 53!');
    console.log('✅ Your project is ready for mobile testing.');
  } else {
    console.log(`❌ Found ${incompatibleCount} incompatible dependencies.`);
    console.log('🔧 Please update the incompatible packages.');
  }
  
  return incompatibleCount === 0;
}

function checkExpoConfig() {
  console.log('\n🔍 Checking Expo configuration...\n');
  
  try {
    const appJsonPath = path.join(process.cwd(), 'app.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    const sdkVersion = appJson.expo.sdkVersion;
    const runtimeVersion = appJson.expo.runtimeVersion;
    
    console.log('📱 Expo Configuration:');
    console.log(`   SDK Version: ${sdkVersion || 'Not specified'}`);
    console.log(`   Runtime Version: ${runtimeVersion || 'Not specified'}`);
    
    if (sdkVersion && sdkVersion.includes('53')) {
      console.log('✅ Expo SDK version is correctly set to 53');
      return true;
    } else {
      console.log('❌ Expo SDK version should be set to 53.0.0');
      return false;
    }
  } catch (error) {
    console.log('⚠️  Could not verify app.json configuration');
    return false;
  }
}

function generateMigrationCommands() {
  console.log('\n🚀 Migration Commands:\n');
  console.log('# Clean installation');
  console.log('rm -rf node_modules package-lock.json');
  console.log('npm install');
  console.log('');
  console.log('# Update Expo CLI');
  console.log('npm install -g @expo/cli@latest');
  console.log('');
  console.log('# Verify installation');
  console.log('expo doctor');
  console.log('npm start');
  console.log('');
  console.log('# Test on your phone');
  console.log('# 1. Open Expo Go app (SDK 53)');
  console.log('# 2. Scan QR code from terminal');
  console.log('# 3. Verify app loads without errors');
}

function main() {
  console.log('🎯 SCMA SDK 53 Compatibility Checker');
  console.log('Sequential MCP + Context7 Implementation\n');
  
  const dependenciesOk = verifyDependencies();
  const configOk = checkExpoConfig();
  
  if (dependenciesOk && configOk) {
    console.log('\n🎉 SUCCESS: Your project is fully compatible with SDK 53!');
    console.log('📱 You can now test on your phone with Expo Go.');
  } else {
    console.log('\n⚠️  ISSUES FOUND: Please address the compatibility issues above.');
    generateMigrationCommands();
  }
  
  console.log('\n📚 For detailed guidance, see: SDK53_COMPATIBILITY_GUIDE.md');
}

// Run the verification
if (require.main === module) {
  main();
}

module.exports = {
  verifyDependencies,
  checkExpoConfig,
  SDK53_COMPATIBLE_VERSIONS
};
