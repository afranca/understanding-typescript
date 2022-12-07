/// <reference path="model/drag-drop.ts" />
/// <reference path="model/project.ts" />
/// <reference path="state/project-state.ts" />
/// <reference path="decorator/autobind.ts" />
/// <reference path="components/base-component.ts" />
/// <reference path="components/project-input.ts" />
/// <reference path="components/project-item.ts" />
/// <reference path="components/project-list.ts" />

namespace App{

    // Renders the form
    new ProjectInput();
    new ProjectList('active');
    new ProjectList('finished');
}
