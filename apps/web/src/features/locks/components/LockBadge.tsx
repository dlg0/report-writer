import { useQuery } from 'convex/react';
import { api } from '@/lib/convex';
import { useLock } from '../hooks/useLock';
import type { Id } from 'convex/_generated/dataModel';

interface LockBadgeProps {
  resourceType: 'section' | 'block' | 'thread';
  resourceId: string;
  projectId: Id<'projects'>;
  className?: string;
}

export function LockBadge({
  resourceType,
  resourceId,
  projectId,
  className = '',
}: LockBadgeProps) {
  const { lockStatus, lockOwner } = useLock(resourceType, resourceId, projectId);
  const owner = useQuery(
    api.tables.users.getById,
    lockOwner ? { id: lockOwner } : 'skip'
  );

  if (lockStatus === 'available') {
    return null;
  }

  const getBadgeColor = () => {
    if (lockStatus === 'acquired') return 'bg-green-500';
    if (lockStatus === 'blocked') return 'bg-red-500';
    return 'bg-gray-400';
  };

  const getLockIcon = () => '🔒';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor()} text-white ${className}`}
    >
      <span>{getLockIcon()}</span>
      <span>
        {lockStatus === 'acquired'
          ? 'You'
          : owner?.name || 'Another user'}
      </span>
    </div>
  );
}
