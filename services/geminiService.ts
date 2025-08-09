import { GoogleGenAI, Type } from "@google/genai";
import type { TDDStructure, CoreFeature, ImplementationPlan } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const tddSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A concise, descriptive title for the document, suitable for use as a filename (e.g., 'User_Authentication_Flow_TDD'). Avoid special characters."
    },
    generalOverview: {
      type: Type.STRING,
      description: "A high-level summary of the project, its goals, and context. Must be in Markdown format.",
    },
    coreFeatures: {
      type: Type.ARRAY,
      description: "An array of core features to be implemented.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The name of the feature." },
          techSolution: { type: Type.STRING, description: "The proposed technical solution for this feature, in Markdown format with bullet points." },
          techNotes: { type: Type.STRING, description: "Important technical notes, constraints, or considerations, in Markdown format with bullet points." },
          dataChanges: { type: Type.STRING, description: "Details about database schema changes or data migration. If none, state 'No data changes required'. Use Markdown format." },
          diagram: { type: Type.STRING, description: "A complete and valid Mermaid.js flowchart definition using 'graph TD'. All link text must be in quotes (e.g., `A -- \"User Clicks\" --> B`). The string must contain ONLY the raw Mermaid diagram code, without any markdown fences like '```mermaid'." }
        },
        required: ["name", "techSolution", "techNotes", "dataChanges", "diagram"]
      }
    },
    appendix: {
      type: Type.OBJECT,
      properties: {
        newMetrics: { type: Type.STRING, description: "A list of new metrics to be tracked for analytics or monitoring. If none, state 'No new metrics'. Use Markdown format." },
        tools: { type: Type.STRING, description: "A list of new tools, libraries, or services required. If none, state 'No new tools required'. Use Markdown format." },
        compatibility: { type: Type.STRING, description: "Notes on backward compatibility, browser support, or device compatibility. If none, state 'No compatibility issues'. Use Markdown format." }
      },
      required: ["newMetrics", "tools", "compatibility"]
    }
  },
  required: ["title", "generalOverview", "coreFeatures", "appendix"]
};

const implementationPlanSchema = {
    type: Type.ARRAY,
    description: "A list of implementation plans, one for each core feature from the TDD.",
    items: {
        type: Type.OBJECT,
        properties: {
            featureName: { type: Type.STRING, description: "The name of the core feature from the TDD." },
            featuresToImplement: {
                type: Type.ARRAY,
                description: "A high-level list of functionalities for this feature.",
                items: { type: Type.STRING }
            },
            frontendSteps: {
                type: Type.ARRAY,
                description: "Detailed, step-by-step instructions for the frontend (ReactJS) developer.",
                items: { type: Type.STRING, description: "A clear, actionable step for a junior to mid-level developer. Suggest component names, hooks, and state management strategies." }
            },
            backendSteps: {
                type: Type.ARRAY,
                description: "Detailed, step-by-step instructions for the backend developer.",
                items: { type: Type.STRING, description: "A clear, actionable step. Describe API endpoints (e.g., 'POST /api/users'), data models, and business logic." }
            },
            integrationSteps: {
                type: Type.ARRAY,
                description: "Instructions on how the frontend and backend will communicate.",
                items: { type: Type.STRING, description: "Describe the API request/response contract. E.g., 'Frontend calls POST /api/users with a JSON body containing { name, email }. Backend responds with 201 and the created user object.'" }
            }
        },
        required: ["featureName", "featuresToImplement", "frontendSteps", "backendSteps", "integrationSteps"]
    }
};


