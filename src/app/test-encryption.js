// Hybrid Encryption Test Script
// Run this in the browser console to test encryption manually

console.log('🔐 Hybrid Encryption Test Script Loaded');
console.log('Available functions:');
console.log('- testBasicEncryption() - Test basic encryption flow');
console.log('- testWithCustomMessage(message) - Test with custom message');
console.log('- testMultipleMessages() - Test multiple messages');

// Test basic encryption
async function testBasicEncryption() {
    console.log('🧪 Starting basic encryption test...');
    
    try {
        // Get the hybrid encryption service from Angular
        const service = window.angular?.getService('HybridEncryptionService');
        
        if (!service) {
            console.error('❌ HybridEncryptionService not found. Make sure you\'re on a page with the service injected.');
            return;
        }
        
        const testMessage = 'Hello World! This is a test message.';
        console.log('📝 Original message:', testMessage);
        
        const result = await service.performHybridEncryption(testMessage);
        console.log('✅ Encryption successful!');
        console.log('🔓 Decrypted result:', result);
        console.log('✅ Test passed! Original and decrypted messages match.');
        
    } catch (error) {
        console.error('❌ Encryption test failed:', error);
    }
}

// Test with custom message
async function testWithCustomMessage(message = 'Custom test message') {
    console.log('🧪 Testing with custom message:', message);
    
    try {
        const service = window.angular?.getService('HybridEncryptionService');
        
        if (!service) {
            console.error('❌ HybridEncryptionService not found.');
            return;
        }
        
        const result = await service.performHybridEncryption(message);
        console.log('✅ Custom message test successful!');
        console.log('🔓 Decrypted result:', result);
        
    } catch (error) {
        console.error('❌ Custom message test failed:', error);
    }
}

// Test multiple messages
async function testMultipleMessages() {
    console.log('🧪 Testing multiple messages...');
    
    const messages = [
        'Simple message',
        'Message with numbers: 12345',
        'Message with symbols: !@#$%^&*()',
        'Message with emojis: 🔐🔒🔓',
        'Long message: ' + 'A'.repeat(100)
    ];
    
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        console.log(`\n📝 Testing message ${i + 1}:`, message);
        
        try {
            const service = window.angular?.getService('HybridEncryptionService');
            const result = await service.performHybridEncryption(message);
            console.log(`✅ Message ${i + 1} test passed!`);
            console.log('🔓 Result:', result);
        } catch (error) {
            console.error(`❌ Message ${i + 1} test failed:`, error);
        }
    }
}

// Test individual steps
async function testIndividualSteps() {
    console.log('🧪 Testing individual encryption steps...');
    
    try {
        const service = window.angular?.getService('HybridEncryptionService');
        
        if (!service) {
            console.error('❌ HybridEncryptionService not found.');
            return;
        }
        
        // Step 1: Get public key
        console.log('📡 Step 1: Getting public key...');
        const publicKey = await service.getPublicKey().toPromise();
        console.log('✅ Public key received');
        
        // Step 2: Generate session key
        console.log('🔑 Step 2: Generating session key...');
        const sessionKey = service.generateSessionKey();
        console.log('✅ Session key generated:', sessionKey.substring(0, 16) + '...');
        
        // Step 3: Encrypt session key
        console.log('🔐 Step 3: Encrypting session key...');
        const encryptedSessionKey = service.encryptSessionKey(sessionKey);
        console.log('✅ Session key encrypted');
        
        // Step 4: Establish session
        console.log('🤝 Step 4: Establishing session...');
        const sessionResponse = await service.establishSession(encryptedSessionKey).toPromise();
        console.log('✅ Session established:', sessionResponse);
        
        // Step 5: Encrypt data
        console.log('📝 Step 5: Encrypting test data...');
        const testData = 'Step-by-step test message';
        const encryptedData = service.encryptAES(testData, sessionKey);
        console.log('✅ Data encrypted');
        
        // Step 6: Send encrypted data
        console.log('📤 Step 6: Sending encrypted data...');
        const response = await service.sendEncryptedData(encryptedData).toPromise();
        console.log('✅ Data sent, response received');
        
        // Step 7: Decrypt response
        console.log('🔓 Step 7: Decrypting response...');
        const decryptedResponse = service.decryptAES(response.output, sessionKey);
        console.log('✅ Response decrypted:', decryptedResponse);
        
        console.log('🎉 All individual steps completed successfully!');
        
    } catch (error) {
        console.error('❌ Individual steps test failed:', error);
    }
}

// Helper function to get Angular service (if available)
function getAngularService(serviceName) {
    try {
        // Try to get service from Angular context
        const appElement = document.querySelector('app-root');
        if (appElement && appElement.__ngContext__) {
            // This is a simplified approach - in real Angular apps, you'd use dependency injection
            return null;
        }
    } catch (error) {
        console.log('Angular service not available in console context');
    }
    return null;
}

console.log('🚀 Ready to test hybrid encryption!');
console.log('💡 Tip: Make sure your backend server is running on http://localhost:8080'); 