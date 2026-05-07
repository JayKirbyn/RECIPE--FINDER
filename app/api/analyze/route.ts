// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();
    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const base64Data = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

    const prompt = `You are a professional chef. Analyze this food image and generate recipe ideas using the visible ingredients as main components.
    Return ONLY valid JSON (no extra text) in this exact format:

{
  "recipes": [
    { "name": "...", "category": "Dessert", "prepTime": "...", "cookTime": "...", "servings": "...", "detectedIngredients": [...], "ingredients": [...], "steps": [...], "tips": [...] },
    ... repeat for each recipe
  ]
}

Requirements:
- Provide exactly 5 recipes for EACH of the following categories: "Dessert", "Main Dish", "Side Dish", "Appetizer", "Breakfast". That's 25 recipes total.
- Use the detected ingredients creatively; you may add common pantry items.
- Each recipe must have realistic prep/cook times and servings.
- Each recipe's "detectedIngredients" should list only ingredients visible in the image (at least 2-3).
- Each recipe should have 4-8 steps and 2-3 tips.
- Ensure variety within each category.
- Output valid JSON only. No markdown, no extra text.`;

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" }); //palit version kapag error
    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: "image/jpeg", data: base64Data } }
    ]);

    const response = await result.response;
    const text = response.text();
    console.log("Raw Gemini response length:", text.length);

   
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    let data;
    if (jsonMatch) {
      data = JSON.parse(jsonMatch[0]);
    } else {
      data = JSON.parse(text);
    }

    let recipes = data.recipes || [];

    
    if (recipes.length < 25) {
      console.warn(`Only ${recipes.length} recipes returned. Adding fallbacks.`);
      
      const categories = ["Dessert", "Main Dish", "Side Dish", "Appetizer", "Breakfast"];
      for (const cat of categories) {
        const existing = recipes.filter((r: any) => r.category === cat).length;
        for (let i = existing; i < 5; i++) {
          recipes.push({
            name: `${cat} Option ${i+1}`,
            category: cat,
            prepTime: "15 min",
            cookTime: "20 min",
            servings: "2",
            detectedIngredients: ["main ingredient"],
            ingredients: ["Ingredient 1", "Ingredient 2"],
            steps: ["Step 1", "Step 2"],
            tips: ["Tip 1"]
          });
        }
      }
    }

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error('Error:', error);
    
    return NextResponse.json({
      recipes: []
    });
  }
}