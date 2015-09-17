// uses typings/angularjs
// uses typescript-angular-utilities

// /// <reference path='../../../typings/angularjs/angular.d.ts' />
// /// <reference path='../../../libraries/typescript-angular-utilities/typings/utility.d.ts' />

/// <reference path='../sorts/sorts.module.ts' />
/// <reference path='dataPager/dataPager.service.ts' />
/// <reference path='dataServiceDataSource/dataServiceDataSource.service.ts' />
/// <reference path='simpleDataSource/simpleDataSource.service.ts' />
/// <reference path='dataSourceProcessor.service.ts' />

module rl.ui.components.cardContainer.dataSources {
	'use strict';

	export var moduleName: string = 'rl.ui.components.cardContainer.dataSources';
	
	angular.module(moduleName, [
		rl.utilities.services.object.moduleName,
		sorts.moduleName,
		
		dataPager.moduleName,
		dataServiceDataSource.moduleName,
		simpleDataSource.moduleName,
	])
		.service(processorServiceName, DataSourceProcessor);
}
