export interface SampleCar {
  id: string;
  name: string;
  expectedMake: string;
  expectedModel: string;
  category: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
}

export const SAMPLE_CARS: SampleCar[] = [
  {
    id: 'tata-nexon',
    name: 'Tata Nexon (Compact SUV)',
    expectedMake: 'Tata Motors',
    expectedModel: 'Nexon',
    category: 'Indian Compact SUV',
    description: 'India\'s top-selling compact SUV featuring the modern split LED DRLs and signature coupe-like silhouette.',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'hyundai-creta',
    name: 'Hyundai Creta / Tucson (SUV)',
    expectedMake: 'Hyundai',
    expectedModel: 'Creta / Tucson',
    category: 'Midsize SUV',
    description: 'Parametric jewel front grille and muscular wheel arches in metallic grey/silver finish.',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'mahindra-scorpio',
    name: 'Mahindra Scorpio / Off-Roader',
    expectedMake: 'Mahindra / Rugged 4x4',
    expectedModel: 'Scorpio / Thar / Off-Road SUV',
    category: 'Rugged 4x4 SUV',
    description: 'High ground clearance, aggressive stance, bold vertical-slat grille and muscular hood.',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'maruti-swift',
    name: 'Maruti Suzuki Swift (Hatchback)',
    expectedMake: 'Maruti Suzuki',
    expectedModel: 'Swift',
    category: 'Hatchback',
    description: 'Sporty compact hatchback with distinctive wraparound windshield and dynamic swept-back headlights.',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'toyota-fortuner',
    name: 'Toyota Fortuner / Land Cruiser (Full-Size SUV)',
    expectedMake: 'Toyota',
    expectedModel: 'Fortuner / Land Cruiser',
    category: 'Full-Size Premium SUV',
    description: 'Dominating front chrome grille, sleek bi-beam LED headlights, and Pearl White metallic paint.',
    imageUrl: 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'multi-car-scene',
    name: 'Multi-Vehicle Street Traffic',
    expectedMake: 'Multiple Brands',
    expectedModel: 'Multi-Car Detection',
    category: 'Multiple Vehicles Test',
    description: 'Urban street test scene with multiple vehicles to evaluate concurrent bounding box detection and classification.',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=300&q=80',
  },
];
