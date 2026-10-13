import React from 'react';
import { AppCategory } from '../types/app';

interface CategoryFilterProps {
  categories: AppCategory[];
  selectedCategory: AppCategory;
  onSelectCategory: (category: AppCategory) => void;
  categoryCounts: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-lg font-display font-bold text-white tracking-tight">
          Browse Categories
        </h2>
        <span className="text-[10px] sm:text-xs text-stone-400">Filter by category</span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = categoryCounts[cat] || 0;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`whitespace-nowrap px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 font-bold'
                  : 'bg-[#18120e]/80 text-stone-300 hover:text-amber-300 hover:bg-[#231a14] border border-amber-500/15'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded ${
                  isSelected ? 'bg-black/20 text-black font-mono' : 'bg-stone-900 text-stone-400 font-mono'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
