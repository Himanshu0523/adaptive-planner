/**
 * LLM Integration Service for Adaptive Planner
 * Supports Google Gemini (REST API) & OpenAI (REST API) with intelligent semantic fallback.
 */

export async function generatePlanWithLLM({
  title,
  category = "General",
  criteria = [],
  targetDate,
  hoursPerWeek = 8,
  selectedDays = ["Mon", "Tue", "Thu", "Sat"],
}) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const validCriteria = Array.isArray(criteria)
    ? criteria.filter((c) => Boolean(c && c.trim()))
    : [];

  const prompt = `
You are an expert personal planning coach and productivity architect.
The user wants to achieve this goal:
Goal: "${title}"
Category: "${category}"
Measurable Success Criteria: ${validCriteria.length > 0 ? validCriteria.join("; ") : "Self-directed mastery"}
Target Date: ${targetDate || "6 weeks from now"}
Available Focus Hours per Week: ${hoursPerWeek} hours
Preferred Focus Days: ${selectedDays.join(", ")}

Generate a realistic, adaptive 3-to-4 milestone plan broken down into actionable, bite-sized tasks (20-60 mins each).
Return strictly valid JSON with this exact schema:
{
  "milestones": [
    {
      "id": "m-1",
      "order": 1,
      "title": "Clear milestone title",
      "targetWeek": "Week 1–2",
      "tasks": [
        {
          "id": "t-101",
          "title": "Specific actionable task",
          "estimatedMinutes": 45
        }
      ]
    }
  ]
}
Do not include markdown fences or extraneous text, only raw valid JSON.
`;

  // 1. Try Google Gemini if key is available
  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed?.milestones?.length) return parsed;
        }
      }
    } catch (err) {
      console.warn("Gemini generation failed, trying next provider or semantic generator:", err.message);
    }
  }

  // 2. Try OpenAI if key is available
  if (openaiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const text = json.choices?.[0]?.message?.content;
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed?.milestones?.length) return parsed;
        }
      }
    } catch (err) {
      console.warn("OpenAI generation failed, falling back to semantic generator:", err.message);
    }
  }

  // 3. Intelligent Semantic Fallback (Dynamic based on user's exact inputs, NOT a static mock!)
  return generateSemanticPlan({
    title,
    category,
    criteria: validCriteria,
    targetDate,
    hoursPerWeek,
    selectedDays,
  });
}

/**
 * Deterministic Semantic Generator tailored specifically to the user's title and criteria
 */
function generateSemanticPlan({ title, category, criteria, hoursPerWeek, selectedDays }) {
  const cleanTitle = (title || "Custom Goal").trim();
  const criteriaList = Array.isArray(criteria) && criteria.length > 0
    ? criteria
    : ["Establish complete proficiency"];

  const safeDays = Array.isArray(selectedDays) && selectedDays.length > 0 ? selectedDays : ["Mon", "Wed", "Fri"];
  const safeHours = Number(hoursPerWeek) > 0 ? Number(hoursPerWeek) : 8;

  const avgTaskDuration = Math.min(
    Math.max(Math.round((safeHours * 60) / (safeDays.length * 2)), 25),
    60
  );

  const milestone1Tasks = [
    {
      id: `t-${Date.now()}-1`,
      title: `Audit core requirements and gather resources for "${cleanTitle.slice(0, 45)}"`,
      estimatedMinutes: avgTaskDuration,
    },
    {
      id: `t-${Date.now()}-2`,
      title: `Set up dedicated workspace and baseline schedule (${hoursPerWeek}h/wk target)`,
      estimatedMinutes: Math.round(avgTaskDuration * 0.75),
    },
    {
      id: `t-${Date.now()}-3`,
      title: `Complete initial discovery block for ${category || "General"} domain`,
      estimatedMinutes: avgTaskDuration,
    },
  ];

  const milestone2Tasks = criteriaList.map((crit, idx) => ({
    id: `t-${Date.now()}-20${idx}`,
    title: `Implement practical milestone: ${crit.slice(0, 60)}`,
    estimatedMinutes: avgTaskDuration,
  }));

  if (milestone2Tasks.length === 1) {
    milestone2Tasks.push({
      id: `t-${Date.now()}-209`,
      title: `Run mid-point progress check and document findings`,
      estimatedMinutes: Math.round(avgTaskDuration * 0.75),
    });
  }

  const milestone3Tasks = [
    {
      id: `t-${Date.now()}-301`,
      title: `Comprehensive validation and practical trial of ${cleanTitle.slice(0, 40)}`,
      estimatedMinutes: avgTaskDuration,
    },
    {
      id: `t-${Date.now()}-302`,
      title: `Refine edge cases and verify against success criteria: "${criteriaList[0]?.slice(0, 40)}"`,
      estimatedMinutes: avgTaskDuration,
    },
    {
      id: `t-${Date.now()}-303`,
      title: `Final retrospective and celebration milestone`,
      estimatedMinutes: 30,
    },
  ];

  return {
    milestones: [
      {
        id: `m-${Date.now()}-1`,
        order: 1,
        title: `Phase 1: Foundations & Preparation (${cleanTitle.slice(0, 35)})`,
        targetWeek: "Week 1–2",
        tasks: milestone1Tasks,
      },
      {
        id: `m-${Date.now()}-2`,
        order: 2,
        title: `Phase 2: Core Execution & Measurable Milestones`,
        targetWeek: "Week 3–4",
        tasks: milestone2Tasks,
      },
      {
        id: `m-${Date.now()}-3`,
        order: 3,
        title: `Phase 3: Validation, Polish & Goal Completion`,
        targetWeek: "Week 5–6",
        tasks: milestone3Tasks,
      },
    ],
  };
}
