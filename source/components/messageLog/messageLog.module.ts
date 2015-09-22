/// <reference path='../../../typings/angularjs/angular.d.ts' />
/// <reference path='../../../libraries/typescript-angular-utilities/typings/utility.d.ts' />

/// <reference path='messageLog.service.ts' />
/// <reference path='messageLog.directive.ts' />

module rl.ui.components.messageLog {
	'use strict';

	export var moduleName: string = 'rl.ui.components.messageLog';

	import __object = rl.utilities.services.object;

	angular.module(moduleName, [__object.moduleName])
		.factory(factoryName, messageLogFactory)
		.directive(directiveName, messageLog)
		.controller(controllerName, MessageLogController);
		// .directive(__editableMessageLog.directiveName, __editableMessageLog.editableMessageLog)
		// .controller(__editableMessageLog.controllerName, __editableMessageLog.EditableMessageLogController);
}
