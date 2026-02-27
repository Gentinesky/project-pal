export interface Property {
  id: string;
  title: string;
  type: "apartment" | "bedsitter" | "single-room" | "house";
  location: string;
  area: string;
  price: number;
  rooms: number;
  available: boolean;
  image: string;
  landlordName: string;
  landlordPhone: string;
  description: string;
  amenities: string[];
  utilities: {
    water: { available: boolean; cost: number };
    electricity: { type: "prepaid" | "monthly"; cost?: number };
    wifi: { available: boolean; cost?: number };
    garbage: { cost: number };
  };
  postedDate: string;
}

export const properties: Property[] = [
  {
    id: "1",
    title: "Modern 1BR Apartment in Kilimani",
    type: "apartment",
    location: "Kilimani, Nairobi",
    area: "Kilimani",
    price: 25000,
    rooms: 1,
    available: true,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
    landlordName: "John Kamau",
    landlordPhone: "+254 712 345 678",
    description: "A spacious, well-lit 1-bedroom apartment in the heart of Kilimani. Close to shopping centers and public transport. Secure compound with 24/7 security.",
    amenities: ["Parking", "Security", "Balcony", "Hot Water"],
    utilities: {
      water: { available: true, cost: 800 },
      electricity: { type: "prepaid" },
      wifi: { available: true, cost: 3500 },
      garbage: { cost: 300 },
    },
    postedDate: "2026-02-20",
  },
  {
    id: "2",
    title: "Cozy Bedsitter in Roysambu",
    type: "bedsitter",
    location: "Roysambu, Nairobi",
    area: "Roysambu",
    price: 8000,
    rooms: 1,
    available: true,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
    landlordName: "Mary Wanjiku",
    landlordPhone: "+254 723 456 789",
    description: "Affordable bedsitter ideal for students and young professionals. Walking distance to TRM mall and matatu stage.",
    amenities: ["Security", "Water Tank"],
    utilities: {
      water: { available: true, cost: 500 },
      electricity: { type: "prepaid" },
      wifi: { available: false },
      garbage: { cost: 200 },
    },
    postedDate: "2026-02-22",
  },
  {
    id: "3",
    title: "Spacious 2BR in South B",
    type: "apartment",
    location: "South B, Nairobi",
    area: "South B",
    price: 35000,
    rooms: 2,
    available: true,
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80",
    landlordName: "Peter Odhiambo",
    landlordPhone: "+254 734 567 890",
    description: "Beautiful 2-bedroom apartment with master ensuite. Gated community with children's play area. Near Capital Centre.",
    amenities: ["Parking", "Security", "Gym", "Playground", "Lift"],
    utilities: {
      water: { available: true, cost: 1200 },
      electricity: { type: "monthly", cost: 3000 },
      wifi: { available: true, cost: 4000 },
      garbage: { cost: 400 },
    },
    postedDate: "2026-02-18",
  },
  {
    id: "4",
    title: "Single Room in Githurai",
    type: "single-room",
    location: "Githurai 45, Nairobi",
    area: "Githurai",
    price: 4500,
    rooms: 1,
    available: false,
    image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&q=80",
    landlordName: "Grace Njeri",
    landlordPhone: "+254 745 678 901",
    description: "Clean single room in a quiet neighborhood. Shared bathroom. Close to the main road.",
    amenities: ["Security"],
    utilities: {
      water: { available: true, cost: 300 },
      electricity: { type: "prepaid" },
      wifi: { available: false },
      garbage: { cost: 150 },
    },
    postedDate: "2026-02-15",
  },
  {
    id: "5",
    title: "Executive 3BR in Westlands",
    type: "house",
    location: "Westlands, Nairobi",
    area: "Westlands",
    price: 65000,
    rooms: 3,
    available: true,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
    landlordName: "David Mwangi",
    landlordPhone: "+254 756 789 012",
    description: "Luxury 3-bedroom house with a private garden. Modern finishes, spacious living area with DSQ. Walking distance to Westgate Mall.",
    amenities: ["Parking", "Security", "Garden", "DSQ", "Hot Water", "Backup Generator"],
    utilities: {
      water: { available: true, cost: 2000 },
      electricity: { type: "monthly", cost: 5000 },
      wifi: { available: true, cost: 5000 },
      garbage: { cost: 500 },
    },
    postedDate: "2026-02-25",
  },
  {
    id: "6",
    title: "Studio Apartment in Langata",
    type: "bedsitter",
    location: "Langata, Nairobi",
    area: "Langata",
    price: 15000,
    rooms: 1,
    available: true,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
    landlordName: "Agnes Chebet",
    landlordPhone: "+254 767 890 123",
    description: "Modern studio with open-plan kitchen. Secure estate near Galleria Mall. Ideal for couples or single professionals.",
    amenities: ["Parking", "Security", "Hot Water", "CCTV"],
    utilities: {
      water: { available: true, cost: 700 },
      electricity: { type: "prepaid" },
      wifi: { available: true, cost: 3000 },
      garbage: { cost: 250 },
    },
    postedDate: "2026-02-24",
  },
];

export const locations = ["All Locations", "Kilimani", "Roysambu", "South B", "Githurai", "Westlands", "Langata"];
export const propertyTypes = ["All Types", "apartment", "bedsitter", "single-room", "house"];
