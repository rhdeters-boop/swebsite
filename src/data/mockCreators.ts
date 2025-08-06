export interface Creator {
  id: number;
  name: string;
  image: string;
  rating: number;
  subscribers: string;
  isOnline: boolean;
}

// Mock data - 10 creators per category
export const mockCreators = {
  top: [
    { id: 1, name: 'Luna Rose', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '12.5K', isOnline: true },
    { id: 2, name: 'Aria Moon', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '8.3K', isOnline: false },
    { id: 3, name: 'Zara Noir', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '15.2K', isOnline: true },
    { id: 4, name: 'Ivy Sterling', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '6.8K', isOnline: true },
    { id: 5, name: 'Nova Blake', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '11.1K', isOnline: false },
    { id: 6, name: 'Stella Divine', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '18.7K', isOnline: true },
    { id: 7, name: 'Aurora Night', image: '/api/placeholder/300/400', rating: 4.6, subscribers: '9.2K', isOnline: true },
    { id: 8, name: 'Crystal Moon', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '13.5K', isOnline: false },
    { id: 9, name: 'Phoenix Fire', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '7.9K', isOnline: true },
    { id: 10, name: 'Raven Star', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '16.3K', isOnline: true },
  ],
  trending: [
    { id: 11, name: 'Chloe Vixen', image: '/api/placeholder/300/400', rating: 4.6, subscribers: '4.2K', isOnline: true },
    { id: 12, name: 'Raven Dark', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '7.9K', isOnline: true },
    { id: 13, name: 'Scarlett Fire', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '9.5K', isOnline: false },
    { id: 14, name: 'Jade Venus', image: '/api/placeholder/300/400', rating: 4.5, subscribers: '3.7K', isOnline: true },
    { id: 15, name: 'Ruby Storm', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '13.8K', isOnline: true },
    { id: 16, name: 'Amber Wild', image: '/api/placeholder/300/400', rating: 4.4, subscribers: '5.1K', isOnline: false },
    { id: 17, name: 'Diamond Rush', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '8.6K', isOnline: true },
    { id: 18, name: 'Emerald Grace', image: '/api/placeholder/300/400', rating: 4.6, subscribers: '6.4K', isOnline: true },
    { id: 19, name: 'Sapphire Blue', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '10.2K', isOnline: false },
    { id: 20, name: 'Violet Dreams', image: '/api/placeholder/300/400', rating: 4.5, subscribers: '4.8K', isOnline: true },
  ],
  new: [
    { id: 21, name: 'Bella Luxe', image: '/api/placeholder/300/400', rating: 4.4, subscribers: '1.2K', isOnline: true },
    { id: 22, name: 'Mia Dreams', image: '/api/placeholder/300/400', rating: 4.6, subscribers: '2.8K', isOnline: false },
    { id: 23, name: 'Lexi Wild', image: '/api/placeholder/300/400', rating: 4.3, subscribers: '0.9K', isOnline: true },
    { id: 24, name: 'Tessa Gold', image: '/api/placeholder/300/400', rating: 4.5, subscribers: '1.8K', isOnline: true },
    { id: 25, name: 'Maya Silk', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '3.1K', isOnline: false },
    { id: 26, name: 'Coco Bliss', image: '/api/placeholder/300/400', rating: 4.2, subscribers: '0.7K', isOnline: true },
    { id: 27, name: 'Luna Pearl', image: '/api/placeholder/300/400', rating: 4.6, subscribers: '2.3K', isOnline: true },
    { id: 28, name: 'Rose Velvet', image: '/api/placeholder/300/400', rating: 4.4, subscribers: '1.5K', isOnline: false },
    { id: 29, name: 'Sky Angel', image: '/api/placeholder/300/400', rating: 4.3, subscribers: '1.1K', isOnline: true },
    { id: 30, name: 'Star Bright', image: '/api/placeholder/300/400', rating: 4.5, subscribers: '2.0K', isOnline: true },
  ],
  brunette: [
    { id: 31, name: 'Sophia Dark', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '8.7K', isOnline: true },
    { id: 32, name: 'Isabella Night', image: '/api/placeholder/300/400', rating: 4.6, subscribers: '5.4K', isOnline: false },
    { id: 33, name: 'Valentina Rich', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '12.3K', isOnline: true },
    { id: 34, name: 'Carmen Storm', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '7.1K', isOnline: true },
    { id: 35, name: 'Lucia Fire', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '9.8K', isOnline: false },
    { id: 36, name: 'Bianca Moon', image: '/api/placeholder/300/400', rating: 4.5, subscribers: '4.9K', isOnline: true },
    { id: 37, name: 'Adriana Deep', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '6.7K', isOnline: true },
    { id: 38, name: 'Camila Rich', image: '/api/placeholder/300/400', rating: 4.6, subscribers: '5.8K', isOnline: false },
    { id: 39, name: 'Elena Dark', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '8.2K', isOnline: true },
    { id: 40, name: 'Natasha Night', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '11.4K', isOnline: true },
  ],
  blonde: [
    { id: 41, name: 'Emma Bright', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '7.2K', isOnline: true },
    { id: 42, name: 'Chloe Sun', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '9.8K', isOnline: false },
    { id: 43, name: 'Ashley Light', image: '/api/placeholder/300/400', rating: 4.5, subscribers: '4.6K', isOnline: true },
    { id: 44, name: 'Madison Gold', image: '/api/placeholder/300/400', rating: 4.6, subscribers: '6.3K', isOnline: true },
    { id: 45, name: 'Samantha Shine', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '8.1K', isOnline: false },
    { id: 46, name: 'Taylor Glow', image: '/api/placeholder/300/400', rating: 4.4, subscribers: '3.9K', isOnline: true },
    { id: 47, name: 'Jessica Beam', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '10.5K', isOnline: true },
    { id: 48, name: 'Hannah Ray', image: '/api/placeholder/300/400', rating: 4.5, subscribers: '5.2K', isOnline: false },
    { id: 49, name: 'Brittany Star', image: '/api/placeholder/300/400', rating: 4.6, subscribers: '6.7K', isOnline: true },
    { id: 50, name: 'Megan Light', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '7.8K', isOnline: true },
  ]
};
