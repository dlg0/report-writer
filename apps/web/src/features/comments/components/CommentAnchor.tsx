import { cn } from '@/shared/utils/cn';

interface CommentAnchorProps {
  commentCount: number;
  onClick: () => void;
  isActive?: boolean;
}

export function CommentAnchor({ commentCount, onClick, isActive }: CommentAnchorProps) {
  if (commentCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'absolute -left-8 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
        'transition-all hover:scale-110',
        isActive
          ? 'bg-blue-500 text-white'
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      )}
      title={`${commentCount} comment${commentCount > 1 ? 's' : ''}`}
    >
      {commentCount}
    </button>
  );
}
