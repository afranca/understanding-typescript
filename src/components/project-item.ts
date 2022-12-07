/// <reference path="base-component.ts" />
/// <reference path="../decorator/autobind.ts" />
/// <reference path="../model/project.ts" />
/// <reference path="../model/drag-drop.ts" />

namespace App{
    // Project Item class
    export class ProjecItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable{
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
}