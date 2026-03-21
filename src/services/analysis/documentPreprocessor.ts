export interface DocumentStructure {
  sections: Array<{
    label: string;
    type: "precondition" | "requirement" | "exception" | "priority" | "objective" | "other";
    startIndex: number;
    endIndex: number;
    content: string;
  }>;
  metadata: {
    preconditions: string[];
    objectives: string[];
    priorities: string[];
  };
  cleanedText: string;
}

/**
 * Preprocesses the document to extract structural metadata (preconditions, objectives, etc.)
 * but returns the FULL original text as `cleanedText` so the LLM has complete context.
 * 
 * We intentionally avoid filtering content here — the LLM is better at understanding
 * which parts of the spec are meaningful requirements vs. structural headers.
 */
export function preprocessDocument(text: string): DocumentStructure {
  const lines = text.split("\n");
  const metadata: DocumentStructure["metadata"] = {
    preconditions: [],
    objectives: [],
    priorities: [],
  };

  const sectionPatterns = [
    { pattern: /^\[?사전조건\]?$/, type: "precondition" as const },
    { pattern: /^\[?(기능\s*)?요구사항\]?$/, type: "requirement" as const },
    { pattern: /^\[?예외\s*요구사항\]?$/, type: "exception" as const },
    { pattern: /^\[?우선순위\]?$/, type: "priority" as const },
    { pattern: /^\[?목적\]?$/, type: "objective" as const },
  ];

  // Light pass: only extract metadata (preconditions, objectives, priorities)
  // Do NOT filter out any content from the text
  let currentSectionType: DocumentStructure["sections"][0]["type"] | null = null;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    let foundSection = false;
    for (const { pattern, type } of sectionPatterns) {
      if (pattern.test(trimmedLine)) {
        currentSectionType = type;
        foundSection = true;
        break;
      }
    }

    if (!foundSection && currentSectionType) {
      if (currentSectionType === "precondition") {
        metadata.preconditions.push(trimmedLine);
      } else if (currentSectionType === "objective") {
        metadata.objectives.push(trimmedLine);
      } else if (currentSectionType === "priority") {
        metadata.priorities.push(trimmedLine);
      }
    }
  });

  // Pass the complete original text to the LLM — no content filtering
  const cleanedText = text.trim();

  return {
    sections: [], // Sections are no longer needed for LLM path
    metadata,
    cleanedText,
  };
}
