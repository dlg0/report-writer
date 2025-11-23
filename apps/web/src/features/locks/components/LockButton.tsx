import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { useLock } from '../hooks/useLock';
import type { Id } from 'convex/_generated/dataModel';

interface LockButtonProps {
  resourceType: 'section' | 'block' | 'thread';
  resourceId: string;
  projectId: Id<'projects'>;
  className?: string;
}

export function LockButton({
  resourceType,
  resourceId,
  projectId,
  className,
}: LockButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const { lockStatus, acquire, release } = useLock(
    resourceType,
    resourceId,
    projectId
  );

  const handleClick = async () => {
    setIsPending(true);
    try {
      if (lockStatus === 'acquired') {
        await release();
      } else if (lockStatus === 'available') {
        await acquire();
      }
    } catch (error) {
      console.error('Lock operation failed:', error);
    } finally {
      setIsPending(false);
    }
  };

  const getButtonText = () => {
    if (isPending) return 'Processing...';
    if (lockStatus === 'acquired') return 'Unlock';
    if (lockStatus === 'blocked') return 'Locked by another user';
    return 'Lock';
  };

  const getButtonVariant = () => {
    if (lockStatus === 'acquired') return 'secondary';
    if (lockStatus === 'blocked') return 'outline';
    return 'default';
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isPending || lockStatus === 'blocked'}
      variant={getButtonVariant()}
      size="sm"
      className={className}
    >
      {getButtonText()}
    </Button>
  );
}
