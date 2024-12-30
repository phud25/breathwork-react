import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FavoritePattern } from "@db/schema";

interface SaveFavoriteRequest {
  name: string;
  sequence: number[];
  isQuickSave?: boolean;
}

export function useFavorites() {
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery<FavoritePattern[]>({
    queryKey: ['/api/favorites'],
  });

  const saveFavoriteMutation = useMutation({
    mutationFn: async (data: SaveFavoriteRequest) => {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    },
  });

  const deleteFavoriteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/favorites/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    },
  });

  return {
    favorites,
    isLoading,
    saveFavorite: saveFavoriteMutation.mutateAsync,
    deleteFavorite: deleteFavoriteMutation.mutateAsync,
  };
}
