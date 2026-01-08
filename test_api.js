async function testApi() {
    try {
        const response = await fetch('http://localhost:3000/api/products?freeShipping=true');
        const data = await response.json();
        console.log('API Response (freeShipping=true):', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('API Error:', error);
    }
}

testApi();