export const generateAIPoweredAnalysis = async (requirementText: string): Promise<string> => {
  const prompt = `
    You are an expert AI Product Analyst and Solution Architect. Your task is to analyze a raw product or technical requirement and convert it into a structured, developer-ready Markdown document.

    The output MUST be clean, readable Markdown and strictly follow this format. Use the specified headers and emojis. For visual separation, place a Markdown divider ("---") between each major section.

    # 📌 Feature: [A concise, descriptive name for the feature]

    ---

    ## 🧠 Summary
    A one-paragraph summary of the feature's purpose and main function.

    ---

    ## ✅ Key Requirements
    A bulleted list of the core technical and functional requirements.
    - Requirement 1
    - Requirement 2

    ---

    ## 🔁 Flow (Frontend)
    A numbered list describing the sequence of events or user interactions from the frontend perspective.
    1. Step 1
    2. Step 2

    ---

    ## ⚠️ Edge Cases
    A bulleted list of potential edge cases, error states, or alternative scenarios.
    - Edge Case 1
    - Edge Case 2

    ---

    ## 🗺️ Flow Diagram
    A sequence diagram in valid Mermaid.js syntax that visualizes the primary user or data flow. The diagram MUST be enclosed in a 'mermaid' code block (e.g., \`\`\`mermaid\n...\n\`\`\`). For sequence diagrams, ensure correct participant and message syntax.

    ---

    **CRITICAL INSTRUCTIONS:**
    1.  **Dividers:** You MUST include a \`---\` divider between each H2-level section.
    2.  **Code Blocks:** If you generate any code snippets (e.g., JavaScript, JSON), you MUST enclose them in a fenced code block with the correct language identifier (e.g., \`\`\`javascript\n...\n\`\`\`).
    3.  **Completeness:** Ensure all specified sections are present in the final output.

    Now, analyze the following raw requirement and generate the Markdown document:

    """
    ${requirementText}
    """
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating AI-powered analysis:", error);
    return "Error: Could not generate analysis. Please check the console for details.";
  }
};


const formatTDD = (tdd: TDDStructure): string => {
    let markdown = `# ${tdd.title}\n\n`;
    
    markdown += `## I. General Overview\n${tdd.generalOverview}\n\n`;
    
    markdown += `## II. Core Features\n`;
    tdd.coreFeatures.forEach((feature: CoreFeature, index: number) => {
        markdown += `### 2.${index + 1} ${feature.name}\n`;
        markdown += `#### Tech Solution\n${feature.techSolution}\n\n`;
        markdown += `#### Tech Notes\n${feature.techNotes}\n\n`;
        markdown += `#### Data Changes\n${feature.dataChanges}\n\n`;
        markdown += `#### Flow Diagram\n`;
        markdown += `\`\`\`mermaid\n${feature.diagram}\n\`\`\`\n\n`;
    });
    
    markdown += `## III. Appendix\n`;
    markdown += `### 3.1 New Metrics\n${tdd.appendix.newMetrics}\n\n`;
    markdown += `### 3.2 Tools\n${tdd.appendix.tools}\n\n`;
    markdown += `### 3.3 Compatibility\n${tdd.appendix.compatibility}\n`;

    return markdown;
}


