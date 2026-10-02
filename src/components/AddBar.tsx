import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddBarProps {
  onAddTask: (title: string) => void;
  hasPanelOpen?: boolean;
}

export const AddBar: React.FC<AddBarProps> = ({ onAddTask, hasPanelOpen }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;
    onAddTask(title.trim());
    setTitle('');
  };

  return (
    <div
      className={`fixed left-0 right-0 bottom-0 z-20 px-6 pt-4 pb-[calc(18px+env(safe-area-inset-bottom,0px))] bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/95 to-transparent pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
        hasPanelOpen ? 'lg:right-[480px]' : ''
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className="pointer-events-auto max-w-[512px] mx-auto flex items-center gap-3 bg-calma-surface rounded-full py-2 pl-6 pr-2 shadow-lg border border-calma-line/60 focus-within:ring-2 focus-within:ring-calma-accent focus-within:border-transparent transition-all"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Añadir una tarea"
          className="flex-1 min-w-0 bg-transparent border-0 outline-none text-calma-ink placeholder:text-calma-muted text-[15.5px] py-1"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="w-10 h-10 rounded-full bg-calma-accent text-white flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 flex-none"
          aria-label="Añadir tarea"
        >
          <Plus className="w-5 h-5 stroke-[2.2]" />
        </button>
      </form>
    </div>
  );
};
