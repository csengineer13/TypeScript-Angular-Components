// /// <reference path='../../typings/angularjs/angular.d.ts' />

/// <reference path='autosaveDialog/autosaveDialog.module.ts' />
/// <reference path='breakpoints/breakpoints.module.ts' />
/// <reference path='dialog/dialog.service.ts' />
/// <reference path='windowWrapper/windowWrapper.service.ts' />

module rl.ui.services {
	export var moduleName: string = 'rl.ui.services';

	angular.module(moduleName, [
		autosaveDialog.moduleName,
		breakpoints.moduleName,
		dialog.moduleName,
		windowWrapper.moduleName,
	]);
}
