import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listingService';
import { Item } from '../types';

export const useUserListings = () => {
  return useQuery<Item[]>({
    queryKey: ['userListings'],
    queryFn: listingService.getListings,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true, // Refetch when the window regains focus
  });
}; 