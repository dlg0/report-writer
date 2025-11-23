import { Card } from '@/shared/components/ui/Card';
import { AssignCommentDropdown } from './AssignCommentDropdown';
import { ResolveCommentButton } from './ResolveCommentButton';
import type { Id } from 'convex/_generated/dataModel';
import { cn } from '@/shared/utils/cn';

interface CommentThreadProps {
  comment: any;
  onAssign: (assigneeType: 'human' | 'agent', userId?: Id<'users'>) => void;
  onResolve: (summary?: string) => void;
  onCreateThread?: () => void;
  onClick?: () => void;
}

export function CommentThread({
  comment,
  onAssign,
  onResolve,
  onCreateThread,
  onClick,
}: CommentThreadProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer hover:border-primary transition-colors',
        comment.status === 'resolved' && 'opacity-60'
      )}
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{comment.author?.name || 'Unknown'}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground text-xs">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            {comment.section && (
              <div className="text-xs text-muted-foreground mt-1">
                📍 {comment.section.headingText}
                {comment.block && ' (Block)'}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                'px-2 py-0.5 text-xs rounded',
                comment.status === 'open'
                  ? 'bg-green-100 text-green-700'
                  : comment.status === 'resolved'
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-yellow-100 text-yellow-700'
              )}
            >
              {comment.status}
            </span>
          </div>
        </div>

        <p className="text-sm whitespace-pre-wrap">{comment.body}</p>

        <div className="flex items-center justify-between gap-2 pt-2 border-t">
          <AssignCommentDropdown
            projectId={comment.projectId}
            currentAssigneeType={comment.assigneeType}
            currentAssigneeUserId={comment.assigneeUserId}
            onAssign={onAssign}
          />

          <div className="flex items-center gap-2">
            {comment.assigneeType === 'agent' && comment.status === 'open' && onCreateThread && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateThread();
                }}
                className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
              >
                🤖 Create Thread
              </button>
            )}

            {comment.status === 'open' && (
              <div onClick={(e) => e.stopPropagation()}>
                <ResolveCommentButton onResolve={onResolve} />
              </div>
            )}
          </div>
        </div>

        {comment.status === 'resolved' && comment.resolutionSummary && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm">
            <div className="font-medium mb-1">Resolution:</div>
            <p className="text-muted-foreground">{comment.resolutionSummary}</p>
            {comment.resolvedBy && (
              <div className="text-xs text-muted-foreground mt-2">
                Resolved by {comment.resolvedBy.name} on {formatDate(comment.resolvedAt!)}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
