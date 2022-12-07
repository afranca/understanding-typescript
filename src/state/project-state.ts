namespace App{
    // Project State Management
    export type Listener<T> = (items: T[]) => void;

    export class State<T> {
        protected listeners: Listener<T>[] = [];

        addListener(listenerFn: Listener<T>){
            this.listeners.push(listenerFn);
        }
    }

    export class ProjectState extends State<Project>{
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
    export const projectState = ProjectState.getInstance();

}