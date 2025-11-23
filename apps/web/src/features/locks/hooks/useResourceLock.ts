import { useLock, type UseLockResult } from './useLock';
import type { Id } from 'convex/_generated/dataModel';

export function useResourceLock(
  resourceType: 'section' | 'block' | 'thread',
  resourceId: string | null | undefined,
  projectId: Id<'projects'> | null | undefined
): UseLockResult | null {
  const result = useLock(
    resourceType,
    resourceId ?? '',
    projectId ?? ('' as Id<'projects'>)
  );

  if (!resourceId || !projectId) {
    return null;
  }

  return result;
}
