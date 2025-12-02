import { X } from 'lucide-react';
import { useState } from 'react';

interface Tag {
  id: string;
  label: string;
  color: 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'pink';
}

interface TagsInputProps {
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  placeholder?: string;
}

const colorClasses: Record<Tag['color'], string> = {
  blue: 'bg-blue-100 text-blue-800 border-blue-300',
  red: 'bg-red-100 text-red-800 border-red-300',
  green: 'bg-green-100 text-green-800 border-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  purple: 'bg-purple-100 text-purple-800 border-purple-300',
  pink: 'bg-pink-100 text-pink-800 border-pink-300',
};

const colors: Tag['color'][] = ['blue', 'red', 'green', 'yellow', 'purple', 'pink'];

export default function TagsInput({ tags, onTagsChange, placeholder = 'Ajouter un tag...' }: TagsInputProps) {
  const [input, setInput] = useState('');
  const [selectedColor, setSelectedColor] = useState<Tag['color']>('blue');

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      const newTag: Tag = {
        id: Date.now().toString(),
        label: input.trim(),
        color: selectedColor,
      };
      onTagsChange([...tags, newTag]);
      setInput('');
    }
  };

  const handleRemoveTag = (id: string) => {
    onTagsChange(tags.filter((tag) => tag.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value as Tag['color'])}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {colors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${colorClasses[tag.color]}`}
            >
              <span className="text-sm font-medium">{tag.label}</span>
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="hover:opacity-70 transition"
                aria-label={`Supprimer le tag ${tag.label}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
