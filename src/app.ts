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

    @autobind
    private submitHandler(event: Event){
        event.preventDefault();
        console.log( this.titleInputElement.value )
    }

    private configure(){
        this.formElement.addEventListener("submit", this.submitHandler.bind(this));
    }

    private attach(){
        this.hostElement.insertAdjacentElement("afterbegin", this.formElement );
    }
}

// Renders the form
const prjInput = new ProjectInput();