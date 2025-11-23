import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';

interface ResolveCommentButtonProps {
  onResolve: (summary?: string) => void;
}

export function ResolveCommentButton({ onResolve }: ResolveCommentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState('');

  const handleResolve = () => {
    onResolve(summary.trim() || undefined);
    setSummary('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} size="sm" variant="outline">
        ✓ Resolve
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Resolve Comment</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Resolution Summary (Optional)
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe how this was resolved..."
              className="w-full px-3 py-2 border rounded-md min-h-[100px]"
              autoFocus
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve}>
              Resolve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
