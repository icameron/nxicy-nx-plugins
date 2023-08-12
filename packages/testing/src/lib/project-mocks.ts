import {
  Tree,
  ProjectConfiguration,
  ProjectGraph,
  getProjects,
} from '@nx/devkit';

export function getProjectConfigurations(tree: Tree): {
  [projectName: string]: ProjectConfiguration;
} {
  const mapConfigurations: Map<string, ProjectConfiguration> =
    getProjects(tree);
  return Object.fromEntries(mapConfigurations);
}

export async function createProjectGraphFromProjectConfiguration(projectConfigurations: {
  [projectName: string]: ProjectConfiguration;
}): Promise<ProjectGraph> {
  const projectGraph: ProjectGraph = {
    nodes: {},
    dependencies: {},
  };

  // Create project nodes for all projects in the workspace
  const nodes: {
    [key: string]: {
      type: "app" | "e2e" | "lib";
      name: string;
      data: ProjectConfiguration;
    };
  } = {};
  for (const projectName of Object.keys(projectConfigurations)) {
    nodes[projectName] = {
      type: 'app',
      name: projectName,
      data: projectConfigurations[projectName],
    };
  }
  projectGraph.nodes = nodes;
  return projectGraph;
}
