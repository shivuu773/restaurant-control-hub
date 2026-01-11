import { Skeleton } from '@/components/ui/skeleton';

const MenuItemSkeleton = () => {
  return (
    <div className="menu-item-card overflow-hidden">
      <Skeleton className="w-full h-48" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
};

export const MenuSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Category tabs skeleton */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-24 rounded-full" />
        ))}
      </div>
      
      {/* Category header skeleton */}
      <div className="text-center space-y-2">
        <Skeleton className="h-4 w-16 mx-auto" />
        <Skeleton className="h-8 w-32 mx-auto" />
      </div>
      
      {/* Menu items grid skeleton */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <MenuItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export default MenuItemSkeleton;
