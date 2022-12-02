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

//Project List class
class ProjectList{
    templateElement: HTMLTemplateElement;    
    hostElement: HTMLDivElement;  
    sectionElement: HTMLElement;

    constructor(private type: 'active' | 'finished'){
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.sectionElement = importedNode.firstElementChild as HTMLElement;
        this.sectionElement.id = `${this.type}-projects`;
        this.attach();
        this.renderContent();
        
    }

    private renderContent(){
        // Adding Id to list
        const listId = `${this.type}-project-list`;
        this.sectionElement.querySelector('ul')!.id = listId;
        //Setting header text
        this.sectionElement.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    private attach(){
        this.hostElement.insertAdjacentElement("beforeend", this.sectionElement );
    }    

}

// Project Input class
class ProjectInput {
    templateElement: HTMLTemplateElement;    
    hostElement: HTMLDivElement;
    formElement: HTMLFormElement;

    titleInputElement: HTMLInputElement;   
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor(){
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.formElement = importedNode.firstElementChild as HTMLFormElement;
        this.formElement.id = 'user-input';
        
        this.titleInputElement = this.formElement.querySelector('#title')! as HTMLInputElement;
        this.descriptionInputElement = this.formElement.querySelector('#description')! as HTMLInputElement;
        this.peopleInputElement = this.formElement.querySelector('#people')! as HTMLInputElement;

        this.configure();
        this.attach();
    }

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
            console.log(title, desc, people);
            this.clearInputs();
        }
    }

    private configure(){
        this.formElement.addEventListener("submit", this.submitHandler);
    }

    private attach(){
        this.hostElement.insertAdjacentElement("afterbegin", this.formElement );
    }
}

// Renders the form
const prjInput = new ProjectInput();
const activeProjList = new ProjectList('active');
const finishedProjList = new ProjectList('finished');