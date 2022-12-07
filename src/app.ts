// Drag & Drop Interfaces
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget{
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}

// Statuses for Projects
enum ProjectStatus {
    Active,
    Finished
}

// Project Type
class Project {
    constructor(
        public id: string, 
        public title: string,
        public description: string,
        public numberOfPeople: number,
        public status: ProjectStatus
     ){

    };
}

// Project State Management
type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>){
        this.listeners.push(listenerFn);
    }
}

class ProjectState extends State<Project>{
    //private listeners: Listener[] = [];
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor(){  
        super();
      }
    
    static getInstance() : ProjectState{
        if(this.instance){
            return this.instance;
        } 
        this.instance = new ProjectState();
        return this.instance;
    }    

    addProject(title: string, description: string, numOfPeople: number){
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            numOfPeople,
            ProjectStatus.Active
            );
        
        this.projects.push(newProject);
        this.updateListeners();
    }

    moveProject(projectId: string, newStatus: ProjectStatus){
        // Slim way of writing arrow function
        //const project = this.projects.find(prj => prj.id === projectId);
        const project = this.projects.find( (prj) => { return prj.id === projectId } );
        console.log(project);
        if (project && project.status !== newStatus){            
            project.status = newStatus;
            this.updateListeners();
        }
    }

    private updateListeners(){
        for (const listenerFn of this.listeners){
            // slice makes a copy of the original array
            // otherwise it will pass a pointer to the original array
            // allowing it to be changed somewhere else
            listenerFn(this.projects.slice());
        }        
    }

}

// Creating Global variable projectState
const projectState = ProjectState.getInstance();

//validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(input: Validatable){
    let isValid = true;

    if (input.required){
        isValid = isValid && (input.value.toString().trim().length !== 0);
    }
    if (input.minLength != null && typeof input.value === 'string'){
        isValid = isValid && (input.value.trim().length >= input.minLength);
    }
    if (input.maxLength != null && typeof input.value === 'string'){
        isValid = isValid && (input.value.trim().length <= input.maxLength);
    }   
    if (input.min != null && typeof input.value === 'number'){
        isValid = isValid && (input.value >= input.min);
    }
    if (input.max != null && typeof input.value === 'number'){
        isValid = isValid && (input.value <= input.max);
    }          
    return isValid;
}

// autobind decorator
function autobind(
    _: any, 
    _2: string, 
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;  
    const adjustedDescritor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }        
    };
    return adjustedDescritor;
}

// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;    
    hostElement: T;  
    element: U;    

    constructor(
        templateId: string, 
        hostElementId: string, 
        insertAtBegining: boolean,
        newElementId?: string
        ){
            this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
            this.hostElement = document.getElementById(hostElementId)! as T;        

            const importedNode = document.importNode(this.templateElement.content, true);
            this.element = importedNode.firstElementChild as U;
            if (newElementId){
                this.element.id = newElementId;
            }

            this.attach(insertAtBegining);
    }

    attach(insertAtBegining: boolean){
        this.hostElement.insertAdjacentElement(insertAtBegining ? 'afterbegin': 'beforeend', this.element );
    }   

    abstract configure(): void;
    abstract renderContent(): void;

}

// Project Item class
class ProjecItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable{
    private project: Project;   

    get persons(){
        if (this.project.numberOfPeople === 1){
            return '1 Person';
        }
        return `${this.project.numberOfPeople} People`;
    }

    constructor(
        hostId: string,
        project: Project
        )   {
        super('single-project', hostId, false, project.id);       
        this.project = project;

        this.configure();
        this.renderContent();
    }

    @autobind
    dragStartHandler(event: DragEvent): void {
        //console.log("dragStartHandler ");
        event.dataTransfer!.setData('text/plain', this.project.id);
        event.dataTransfer!.effectAllowed = 'move'; //could be also 'copy'
    }
    
    dragEndHandler(_: DragEvent): void {
        console.log("dragEndHandler :: Method not implemented.");
    }

    configure(): void {
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    }
    renderContent(): void {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
        this.element.querySelector('p')!.textContent = this.project.description;
    }
}

// Project List class
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {

    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished'){
        super('project-list', 'app', false, `${type}-projects`);
        this.assignedProjects = [];

        this.configure();
        this.renderContent();        
    }
    
    @autobind
    dragOverHandler(event: DragEvent): void {        
        //console.log("dragOverHandler");
        // tests whether the data format is the expected type
        // for instance, images would not be allowed here
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain'){
            // Default is not allow drag & drop, therefore the
            // preventDefault() is required in the DragOver handler
            event.preventDefault();
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable'); //defined in css
        }


    }
    @autobind
    dropHandler(event: DragEvent): void {
        const projectId = event.dataTransfer!.getData('text/plain');

        let status;
        if (this.type === 'active'){
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
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.remove('droppable'); //defined in css
    }

    configure(): void { 
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        this.element.addEventListener('drop', this.dropHandler);

        projectState.addListener( (projects: Project[]) => {
            const relevantProjects = projects.filter( (prj) => {
                if (this.type === 'active'){
                    return prj.status === ProjectStatus.Active;
                } 
                return prj.status === ProjectStatus.Finished;    
            });
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });        
     }       

    renderContent(){
        // Adding Id to list
        const listId = `${this.type}-project-list`;
        this.element.querySelector('ul')!.id = listId;
        //Setting header text
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    private renderProjects(){
        const listEl = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
        /* Clear the list content before redering everything again */
        //listEl.replaceChildren();
        listEl.innerHTML = '';

        for(const prjItem of this.assignedProjects){
            new ProjecItem(this.element.querySelector('ul')!.id, prjItem);
        }
    }
}

// Project Input class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
    titleInputElement: HTMLInputElement;   
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor(){
        super('project-input', 'app', true, 'user-input');
        
        this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description')! as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people')! as HTMLInputElement;

        this.configure();
    }

    configure(){
        this.element.addEventListener("submit", this.submitHandler);
    }

    renderContent(): void {     }    

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true
        }
        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }
        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        }                

        if (
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)
        ){
            alert('Invalid input');
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }

    private clearInputs(){
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    @autobind
    private submitHandler(event: Event){
        event.preventDefault();
        const userInput = this.gatherUserInput();

        if (Array.isArray(userInput)){
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people);
            this.clearInputs();
        }
    }



}

// Renders the form
const prjInput = new ProjectInput();
const activeProjList = new ProjectList('active');
const finishedProjList = new ProjectList('finished');