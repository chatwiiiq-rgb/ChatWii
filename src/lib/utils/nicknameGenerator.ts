// Nickname generator with 20000+ combinations
// Format: [Adjective][Noun][Number] = 100 * 200 * 2 = 40,000 combinations

const adjectives = [
  'Happy', 'Cool', 'Smart', 'Brave', 'Swift', 'Bright', 'Bold', 'Calm', 'Clever', 'Fierce',
  'Gentle', 'Quick', 'Silent', 'Strong', 'Wise', 'Wild', 'Kind', 'Noble', 'Pure', 'Royal',
  'Mighty', 'Proud', 'Silent', 'Cosmic', 'Golden', 'Silver', 'Crystal', 'Diamond', 'Thunder', 'Storm',
  'Frozen', 'Blazing', 'Shadow', 'Mystic', 'Ancient', 'Divine', 'Epic', 'Lunar', 'Solar', 'Stellar',
  'Neon', 'Cyber', 'Digital', 'Electric', 'Plasma', 'Quantum', 'Ultra', 'Mega', 'Super', 'Hyper',
  'Azure', 'Crimson', 'Emerald', 'Violet', 'Scarlet', 'Jade', 'Ruby', 'Sapphire', 'Amber', 'Ivory',
  'Arctic', 'Tropical', 'Desert', 'Ocean', 'Forest', 'Mountain', 'River', 'Sky', 'Cloud', 'Star',
  'Moon', 'Sun', 'Fire', 'Ice', 'Wind', 'Earth', 'Light', 'Dark', 'Dawn', 'Dusk',
  'Spring', 'Summer', 'Autumn', 'Winter', 'Zen', 'Chaos', 'Pixel', 'Retro', 'Vintage', 'Modern',
  'Classic', 'Elite', 'Prime', 'Alpha', 'Beta', 'Omega', 'Delta', 'Gamma', 'Sigma', 'Phoenix'
];

const nouns = [
  'Wolf', 'Lion', 'Tiger', 'Bear', 'Fox', 'Eagle', 'Hawk', 'Raven', 'Owl', 'Falcon',
  'Dragon', 'Phoenix', 'Griffin', 'Unicorn', 'Pegasus', 'Ninja', 'Samurai', 'Knight', 'Warrior', 'Hunter',
  'Wizard', 'Mage', 'Sage', 'Oracle', 'Guardian', 'Ranger', 'Scout', 'Pilot', 'Captain', 'Admiral',
  'Prince', 'King', 'Queen', 'Emperor', 'Titan', 'Giant', 'Legend', 'Hero', 'Champion', 'Victor',
  'Master', 'Sensei', 'Guru', 'Expert', 'Prodigy', 'Genius', 'Scholar', 'Artist', 'Poet', 'Bard',
  'Rider', 'Runner', 'Dancer', 'Singer', 'Player', 'Gamer', 'Hacker', 'Coder', 'Builder', 'Maker',
  'Dreamer', 'Seeker', 'Finder', 'Explorer', 'Voyager', 'Traveler', 'Wanderer', 'Nomad', 'Drifter', 'Roamer',
  'Ghost', 'Spirit', 'Soul', 'Phantom', 'Specter', 'Shadow', 'Echo', 'Whisper', 'Storm', 'Thunder',
  'Blaze', 'Flame', 'Spark', 'Flash', 'Bolt', 'Strike', 'Crash', 'Boom', 'Bang', 'Blast',
  'Wave', 'Tide', 'Current', 'Flow', 'Stream', 'River', 'Ocean', 'Sea', 'Lake', 'Pool',
  'Rock', 'Stone', 'Crystal', 'Diamond', 'Gem', 'Pearl', 'Star', 'Comet', 'Meteor', 'Nova',
  'Galaxy', 'Cosmos', 'Universe', 'Nebula', 'Quasar', 'Pulsar', 'Void', 'Abyss', 'Rift', 'Portal',
  'Blade', 'Sword', 'Arrow', 'Spear', 'Shield', 'Axe', 'Hammer', 'Staff', 'Wand', 'Bow',
  'Crown', 'Throne', 'Scepter', 'Ring', 'Amulet', 'Charm', 'Rune', 'Sigil', 'Mark', 'Seal',
  'Code', 'Cipher', 'Key', 'Lock', 'Gate', 'Door', 'Path', 'Road', 'Trail', 'Track',
  'Mind', 'Heart', 'Soul', 'Will', 'Force', 'Power', 'Energy', 'Aura', 'Vibe', 'Pulse',
  'Byte', 'Bit', 'Pixel', 'Node', 'Core', 'Link', 'Net', 'Web', 'Grid', 'Matrix',
  'Ace', 'King', 'Queen', 'Jack', 'Joker', 'Deck', 'Card', 'Dice', 'Chip', 'Token',
  'Flame', 'Frost', 'Shock', 'Glow', 'Shine', 'Beam', 'Ray', 'Laser', 'Prism', 'Lens',
  'Vortex', 'Spiral', 'Helix', 'Orbit', 'Sphere', 'Cube', 'Prism', 'Pyramid', 'Dome', 'Tower'
];

export function generateRandomNickname(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  // Use single digit (0-9) to ensure max 2 digits total per validation rules
  const number = Math.floor(Math.random() * 10); // 0-9

  const nickname = `${adjective}${noun}${number}`;

  // Ensure it's within 20 character limit
  return nickname.length <= 20 ? nickname : nickname.substring(0, 20);
}

// Get total possible combinations
export function getTotalCombinations(): number {
  return adjectives.length * nouns.length * 10; // 100 * 200 * 10 = 200,000 combinations
}
