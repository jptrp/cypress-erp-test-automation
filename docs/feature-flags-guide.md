# Feature Flags Implementation Guide

## Overview

This ERP system includes a modern feature flag system inspired by LaunchDarkly, allowing for:
- A/B testing
- Gradual feature rollouts
- Beta feature management
- Dynamic feature toggling

## Architecture

The feature flag system is implemented using:
1. **Middleware**: Express middleware that attaches feature flags to every request
2. **LaunchDarkly SDK**: Optional integration with LaunchDarkly for production use
3. **Mock System**: Built-in feature flag system for development/testing

## Available Feature Flags

| Flag Name | Default | Description |
|-----------|---------|-------------|
| `new-ui-dashboard` | ✅ Enabled | New dashboard UI with improved analytics |
| `enhanced-reporting` | ✅ Enabled | Enhanced financial reporting features |
| `bulk-operations` | ❌ Disabled | Bulk import/export operations |
| `advanced-inventory` | ✅ Enabled | Advanced inventory tracking with RFID |
| `ai-recommendations` | ❌ Disabled | AI-powered purchase recommendations |
| `multi-currency` | ✅ Enabled | Multi-currency support |
| `mobile-app` | ❌ Disabled | Mobile application features |
| `real-time-sync` | ✅ Enabled | Real-time data synchronization |

## Configuration

### Development (Mock System)

The mock system is enabled by default. Feature flags are defined in `src/middleware/featureFlags.js`:

```javascript
const featureFlags = {
  'new-ui-dashboard': {
    enabled: true,
    description: 'New dashboard UI with improved analytics'
  },
  // ... more flags
};
```

### Production (LaunchDarkly Integration)

1. **Install LaunchDarkly SDK** (already in package.json):
   ```bash
   npm install launchdarkly-node-server-sdk
   ```

2. **Set environment variables**:
   ```bash
   FEATURE_FLAGS_ENABLED=true
   LAUNCHDARKLY_SDK_KEY=your_sdk_key_here
   ```

3. **User Context**: The system uses request headers for user identification:
   - `x-user-id`: User identifier
   - `x-user-email`: User email

## Usage

### API Endpoint

Get all feature flags:
```bash
GET /api/feature-flags

Response:
{
  "enabled": true,
  "flags": {
    "new-ui-dashboard": true,
    "enhanced-reporting": true,
    "bulk-operations": false,
    ...
  }
}
```

### In Code

Check feature flags in your route handlers:

```javascript
const { isFeatureEnabled } = require('../middleware/featureFlags');

router.get('/advanced-feature', (req, res) => {
  if (!isFeatureEnabled(req, 'advanced-inventory')) {
    return res.status(403).json({
      success: false,
      error: 'Feature not available'
    });
  }
  
  // Feature code here
});
```

### In Frontend

Fetch feature flags on app load:

```javascript
fetch('/api/feature-flags')
  .then(response => response.json())
  .then(data => {
    const flags = data.flags;
    
    // Conditionally show/hide features
    if (flags['new-ui-dashboard']) {
      showNewDashboard();
    } else {
      showLegacyDashboard();
    }
  });
```

### In Tests

Cypress custom commands for feature flag testing:

```javascript
// Check if feature is enabled
cy.checkFeatureFlag('new-ui-dashboard').then((enabled) => {
  if (enabled) {
    // Test new feature
  }
});

// Skip test if feature is disabled
cy.skipIfFeatureDisabled('bulk-operations');
```

## Use Cases

### 1. A/B Testing

Test two different UIs with different user groups:

```javascript
router.get('/dashboard', (req, res) => {
  if (isFeatureEnabled(req, 'new-ui-dashboard')) {
    res.render('dashboard-v2');
  } else {
    res.render('dashboard-v1');
  }
});
```

### 2. Gradual Rollout

Enable features for a percentage of users:

```javascript
// In LaunchDarkly dashboard:
// - 10% of users see new feature
// - Monitor metrics
// - Increase to 50%, then 100%
```

### 3. Beta Features

Allow specific users to test unreleased features:

```javascript
// Target beta testers in LaunchDarkly
if (isFeatureEnabled(req, 'ai-recommendations')) {
  // Show AI recommendations
}
```

### 4. Kill Switch

Quickly disable problematic features:

```javascript
// Instantly disable feature in LaunchDarkly dashboard
// No code deployment needed
```

## Testing Feature Flags

### Unit Tests

Test flag-dependent functionality:

```javascript
describe('Advanced Inventory', () => {
  it('should return 403 when feature disabled', () => {
    // Mock feature flag as disabled
    const req = { featureFlags: { 'advanced-inventory': false } };
    
    // Test that feature returns 403
  });
  
  it('should work when feature enabled', () => {
    const req = { featureFlags: { 'advanced-inventory': true } };
    
    // Test feature functionality
  });
});
```

