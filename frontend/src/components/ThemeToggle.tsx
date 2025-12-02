import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors ${
        isDark ? 'bg-gray-700' : 'bg-gray-300'
      }`}
      aria-label={isDark ? 'Passer au mode clair' : 'Passer au mode sombre'}
    >
      <span
        className={`inline-flex items-center justify-center h-7 w-7 transform rounded-full bg-white transition-transform ${
          isDark ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      >
        {isDark ? (
          <Moon size={16} className="text-gray-800" />
        ) : (
          <Sun size={16} className="text-yellow-500" />
        )}
      </span>
    </button>
  );
}
