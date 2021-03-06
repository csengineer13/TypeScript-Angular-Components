/// <reference path='../../../typings/chai/chai.d.ts' />
/// <reference path='../../../typings/mocha/mocha.d.ts' />
/// <reference path='../../../typings/sinon/sinon.d.ts' />
/// <reference path='../../../typings/chaiAssertions.d.ts' />

'use strict';

import { services } from 'typescript-angular-utilities';
import test = services.test;

import { moduleName, simpleCard, simpleCardList } from './simpleCardList.module';

import * as angular from 'angular';
import 'angular-mocks';

interface IObservableMock {
	register: Sinon.SinonSpy;
	fire: Sinon.SinonSpy;
}

interface ICardBehaviorMock {
	close: Sinon.SinonSpy;
}

describe('SimpleCardListController', () => {
	var scope: angular.IScope;
	var list: simpleCardList.ISimpleCardListController;
	var observable: IObservableMock;

	beforeEach(() => {
		angular.mock.module(moduleName);

		observable = {
			register: sinon.spy(),
			fire: sinon.spy((): boolean => { return true; }),
		};

		var observableFactory: any = {
			getInstance(): IObservableMock {
				return observable;
			},
		};

		test.angularFixture.mock({
			observableFactory: observableFactory,
		});
	});

	it('should register close behavior with the observable', (): void => {
		buildController();

		var behavior: ICardBehaviorMock = { close: sinon.spy() };
		list.registerCard(behavior);

		sinon.assert.calledOnce(observable.register);
		sinon.assert.calledWith(observable.register, behavior.close, 'close');
	});

	it('should trigger all cards to close on openCard and return the result', (): void => {
		buildController();
		var canOpen: boolean = list.openCard();
		sinon.assert.calledOnce(observable.fire);
		sinon.assert.calledWith(observable.fire, 'close');
		expect(canOpen).to.be.true;
	});

	function buildController(): void {
		var controllerResult: test.IControllerResult<simpleCardList.ISimpleCardListController>
			= test.angularFixture.controllerWithBindings<simpleCardList.ISimpleCardListController>(simpleCardList.controllerName);

		scope = controllerResult.scope;
		list = controllerResult.controller;
	}
});
