/* ===================================
   SAMPLE DATA GENERATOR
   For testing and demonstration
   =================================== */

function generateSampleData() {
    console.log('Generating sample data...');
    
    // Create sample users
    const sampleUsers = [
        {
            id: 1000001,
            name: 'Elon Musk',
            username: 'elonmusk',
            email: 'elon@x.com',
            password: 'demo123',
            bio: 'CEO of X, Tesla, SpaceX, and more',
            profileImage: '',
            coverImage: '',
            followers: [1000002, 1000003],
            following: [1000002],
            verified: true,
            createdAt: new Date('2023-01-01').toISOString()
        },
        {
            id: 1000002,
            name: 'Linda Yaccarino',
            username: 'lindayacc',
            email: 'linda@x.com',
            password: 'demo123',
            bio: 'CEO of X',
            profileImage: '',
            coverImage: '',
            followers: [1000001, 1000003],
            following: [1000001],
            verified: true,
            createdAt: new Date('2023-02-01').toISOString()
        },
        {
            id: 1000003,
            name: 'Tech Enthusiast',
            username: 'techfan',
            email: 'tech@example.com',
            password: 'demo123',
            bio: 'Love technology, innovation, and the future 🚀',
            profileImage: '',
            coverImage: '',
            followers: [1000001],
            following: [1000001, 1000002],
            verified: false,
            createdAt: new Date('2023-03-01').toISOString()
        }
    ];
    
    // Create sample posts
    const samplePosts = [
        {
            id: 2000001,
            userId: 1000001,
            content: 'Excited to announce new features coming to X - The Everything App! 🚀',
            image: null,
            likes: [1000002, 1000003],
            retweets: [1000002],
            replies: [],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
        },
        {
            id: 2000002,
            userId: 1000002,
            content: 'Working hard to make X the best platform for everyone. Your feedback matters!',
            image: null,
            likes: [1000001, 1000003],
            retweets: [],
            replies: [],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
        },
        {
            id: 2000003,
            userId: 1000003,
            content: 'Just integrated payments into X! This is game-changing. The future of super apps is here! 💰✨',
            image: null,
            likes: [1000001],
            retweets: [1000001],
            replies: [],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
        },
        {
            id: 2000004,
            userId: 1000001,
            content: 'X is not just a social network. It\'s becoming the everything app - messaging, payments, shopping, and more. All in one place.',
            image: null,
            likes: [1000002, 1000003],
            retweets: [1000002, 1000003],
            replies: [],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
        }
    ];
    
    // Create sample products
    const sampleProducts = [
        {
            id: 3000001,
            name: 'Tesla Model S',
            category: 'electronics',
            price: 89990,
            description: 'Premium electric sedan with autopilot, long range, and ludicrous acceleration.',
            icon: '🚗',
            rating: 4.8,
            reviews: 1250,
            inStock: true
        },
        {
            id: 3000002,
            name: 'SpaceX Hoodie',
            category: 'fashion',
            price: 65,
            description: 'Official SpaceX merchandise. Premium cotton hoodie with embroidered logo.',
            icon: '👕',
            rating: 4.6,
            reviews: 450,
            inStock: true
        },
        {
            id: 3000003,
            name: 'Starlink Kit',
            category: 'electronics',
            price: 599,
            description: 'High-speed, low-latency broadband internet. Perfect for remote locations.',
            icon: '📡',
            rating: 4.7,
            reviews: 3200,
            inStock: true
        },
        {
            id: 3000004,
            name: 'X Premium Mug',
            category: 'home',
            price: 25,
            description: 'Limited edition X ceramic mug. Perfect for your morning coffee.',
            icon: '☕',
            rating: 4.5,
            reviews: 890,
            inStock: true
        },
        {
            id: 3000005,
            name: 'The Art of War',
            category: 'books',
            price: 15,
            description: 'Ancient Chinese military treatise. Essential reading for strategy.',
            icon: '📚',
            rating: 4.9,
            reviews: 5600,
            inStock: true
        },
        {
            id: 3000006,
            name: 'Tesla Cybertruck',
            category: 'electronics',
            price: 79990,
            description: 'Ultra-hard stainless steel exoskeleton. Armor glass. Up to 500 miles range.',
            icon: '🛻',
            rating: 4.9,
            reviews: 2100,
            inStock: false
        },
        {
            id: 3000007,
            name: 'X Baseball Cap',
            category: 'fashion',
            price: 35,
            description: 'Classic baseball cap with embroidered X logo. Adjustable strap.',
            icon: '🧢',
            rating: 4.4,
            reviews: 670,
            inStock: true
        },
        {
            id: 3000008,
            name: 'Smart Home Hub',
            category: 'home',
            price: 149,
            description: 'Control your entire home. Voice activated. Works with all devices.',
            icon: '🏠',
            rating: 4.6,
            reviews: 1890,
            inStock: true
        },
        {
            id: 3000009,
            name: 'Elon Musk Biography',
            category: 'books',
            price: 30,
            description: 'The complete story of innovation, ambition, and the future.',
            icon: '📖',
            rating: 4.8,
            reviews: 4500,
            inStock: true
        },
        {
            id: 3000010,
            name: 'Running Shoes Pro',
            category: 'sports',
            price: 120,
            description: 'Ultra-lightweight running shoes with advanced cushioning technology.',
            icon: '👟',
            rating: 4.7,
            reviews: 1100,
            inStock: true
        },
        {
            id: 3000011,
            name: 'Wireless Earbuds',
            category: 'electronics',
            price: 179,
            description: 'Premium sound quality. Active noise cancellation. 24hr battery life.',
            icon: '🎧',
            rating: 4.6,
            reviews: 2300,
            inStock: true
        },
        {
            id: 3000012,
            name: 'Fitness Tracker',
            category: 'sports',
            price: 99,
            description: 'Track your health, fitness, and sleep. Waterproof. 7-day battery.',
            icon: '⌚',
            rating: 4.5,
            reviews: 1650,
            inStock: true
        }
    ];
    
    // Save to localStorage
    localStorage.setItem('x_app_users', JSON.stringify(sampleUsers));
    localStorage.setItem('x_app_posts', JSON.stringify(samplePosts));
    localStorage.setItem('x_app_products', JSON.stringify(sampleProducts));
    
    console.log('Sample data generated successfully!');
    console.log('Sample accounts:');
    console.log('- Username: elonmusk, Password: demo123');
    console.log('- Username: lindayacc, Password: demo123');
    console.log('- Username: techfan, Password: demo123');
    
    return {
        users: sampleUsers,
        posts: samplePosts,
        products: sampleProducts
    };
}

// Add button to generate sample data in console
console.log('%c🚀 X App Developer Tools', 'font-size: 20px; font-weight: bold; color: #1D9BF0;');
console.log('%cType generateSampleData() to create sample users and posts', 'font-size: 14px; color: #71767B;');
console.log('%cSample Login Credentials:', 'font-size: 14px; font-weight: bold; color: #1D9BF0;');
console.log('%c- Username: elonmusk | Password: demo123', 'font-size: 12px; color: #71767B;');
console.log('%c- Username: lindayacc | Password: demo123', 'font-size: 12px; color: #71767B;');
console.log('%c- Username: techfan | Password: demo123', 'font-size: 12px; color: #71767B;');
