export interface Item {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
  userId: string;
  createdAt: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  interestedIn: string[];  // Categories or specific items the user is interested in trading for
}

export interface User {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  rating: number;
  completedSwaps: number;
  items: Item[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface SwapProposal {
  id: string;
  proposerId: string;
  receiverId: string;
  proposedItemId: string;
  requestedItemId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  messages: Message[];
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  swapProposalId: string;
} 