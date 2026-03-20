import { localPersistence } from "./localPersistence";
import { SourceDocument } from "../../features/documents/model";
import { RequirementItem } from "../../features/requirements/model";
import { TestCaseDraft } from "../../features/testcases/model";
import { AnalysisSummary } from "../../features/analysis/model";

export interface PersistedProjectState {
  projectId: string;
  projectName: string;
  createdAt: string;
  updatedAt: string;

  lastScreen?: string;
  lastSourceText?: string;
  lastSourceInfo?: { name: string; type: string; id: string; tokens: number };

  documents: SourceDocument[];
  requirements: RequirementItem[];
  testCases: TestCaseDraft[];
  analysisSummary: AnalysisSummary | null;
}

const PROJECTS_KEY = "req2test_projects";
const LAST_ACTIVE_KEY = "req2test_last_active_project";

export const projectStore = {
  // Get all projects map
  getAllProjects: (): Record<string, PersistedProjectState> => {
    return localPersistence.getItem<Record<string, PersistedProjectState>>(PROJECTS_KEY) || {};
  },

  // Get single project
  getProject: (projectId: string): PersistedProjectState | null => {
    const projects = projectStore.getAllProjects();
    return projects[projectId] || null;
  },

  // Save full project state
  saveProject: (project: PersistedProjectState) => {
    const projects = projectStore.getAllProjects();
    project.updatedAt = new Date().toISOString();
    projects[project.projectId] = project;
    localPersistence.setItem(PROJECTS_KEY, projects);
  },

  // Create a new project
  createProject: (projectName: string = "New Project"): PersistedProjectState => {
    const projectId = `proj-${Date.now()}`;
    const newProject: PersistedProjectState = {
      projectId,
      projectName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: [],
      requirements: [],
      testCases: [],
      analysisSummary: null,
    };
    projectStore.saveProject(newProject);
    projectStore.setLastActiveProjectId(projectId);
    return newProject;
  },

  // Last active project tracking
  getLastActiveProjectId: (): string | null => {
    return localPersistence.getItem<string>(LAST_ACTIVE_KEY);
  },

  setLastActiveProjectId: (projectId: string) => {
    localPersistence.setItem(LAST_ACTIVE_KEY, projectId);
  },

  getCurrentProject: (): PersistedProjectState | null => {
    const activeId = projectStore.getLastActiveProjectId();
    if (!activeId) return null;
    return projectStore.getProject(activeId);
  },

  // Update specific parts of a project
  updateDocuments: (projectId: string, documents: SourceDocument[]) => {
    const project = projectStore.getProject(projectId);
    if (project) {
      project.documents = documents;
      projectStore.saveProject(project);
    }
  },

  updateRequirements: (projectId: string, requirements: RequirementItem[]) => {
    const project = projectStore.getProject(projectId);
    if (project) {
      project.requirements = requirements;
      projectStore.saveProject(project);
    }
  },

  updateTestCases: (projectId: string, testCases: TestCaseDraft[]) => {
    const project = projectStore.getProject(projectId);
    if (project) {
      project.testCases = testCases;
      projectStore.saveProject(project);
    }
  },

  updateAnalysisSummary: (projectId: string, analysisSummary: AnalysisSummary | null) => {
    const project = projectStore.getProject(projectId);
    if (project) {
      project.analysisSummary = analysisSummary;
      projectStore.saveProject(project);
    }
  },

  updateSessionState: (projectId: string, screen: string) => {
    const project = projectStore.getProject(projectId);
    if (project) {
      project.lastScreen = screen;
      projectStore.saveProject(project);
    }
  },

  updateSourceText: (projectId: string, text: string) => {
    const project = projectStore.getProject(projectId);
    if (project) {
      project.lastSourceText = text;
      projectStore.saveProject(project);
    }
  },

  updateSourceInfo: (projectId: string, info: any) => {
    const project = projectStore.getProject(projectId);
    if (project) {
      project.lastSourceInfo = info;
      projectStore.saveProject(project);
    }
  }
};
