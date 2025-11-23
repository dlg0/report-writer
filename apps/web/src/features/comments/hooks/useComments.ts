import { useQuery, useMutation } from 'convex/react';
import { api } from '@/lib/convex';
import type { Id } from 'convex/_generated/dataModel';

export function useComments(projectId: Id<'projects'>, filters?: {
  status?: 'open' | 'resolved' | 'deferred';
  assigneeUserId?: Id<'users'>;
  assigneeType?: 'human' | 'agent';
}) {
  const comments = useQuery(api.tables.comments.listByProject, {
    projectId,
    ...filters,
  });

  const createComment = useMutation(api.tables.comments.create);
  const updateComment = useMutation(api.tables.comments.update);
  const resolveComment = useMutation(api.tables.comments.resolve);
  const assignToAgent = useMutation(api.tables.comments.assignToAgent);
  const assignToUser = useMutation(api.tables.comments.assignToUser);

  return {
    comments,
    createComment,
    updateComment,
    resolveComment,
    assignToAgent,
    assignToUser,
  };
}
