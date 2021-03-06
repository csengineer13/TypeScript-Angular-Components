import * as angular from 'angular';
export declare var moduleName: string;
export declare var directiveName: string;
export declare var controllerName: string;
export declare var availablePageSizes: number[];
export declare var defaultPageSize: number;
export declare class PageSizeController {
    selectedPageSize: number;
    pageSizes: number[];
    hasPageFilter: boolean;
    private containerService;
    static $inject: string[];
    constructor($scope: angular.IScope);
}
export declare function pageSize(): angular.IDirective;
