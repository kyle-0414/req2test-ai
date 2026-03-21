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

export function preprocessDocument(text: string): DocumentStructure {
  const lines = text.split("\n");
  const sections: DocumentStructure["sections"] = [];
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

  let currentSection: typeof sections[0] | null = null;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    let foundPattern = false;
    for (const { pattern, type } of sectionPatterns) {
      if (pattern.test(trimmedLine)) {
        if (currentSection) {
          currentSection.endIndex = index - 1;
        }
        currentSection = {
          label: trimmedLine,
          type,
          startIndex: index,
          endIndex: lines.length - 1,
          content: "",
        };
        sections.push(currentSection);
        foundPattern = true;
        break;
      }
    }

    if (!foundPattern) {
      if (!currentSection) {
        // Handle text before any section label
        currentSection = {
          label: "초기 내용",
          type: "requirement",
          startIndex: 0,
          endIndex: lines.length - 1,
          content: "",
        };
        sections.push(currentSection);
      }
      currentSection.content += line + "\n";
      
      // Collect metadata
      if (currentSection.type === "precondition") {
        metadata.preconditions.push(trimmedLine);
      } else if (currentSection.type === "objective") {
        metadata.objectives.push(trimmedLine);
      } else if (currentSection.type === "priority") {
        metadata.priorities.push(trimmedLine);
      }
    }
  });

  // If no sections found, treat everything as requirement
  if (sections.length === 0) {
    sections.push({
      label: "전체",
      type: "requirement",
      startIndex: 0,
      endIndex: lines.length - 1,
      content: text,
    });
  }

  // filter out "junk" from requirements - strictly speaking, we want to inform the LLM about these sections
  const cleanedText = sections
    .filter(s => s.type === "requirement" || s.type === "exception" || s.type === "other")
    .map(s => s.content)
    .join("\n")
    .trim();

  return { sections, metadata, cleanedText };
}
