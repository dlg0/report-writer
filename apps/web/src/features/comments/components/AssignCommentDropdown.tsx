import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/lib/convex';
import type { Id } from 'convex/_generated/dataModel';

interface AssignCommentDropdownProps {
  projectId: Id<'projects'>;
  currentAssigneeType?: 'human' | 'agent';
  currentAssigneeUserId?: Id<'users'>;
  onAssign: (assigneeType: 'human' | 'agent', userId?: Id<'users'>) => void;
}

export function AssignCommentDropdown({
  projectId,
  currentAssigneeType,
  currentAssigneeUserId,
  onAssign,
}: AssignCommentDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const projectMembers = useQuery(api.tables.projectMembers.listByProject, { projectId });

  const handleSelect = (type: 'human' | 'agent', userId?: Id<'users'>) => {
    onAssign(type, userId);
    setIsOpen(false);
  };

  const currentLabel = currentAssigneeType === 'agent'
    ? '🤖 Agent'
    : currentAssigneeUserId
    ? `👤 ${currentAssigneeUserId}`
    : 'Unassigned';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
      >
        {currentLabel}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-48 bg-white border rounded-md shadow-lg z-20">
            <div className="py-1">
              <button
                onClick={() => handleSelect('agent')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                🤖 Agent
              </button>
              <div className="border-t my-1" />
              {projectMembers?.map((member: any) => (
                <button
                  key={member.userId}
                  onClick={() => handleSelect('human', member.userId)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  👤 {member.userId}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
