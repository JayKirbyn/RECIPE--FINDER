// components/ResultScreen.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, ArrowLeft, X } from 'lucide-react';

interface Recipe {
  name: string;
  category: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  detectedIngredients: string[];
  ingredients: string[];
  steps: string[];
  tips: string[];
}

interface ResultScreenProps {
  result: { recipes: Recipe[] };
  onBack: () => void;
}

export default function ResultScreen({ result, onBack }: ResultScreenProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const recipes = result.recipes || [];

  // Group recipes by category
  const grouped = recipes.reduce((acc, recipe) => {
    const cat = recipe.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(recipe);
    return acc;
  }, {} as Record<string, Recipe[]>);

  for (const cat in grouped) {
    if (grouped[cat].length > 5) grouped[cat] = grouped[cat].slice(0, 5);
  }

  const openModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 relative">
      {/* Background image */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1170&auto=format&fit=crop"
          alt="Food background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-white/80 hover:text-white">
          <ArrowLeft size={20} /> Back to Home
        </button>

        {/* Heading + Legend row - with larger legend pill */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-bold text-white">Recipe Suggestions</h1>
          {/* Legend – bigger text, more padding */}
          <div className="flex flex-wrap gap-4 text-sm text-white/80 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="flex items-center gap-1.5">⏱️ Prep time</span>
            <span className="flex items-center gap-1.5">🍳 Cook time</span>
            <span className="flex items-center gap-1.5">👥 Servings</span>
          </div>
        </div>

        {Object.entries(grouped).map(([category, recipes]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 border-l-4 border-primary-yellow pl-3">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {recipes.map((recipe, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  whileHover={{ y: -4 }}
                  onClick={() => openModal(recipe)}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg cursor-pointer hover:shadow-xl transition-all flex flex-col h-full active:scale-95"
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{recipe.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs bg-primary-yellow/20 text-primary-yellow-dark px-2 py-0.5 rounded-full">{recipe.category}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-auto">
                    <span>⏱️ {recipe.prepTime}</span>
                    <span>🍳 {recipe.cookTime}</span>
                    <span>👥 {recipe.servings}</span>
                  </div>
                  <div className="mt-3 text-primary-yellow text-sm font-medium flex items-center gap-1">
                    View Recipe
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(grouped).length === 0 && <p className="text-white text-center">No recipes found. Please try again.</p>}
      </div>

      {/* Modal overlay */}
      <AnimatePresence>
        {isModalOpen && selectedRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8"
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
              >
                <X size={20} />
              </button>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 pr-8">{selectedRecipe.name}</h1>
              <div className="flex flex-wrap gap-2 mt-2 mb-4">
                <span className="bg-primary-yellow/20 text-primary-yellow-dark px-3 py-1 rounded-full text-sm font-semibold">
                  {selectedRecipe.category}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-1.5 bg-white/50 rounded-full px-3 py-1.5 text-sm">
                  <Clock size={16} className="text-primary-yellow" /> Prep: {selectedRecipe.prepTime}
                </div>
                <div className="flex items-center gap-1.5 bg-white/50 rounded-full px-3 py-1.5 text-sm">
                  <Clock size={16} className="text-primary-yellow" /> Cook: {selectedRecipe.cookTime}
                </div>
                <div className="flex items-center gap-1.5 bg-white/50 rounded-full px-3 py-1.5 text-sm">
                  <Users size={16} className="text-primary-yellow" /> Serves: {selectedRecipe.servings}
                </div>
              </div>

              {selectedRecipe.detectedIngredients.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Detected Ingredients</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.detectedIngredients.map((ing, i) => (
                      <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">{ing}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">📝 Ingredients</h3>
                  <ul className="space-y-1">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex gap-2 text-gray-700">
                        <span className="text-primary-yellow">•</span> {ing}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">👨‍🍳 Steps</h3>
                  <ol className="space-y-3">
                    {selectedRecipe.steps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-6 h-6 bg-primary-yellow text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {selectedRecipe.tips.length > 0 && (
                <div className="bg-yellow-50 rounded-xl p-4 border-l-4 border-primary-yellow">
                  <h3 className="font-bold mb-2">💡 Tips</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {selectedRecipe.tips.map((tip, i) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}