import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { CommentForm } from './CommentForm';
import type { Id } from 'convex/_generated/dataModel';

interface CreateCommentButtonProps {
  projectId: Id<'projects'>;
  sectionId?: Id<'sections'>;
  blockId?: Id<'blocks'>;
  onCreate: (data: {
    body: string;
    assigneeType?: 'human' | 'agent';
    assigneeUserId?: Id<'users'>;
    linkedSections?: Id<'sections'>[];
  }) => void;
}

export function CreateCommentButton({
  projectId,
  sectionId,
  blockId,
  onCreate,
}: CreateCommentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (data: any) => {
    onCreate(data);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} size="sm" variant="outline">
        💬 Add Comment
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Create Comment</h3>
        <CommentForm
          projectId={projectId}
          sectionId={sectionId}
          blockId={blockId}
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
}
