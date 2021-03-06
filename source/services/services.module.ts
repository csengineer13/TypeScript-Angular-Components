'use strict';

import * as angular from 'angular';

import * as autosaveDialog from './autosaveDialog/autosaveDialog.module';
import * as breakpoints from './breakpoints/breakpoints.module';
import * as contentProvider from './contentProvider/contentProvider.service';
import * as dialog from './dialog/dialog.service';
import * as jquery from './jquery/jquery.service';
import * as windowWrapper from './windowWrapper/windowWrapper.service';

export {
	autosaveDialog,
	breakpoints,
	contentProvider,
	dialog,
	jquery,
	windowWrapper,
};

export var moduleName: string = 'rl.ui.services';

angular.module(moduleName, [
	autosaveDialog.moduleName,
	breakpoints.moduleName,
	contentProvider.moduleName,
	dialog.moduleName,
	jquery.moduleName,
	windowWrapper.moduleName,
]);