export const generateTDDFromText = async (text: string): Promise<{ content: string; title: string; }> => {
    const prompt = `
        You are a highly skilled and autonomous Development Agent.
        Your primary directive is absolute adherence to all provided instructions and specifications. Before initiating any work, you are mandated to thoroughly review and comprehend all associated project documentation, technical specifications, design documents, and relevant context to ensure a complete and nuanced understanding of the task or project scope.
        You are proficient in strategic task decomposition, breaking down complex assignments into manageable, logical sub-tasks. For each sub-task, you will meticulously select and apply the most appropriate tools, methodologies, and resources from your available toolkit. Your work consistently demonstrates exceptional quality, precision, and efficiency, aiming for flawless execution and optimal outcomes in every deliverable.
        ⸻
        Your task is to create a complete and production-ready TDD (Technical Design Document) based on the requirement text below. The TDD must strictly follow the structure and content sections of this official template:
        
        TDD Sections:
        1. General Overview
        • Describe the main features included in this release.
        • Include any relevant feature mockups.
        • Add reference links (e.g., Production plan, Specs, UX).
        2. Core Features
        • For each core feature (e.g., Coupons), provide:
        • Technical solution: Describe client-server interactions, flow, and logic.
        • Technical notes: Complexity level, SDKs or tools involved, and dependencies.
        • Data changes: Schema modifications, new fields, or tracking mechanisms.
        • Sequence diagram or flow a diagram.
        3. Appendix
        • 3.1 New Metrics: Any new business or technical metrics introduced.
        • 3.2 Tools: Debug tools, CS APIs, or utilities used or created.
        • 3.3 Compatibility: Mention version compatibility or potential conflicts.

        ---
        
        CRITICAL OUTPUT REQUIREMENTS:
        - Your output MUST be a single, valid JSON object that conforms to the provided schema. Do not add any extra text, explanations, or markdown formatting outside of the JSON object itself.
        - Important instructions for Mermaid diagrams in the 'diagram' field:
        1. The diagram MUST start with 'graph TD;'.
        2. It should represent a simple, clear workflow.
        3. All text on connection lines (edge labels) MUST be enclosed in double quotes. For example: \`A -- "User clicks button" --> B\`.
        4. For node text (the text inside brackets like \`[]\`), you MUST AVOID using special characters like double quotes (\`"\`) or parentheses (\`()\`). Rephrase the text to avoid them. For example, instead of \`A[Display "Claimed" Status]\`, write \`A[Display Claimed Status]\`. Instead of \`B[Load Quests (from config)]\`, write \`B[Load Quests from config]\`.
        5. The diagram code MUST be raw text only, without any markdown fences like '\`\`\`mermaid' or '\`\`\`'.
        Example of a valid diagram string: 'graph TD; A[Start] --> B{Is it valid?}; B -- "Yes" --> C[Process]; B -- "No" --> D[Reject];'

        Here is the requirement document text:
        ---
        ${text}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: tddSchema,
            }
        });

        const jsonText = response.text;
        const tddData: TDDStructure = JSON.parse(jsonText);
        
        const content = formatTDD(tddData);
        // Create a filename-safe version of the title
        const safeTitle = tddData.title.replace(/[^a-z0-9\s-]/gi, '').trim().replace(/\s+/g, '_');
        
        return { content, title: safeTitle || 'Generated_TDD' };

    } catch (error) {
        console.error("Error generating TDD:", error);
        throw new Error("Could not generate TDD. The model may have returned an invalid response. Please check the console for details.");
    }
};

export const generateImplementationPlan = async (tddContent: string): Promise<ImplementationPlan[]> => {
    const prompt = `
        You are an expert Solutions Architect and Technical Lead with deep experience in both ReactJS and backend development (e.g., Node.js/Express). Your task is to create a detailed, step-by-step implementation plan based on a Technical Design Document (TDD).

        This plan MUST be clear and actionable enough for Junior to Mid-level developers to follow. For each core feature in the TDD, you will create a complete plan.
        The output MUST be a single, valid JSON object that conforms to the provided schema.

        Follow these critical instructions for EACH core feature:

        1.  **Feature Name**: Use the name of the core feature from the TDD.
        2.  **Features to Implement (Tính năng cần triển khai)**: Create a high-level, bullet-point-style list of the key functionalities for this feature.
        3.  **Frontend Steps (Các bước thực hiện phía Frontend)**:
            *   Provide a sequence of concrete tasks for a **ReactJS developer**.
            *   Be extremely specific. Instead of "build UI", say "Create a new React component \`<UserProfileForm />\` in \`src/components/profile/\`."
            *   Suggest component names (PascalCase) and file structure.
            *   Recommend specific React hooks (\`useState\`, \`useEffect\`, \`useContext\`) and explain their purpose in the task. E.g., "Use \`useState\` to manage form input state for \`email\` and \`password\`."
            *   Describe state management strategies (e.g., local state, context API, or a library like Redux/Zustand if the feature is complex).

        4.  **Backend Steps (Các bước thực hiện phía Backend)**:
            *   Provide a sequence of concrete tasks for a backend developer.
            *   Define RESTful API endpoints, including the HTTP method and path (e.g., \`POST /api/v1/users\`, \`GET /api/v1/profiles/:userId\`).
            *   Describe the business logic for each endpoint. E.g., "Validate input data (email format, password strength). Hash the password before saving."
            *   Mention necessary database models or schema changes. E.g., "Create a \`Users\` table with \`id\`, \`email\`, \`hashedPassword\` columns."

        5.  **Integration Steps (Cách tích hợp giữa Frontend và Backend)**:
            *   Clearly define the contract between the frontend and backend.
            *   For each frontend task that requires backend communication, specify the exact API call.
            *   Describe the expected request payload (JSON body) and the server's response (data structure and status codes for success/error). E.g., "The \`<LoginForm />\` will send a POST request to \`/api/v1/auth/login\` with \`{'email': '...', 'password': '...'}\`. On success, the backend returns a 200 OK with \`{'token': '...'}\`."

        Your goal is to eliminate ambiguity and provide a clear roadmap for development.

        Here is the TDD content:
        ---
        ${tddContent}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: implementationPlanSchema
            }
        });
        const jsonText = response.text;
        const planData: ImplementationPlan[] = JSON.parse(jsonText);
        return planData;

    } catch (error) {
        console.error("Error generating implementation plan:", error);
        throw new Error("Could not generate implementation plan. The model may have returned an invalid response. Please check the console for details.");
    }
};