import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// --- TYPE DEFINITIONS ---
interface PlanRequest {
  destination: string;
  days: number;
  budget: string;
  travelers: number;
  interests: string[];
}

// --- SMART FALLBACK GENERATOR ---
// This runs if OpenAI fails or no key is provided.
// It creates a realistic-looking plan based on the user's specific inputs.
const generateMockPlan = ({ destination, days, budget, travelers, interests }: PlanRequest) => {
  
  // Dynamic Activities based on Interest
  const activityMap: Record<string, string[]> = {
    "History": ["Ancient Fort Tour", "Museum Visit", "Heritage Walk", "Old City Market"],
    "Food": ["Street Food Tour", "Fine Dining Experience", "Local Cooking Class", "Café Hopping"],
    "Adventure": ["Hiking & Trekking", "Water Sports", "Zip-lining", "Mountain Biking"],
    "Relaxation": ["Spa Day", "Beach Sunset", "Yoga Session", "Leisurely Boat Ride"],
    "Nightlife": ["Rooftop Bar Hopping", "Live Music Club", "Night Market", "Cultural Show"],
    "Nature": ["Botanical Gardens", "Wildlife Safari", "Waterfall Hike", "Scenic Drive"]
  };

  // Generate Daily Itinerary
  const itinerary = Array.from({ length: days }).map((_, i) => {
    // Pick an interest for the day (cycle through user interests)
    const dayInterest = interests.length > 0 ? interests[i % interests.length] : "General";
    const specificActivities = activityMap[dayInterest] || ["City Sightseeing", "Local Shopping"];

    return {
      day: i + 1,
      title: `Day ${i + 1}: ${dayInterest} & Exploration in ${destination}`,
      activities: [
        `Morning: ${specificActivities[0] || "City Tour"}`,
        `Lunch: Enjoy a meal at a popular ${budget}-friendly spot`,
        `Afternoon: ${specificActivities[1] || "Visit Landmarks"}`,
        `Evening: Dinner and ${specificActivities[2] || "Relaxation"}`
      ]
    };
  });

  return {
    tripTitle: `The Ultimate ${days}-Day Trip to ${destination}`,
    summary: `A personalized ${budget} budget itinerary for ${travelers} traveler(s), focusing on ${interests.join(', ')}. Created by TripAI Fallback Engine.`,
    itinerary
  };
};

// --- API HANDLER ---
export async function POST(req: Request) {
  // Default values to prevent undefined errors
  let requestData: PlanRequest = {
    destination: "Unknown City",
    days: 3,
    budget: "Moderate",
    travelers: 2,
    interests: ["General"]
  };

  try {
    // 1. Parse Request
    const body = await req.json();
    requestData = { ...requestData, ...body }; // Merge defaults with actual data

    const apiKey = process.env.OPENAI_API_KEY;

    // 2. CHECK API KEY STATUS
    // If key is missing or is the placeholder, switch to Mock Mode immediately.
    if (!apiKey || apiKey.startsWith('sk-proj-YOUR-KEY') || apiKey.length < 10) {
      console.warn("⚠️  TripAI: No valid OpenAI Key found. Using Smart Fallback.");
      
      // Simulate "Thinking" delay for UX realism (2 seconds)
      await new Promise(r => setTimeout(r, 2000));
      
      return NextResponse.json(generateMockPlan(requestData));
    }

    // 3. CALL OPENAI (If Key Exists)
    const openai = new OpenAI({ apiKey });
    
    // Strict System Prompt to ensure JSON format
    const systemPrompt = `
      You are an expert travel planner. 
      Generate a travel itinerary in strictly valid JSON format. 
      Do not include markdown formatting like \`\`\`json or \`\`\`.
      
      Output Schema:
      {
        "tripTitle": "string",
        "summary": "string",
        "itinerary": [
          { "day": number, "title": "string", "activities": ["string", "string", "string"] }
        ]
      }
    `;

    const userPrompt = `
      Destination: ${requestData.destination}
      Duration: ${requestData.days} days
      Budget: ${requestData.budget}
      Travelers: ${requestData.travelers} person(s)
      Interests: ${requestData.interests.join(', ')}
      
      Create a detailed day-by-day plan.
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "gpt-3.5-turbo-0125", // Cost-effective & fast model
      response_format: { type: "json_object" }, // Enforce JSON mode
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      throw new Error("OpenAI returned empty response");
    }

    // 4. Return Real AI Response
    const aiResponse = JSON.parse(content);
    return NextResponse.json(aiResponse);

  } catch (error) {
    console.error("❌ TripAI Generator Error:", error);
    
    // 5. SAFETY NET: If OpenAI crashes (Rate Limit / 500 Error), use Mock Data
    console.log("🔄 Switching to Fallback Plan generator...");
    return NextResponse.json(generateMockPlan(requestData));
  }
}