// app/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Scan, Camera, Search, Shuffle, X, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import CameraModal from '@/components/CameraModal';
import ResultScreen from '@/components/ResultScreen';
import LoadingIndicator from '@/components/LoadingIndicator';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { scrollYProgress } = useScroll();

  // State for search feature
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // State for surprise recipe
  const [surpriseRecipe, setSurpriseRecipe] = useState<any>(null);
  const [surpriseLoading, setSurpriseLoading] = useState(false);
  const [isSurpriseModalOpen, setIsSurpriseModalOpen] = useState(false);

  const buttonOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const buttonScale = useTransform(scrollYProgress, [0, 0.08], [1, 0.8]);
  const buttonVisibility = useTransform(buttonOpacity, (value) =>
    value > 0 ? 'visible' : 'hidden'
  );

  const handleScan = () => setIsModalOpen(true);

  // Direct analysis after capture/upload – no category selection
  const handleImageCapture = async (imageBase64: string) => {
    setIsModalOpen(false);
    setIsLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, category: 'any' }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      alert('Failed to analyze image');
    } finally {
      setIsLoading(false);
    }
  };

  // Search recipe by name
  const searchRecipeByName = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeName: searchQuery }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSearchResult(data);
      setIsSearchModalOpen(true);
    } catch (error) {
      alert('Failed to fetch recipe');
    } finally {
      setSearchLoading(false);
    }
  };

  // Surprise recipe
  const getSurpriseRecipe = async () => {
    setSurpriseLoading(true);
    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ random: true }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSurpriseRecipe(data);
      setIsSurpriseModalOpen(true);
    } catch (error) {
      alert('Failed to get surprise recipe');
    } finally {
      setSurpriseLoading(false);
    }
  };

  const resetToHome = () => {
    setResult(null);
    setSearchResult(null);
    setSurpriseRecipe(null);
    setIsSearchModalOpen(false);
    setIsSurpriseModalOpen(false);
  };

  if (isLoading) return <LoadingIndicator />;
  if (result) return <ResultScreen result={result} onBack={resetToHome} />;

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1170&auto=format&fit=crop"
          alt="Food background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10">
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-primary-yellow origin-left z-50"
          style={{ scaleX: scrollYProgress }}
        />

        {/* Hero section */}
        <section className="relative min-h-screen flex items-center justify-center text-center">
          <div className="max-w-4xl mx-auto px-6 py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Logo replaces the text RECIPE FINDER */}
              <div className="flex justify-center mb-6">
                <img
                  src="/my-logo.png"
                  alt="Recipe Finder Logo"
                  className="w-auto max-h-auto"
                  style={{ maxHeight: '375px' }}
                />
              </div>

              <p className="text-white text-lg md:text-xl mt-6 max-w-2xl mx-auto">
                Capture your ingredients, discover recipes instantly, and cook smarter 
              </p>
              <motion.button
                style={{
                  opacity: buttonOpacity,
                  scale: buttonScale,
                  visibility: buttonVisibility,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleScan}
                className="mt-8 bg-primary-yellow text-white font-bold px-8 py-3 rounded-full text-lg shadow-glow transition inline-flex items-center gap-2"
              >
                <Scan size={20} /> Scan Ingredients Now
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white">Features</h2>
              <div className="w-24 h-1 bg-primary-yellow mx-auto mt-4 rounded-full" />
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1: Snap & Cook */}
              <FeatureCard
                icon={Camera}
                title="Snap & Cook"
                description="Take a photo of your ingredients or upload from gallery. Our AI turns them into delicious recipes."
                actionLabel="Start Cooking"
                onAction={handleScan}
              />

              {/* Card 2: Search Recipe */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-card hover:shadow-premium transition-all duration-300 flex flex-col">
                <div className="bg-primary-yellow w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Search Recipe</h3>
                <p className="text-gray-600 text-center mb-4">Type a dish name and get full steps instantly.</p>
                <div className="flex gap-2 mt-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchRecipeByName()}
                    placeholder="e.g., chicken curry"
                    className="flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  />
                  <button
                    onClick={searchRecipeByName}
                    disabled={searchLoading}
                    className="bg-primary-yellow text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition disabled:opacity-50"
                  >
                    {searchLoading ? '...' : 'Go'}
                  </button>
                </div>
              </div>

              {/* Card 3: Surprise Me */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-card hover:shadow-premium transition-all duration-300 flex flex-col text-center">
                <div className="bg-primary-yellow w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shuffle className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Surprise Me!</h3>
                <p className="text-gray-600 mb-4">Feeling lucky? Get a random recipe with full instructions.</p>
                <button
                  onClick={getSurpriseRecipe}
                  disabled={surpriseLoading}
                  className="mt-auto bg-primary-yellow text-white py-2 rounded-xl hover:bg-yellow-600 transition disabled:opacity-50"
                >
                  {surpriseLoading ? 'Generating...' : 'Generate Surprise'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Camera Modal */}
        {isModalOpen && (
          <CameraModal onClose={() => setIsModalOpen(false)} onCapture={handleImageCapture} />
        )}
      </div>

      {/* Search Result Modal */}
      <AnimatePresence>
        {isSearchModalOpen && searchResult && (
          <RecipeModal recipe={searchResult} onClose={() => setIsSearchModalOpen(false)} />
        )}
      </AnimatePresence>

      {/* Surprise Recipe Modal */}
      <AnimatePresence>
        {isSurpriseModalOpen && surpriseRecipe && (
          <RecipeModal recipe={surpriseRecipe} onClose={() => setIsSurpriseModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// FeatureCard component
function FeatureCard({ icon: Icon, title, description, actionLabel, onAction }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0 }}
      whileHover={{ y: -8 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-card hover:shadow-premium transition-all duration-300 flex flex-col text-center"
    >
      <div className="bg-primary-yellow w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <button
        onClick={onAction}
        className="mt-auto bg-primary-yellow text-white py-2 rounded-xl hover:bg-yellow-600 transition"
      >
        {actionLabel}
      </button>
    </motion.div>
  );
}

// Recipe Modal component
function RecipeModal({ recipe, onClose }: { recipe: any; onClose: () => void }) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
        >
          <X size={20} />
        </button>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 pr-8">{recipe.recipeName}</h1>

        <div className="flex flex-wrap gap-3 mt-4 mb-6">
          <div className="flex items-center gap-1.5 bg-white/50 rounded-full px-3 py-1.5 text-sm">
            <Clock size={16} className="text-primary-yellow" /> Prep: {recipe.prepTime}
          </div>
          <div className="flex items-center gap-1.5 bg-white/50 rounded-full px-3 py-1.5 text-sm">
            <Clock size={16} className="text-primary-yellow" /> Cook: {recipe.cookTime}
          </div>
          <div className="flex items-center gap-1.5 bg-white/50 rounded-full px-3 py-1.5 text-sm">
            <Users size={16} className="text-primary-yellow" /> Serves: {recipe.servings}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="text-xl font-bold mb-3">📝 Ingredients</h3>
            <ul className="space-y-1">
              {recipe.ingredients?.map((ing: string, i: number) => (
                <li key={i} className="flex gap-2 text-gray-700">
                  <span className="text-primary-yellow">•</span> {ing}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3">👨‍🍳 Steps</h3>
            <ol className="space-y-3">
              {recipe.steps?.map((step: string, i: number) => (
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

        {recipe.tips && recipe.tips.length > 0 && (
          <div className="bg-yellow-50 rounded-xl p-4 border-l-4 border-primary-yellow">
            <h3 className="font-bold mb-2">💡 Tips</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              {recipe.tips.map((tip: string, i: number) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}