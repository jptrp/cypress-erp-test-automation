// Feature Flags Middleware
// This middleware simulates a feature flag system similar to LaunchDarkly

const featureFlags = {
  'new-ui-dashboard': {
    enabled: true,
    description: 'New dashboard UI with improved analytics'
  },
  'enhanced-reporting': {
    enabled: true,
    description: 'Enhanced financial reporting features'
  },
  'bulk-operations': {
    enabled: false,
    description: 'Bulk import/export operations'
  },
  'advanced-inventory': {
    enabled: true,
    description: 'Advanced inventory tracking with RFID'
  },
  'ai-recommendations': {
    enabled: false,
    description: 'AI-powered purchase recommendations'
  },
  'multi-currency': {
    enabled: true,
    description: 'Multi-currency support'
  },
  'mobile-app': {
    enabled: false,
    description: 'Mobile application features'
  },
  'real-time-sync': {
    enabled: true,
    description: 'Real-time data synchronization'
  }
};

// Simulate LaunchDarkly SDK
let ldClient = null;

if (process.env.FEATURE_FLAGS_ENABLED === 'true' && process.env.LAUNCHDARKLY_SDK_KEY) {
  try {
    const LaunchDarkly = require('launchdarkly-node-server-sdk');
    ldClient = LaunchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY);
  } catch (error) {
    console.warn('LaunchDarkly SDK not configured, using mock feature flags');
  }
}

const featureFlagsMiddleware = async (req, res, next) => {
  // Attach feature flags to request object
  if (process.env.FEATURE_FLAGS_ENABLED === 'true') {
    if (ldClient) {
      // Use LaunchDarkly if configured
      try {
        await ldClient.waitForInitialization();
        const user = {
          key: req.headers['x-user-id'] || 'anonymous',
          email: req.headers['x-user-email'] || 'anonymous@example.com'
        };
        
        const flags = {};
        for (const flagKey of Object.keys(featureFlags)) {
          flags[flagKey] = await ldClient.variation(flagKey, user, false);
        }
        req.featureFlags = flags;
      } catch (error) {
        console.error('LaunchDarkly error:', error);
        req.featureFlags = getDefaultFlags();
      }
    } else {
      // Use mock feature flags
      req.featureFlags = getDefaultFlags();
    }
  } else {
    req.featureFlags = {};
  }
  
  next();
};

function getDefaultFlags() {
  const flags = {};
  for (const [key, config] of Object.entries(featureFlags)) {
    flags[key] = config.enabled;
  }
  return flags;
}

// Helper function to check if a feature is enabled
function isFeatureEnabled(req, featureName) {
  return req.featureFlags && req.featureFlags[featureName] === true;
}

module.exports = featureFlagsMiddleware;
module.exports.isFeatureEnabled = isFeatureEnabled;
module.exports.featureFlags = featureFlags;
