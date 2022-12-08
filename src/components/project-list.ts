import { DragTarget  } from "../model/drag-drop.js";
import { Component } from '../components/base-component.js';
import { Project, ProjectStatus  } from '../model/project.js';
import { autobind } from '../decorator/autobind.js';
import { projectState } from '../state/project-state.js';
import { ProjecItem } from '../components/project-item.js';


// Project List class
export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  @autobind
  dragOverHandler(event: DragEvent): void {
    //console.log("dragOverHandler");
    // tests whether the data format is the expected type
    // for instance, images would not be allowed here
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      // Default is not allow drag & drop, therefore the
      // preventDefault() is required in the DragOver handler
      event.preventDefault();
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable"); //defined in css
    }
  }
  @autobind
  dropHandler(event: DragEvent): void {
    const projectId = event.dataTransfer!.getData("text/plain");

    let status;
    if (this.type === "active") {
      status = ProjectStatus.Active;
    } else {
      status = ProjectStatus.Finished;
    }
    projectState.moveProject(projectId, status);

    // Slim way to write the same code
    // projectState.moveProject(prjId,this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
  }
  @autobind
  dragLeaveHandler(_: DragEvent): void {
    //console.log("dragLeaveHandler");
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable"); //defined in css
  }

  configure(): void {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("drop", this.dropHandler);

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    // Adding Id to list
    const listId = `${this.type}-project-list`;
    this.element.querySelector("ul")!.id = listId;
    //Setting header text
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-project-list`
    )! as HTMLUListElement;
    /* Clear the list content before redering everything again */
    //listEl.replaceChildren();
    listEl.innerHTML = "";

    for (const prjItem of this.assignedProjects) {
      new ProjecItem(this.element.querySelector("ul")!.id, prjItem);
    }
  }
}
