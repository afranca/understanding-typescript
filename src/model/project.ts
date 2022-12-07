namespace App{
    // Statuses for Projects
    export enum ProjectStatus {
        Active,
        Finished
    }

    // Project Type
    export class Project {
        constructor(
            public id: string, 
            public title: string,
            public description: string,
            public numberOfPeople: number,
            public status: ProjectStatus
        ){

        };
    }
}