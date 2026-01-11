import { Skeleton } from '@/components/ui/skeleton';

const GalleryImageSkeleton = () => {
  return (
    <div className="relative overflow-hidden rounded-xl">
      <Skeleton className="w-full h-48 md:h-56" />
    </div>
  );
};

export const GallerySkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <GalleryImageSkeleton key={i} />
      ))}
    </div>
  );
};

export default GalleryImageSkeleton;
