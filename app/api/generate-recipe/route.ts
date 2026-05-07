// app/api/generate-recipe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('ERROR: GEMINI_API_KEY is not set');
      return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { recipeName, random } = await request.json();

    let prompt = '';
    if (random) {
      prompt = `Generate a random, interesting recipe. Return ONLY valid JSON (no markdown, no extra text) in this exact format:
{
  "recipeName": "Name of the dish",
  "prepTime": "15 minutes",
  "cookTime": "25 minutes",
  "servings": "4 servings",
  "ingredients": ["ingredient 1 with amount", "ingredient 2 with amount"],
  "steps": ["Step 1", "Step 2", "Step 3"],
  "tips": ["Tip 1", "Tip 2"]
}`;
    } else if (recipeName && recipeName.trim()) {
      prompt = `Generate a detailed recipe for "${recipeName.trim()}". Return ONLY valid JSON (no markdown, no extra text) in this exact format:
{
  "recipeName": "${recipeName.trim()}",
  "prepTime": "15 minutes",
  "cookTime": "25 minutes",
  "servings": "4 servings",
  "ingredients": ["ingredient 1 with amount", "ingredient 2 with amount"],
  "steps": ["Step 1", "Step 2", "Step 3"],
  "tips": ["Tip 1", "Tip 2"]
}`;
    } else {
      return NextResponse.json({ error: 'Missing recipe name' }, { status: 400 });
    }

    
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" }); // dito papalit version kapag error
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let recipe;
    if (jsonMatch) {
      recipe = JSON.parse(jsonMatch[0]);
    } else {
      recipe = JSON.parse(text);
    }

    return NextResponse.json({
      recipeName: recipe.recipeName || (random ? 'Surprise Dish' : recipeName),
      prepTime: recipe.prepTime || '20 min',
      cookTime: recipe.cookTime || '30 min',
      servings: recipe.servings || '4',
      ingredients: recipe.ingredients || ['No ingredients returned'],
      steps: recipe.steps || ['No steps returned'],
      tips: recipe.tips || [],
    });
  } catch (err: any) {
    console.error('ERROR in /api/generate-recipe:', err.message);
    return NextResponse.json({ error: err.message || 'Failed to generate recipe' }, { status: 500 });
  }
}