### Integration Tests

Test with Cypress:

```javascript
describe('Feature Flags', () => {
  it('should enable/disable features based on flags', () => {
    cy.checkFeatureFlag('new-ui-dashboard').then((enabled) => {
      cy.visit('/dashboard');
      
      if (enabled) {
        cy.contains('New Dashboard').should('be.visible');
      } else {
        cy.contains('Dashboard').should('be.visible');
      }
    });
  });
});
```

## Monitoring & Analytics

### Track Feature Usage

```javascript
router.get('/feature', (req, res) => {
  if (isFeatureEnabled(req, 'new-feature')) {
    // Log feature usage
    analytics.track('new-feature-used', {
      userId: req.headers['x-user-id'],
      timestamp: new Date()
    });
    
    // Feature code
  }
});
```

### Performance Monitoring

```javascript
const startTime = Date.now();

if (isFeatureEnabled(req, 'new-algorithm')) {
  // Run new algorithm
  runNewAlgorithm();
} else {
  // Run old algorithm
  runOldAlgorithm();
}

const duration = Date.now() - startTime;
analytics.track('algorithm-performance', { duration, version });
```

## Best Practices

### 1. Naming Conventions
- Use kebab-case: `new-ui-dashboard`
- Be descriptive: `enhanced-reporting` not just `reporting`
- Include feature area: `advanced-inventory`

### 2. Default Values
- New features: Default to `false` (disabled)
- Stable features: Default to `true` (enabled)
- Experimental: Always `false`

### 3. Cleanup
- Remove flags after full rollout
- Document flag lifecycle
- Archive old flags

### 4. Documentation
- Document each flag's purpose
- Track dependencies between flags
- Note target rollout date

### 5. Testing
- Test both enabled and disabled states
- Use feature flags in CI/CD
- Automate flag-dependent tests

## Troubleshooting

### Flag Not Working

1. Check environment variables:
   ```bash
   echo $FEATURE_FLAGS_ENABLED
   echo $LAUNCHDARKLY_SDK_KEY
   ```

2. Verify middleware is loaded:
   ```javascript
   // In server.js
   app.use(featureFlagsMiddleware);
   ```

3. Check flag name spelling

### LaunchDarkly Connection Issues

1. Verify SDK key is correct
2. Check network connectivity
3. Review LaunchDarkly dashboard settings
4. Check SDK version compatibility

### Inconsistent Behavior

1. Clear cache
2. Verify user context is correct
3. Check flag targeting rules
4. Review evaluation logs

## Examples

### Example 1: Progressive Enhancement

```javascript
router.get('/inventory/items', (req, res) => {
  const items = getItems();
  
  if (isFeatureEnabled(req, 'advanced-inventory')) {
    // Add RFID data
    items.forEach(item => {
      item.rfidData = getRFIDData(item.id);
    });
  }
  
  res.json({ success: true, data: items });
});
```

### Example 2: A/B Testing Analytics

```javascript
router.get('/checkout', (req, res) => {
  const useNewCheckout = isFeatureEnabled(req, 'new-checkout-flow');
  
  analytics.track('checkout-view', {
    userId: req.userId,
    variant: useNewCheckout ? 'B' : 'A',
    timestamp: new Date()
  });
  
  if (useNewCheckout) {
    res.render('checkout-v2');
  } else {
    res.render('checkout-v1');
  }
});
```

### Example 3: Gradual Database Migration

```javascript
router.get('/reports', async (req, res) => {
  if (isFeatureEnabled(req, 'new-database-schema')) {
    // Use new schema
    const reports = await newDB.getReports();
    res.json({ success: true, data: reports });
  } else {
    // Use old schema
    const reports = await oldDB.getReports();
    res.json({ success: true, data: reports });
  }
});
```

## Wow Factor Features

This feature flag system showcases:

✨ **Modern Architecture**: Industry-standard feature flag pattern
🎯 **A/B Testing Ready**: Test different UIs and features
🚀 **Gradual Rollouts**: Deploy features safely
🔄 **Real-time Updates**: Change features without redeployment
📊 **Analytics Integration**: Track feature adoption
🛡️ **Risk Mitigation**: Kill switch for problematic features
🧪 **Testing Support**: Comprehensive test integration
📱 **Multi-platform**: Works across web and mobile
👥 **User Targeting**: Feature access by user segments
📈 **Performance Monitoring**: Compare feature performance

## Resources

- [LaunchDarkly Documentation](https://docs.launchdarkly.com/)
- [Feature Flag Best Practices](https://launchdarkly.com/blog/dos-and-donts-of-feature-flagging/)
- [A/B Testing Guide](https://launchdarkly.com/blog/ab-testing-with-feature-flags/)
