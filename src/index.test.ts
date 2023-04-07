import { createAccessControl } from '$lib';
import { describe, it, expect, test } from 'vitest';

const scopes = [
	'com.example.todo.view',
	'com.example.todo.toggle',
	'com.example.todo.crud.create',
	'extra.sayHi'
];

const access = createAccessControl(
	{
		todo: {
			view: 'Enable user to view todo list page',
			toggle: 'Enable user to toggle todo value',
			crud: {
				edit: 'Enable user to edit todo item',
				create: 'Enable user to add todo item',
				delete: 'Enable user to delete todo item'
			}
		},
		extra: {
			sayHi: 'Enable user to say hi'
		}
	},
	{ prefix: 'com.example' }
);

describe('Access Control Tree Scenario Test', () => {
	it('has no enabled scope before grant called', () => {
		expect(access.enabled.length).toBe(0);
	});
	it('with no granted access, cant access todo list page', () => {
		expect(access.can.todo.view).toBeFalsy();
	});
	it('granted access, able to access active pricing table', () => {
		access.grant(...scopes);
		expect(access.can.todo.view).toBeTruthy();
		expect(access.can.todo.toggle).toBeTruthy();
		expect(access.can.todo.crud.create).toBeTruthy();
	});
	it('has 3 access scope granted', () => {
		expect(access.enabled.length).toBe(3);
	});
	it('has no access to crud delete because it is not granted', () => {
		expect(access.can.todo.crud.delete).toBeFalsy();
	});
	it('has no access to extra.sayHi becase scope not using prefix', () => {
		expect(access.can.extra.sayHi).toBeFalsy();
	});
	it('but it can be access after extra.sayHi is toggled', () => {
		access.nodes.extra.sayHi.toggle();
		expect(access.can.extra.sayHi).toBeTruthy();
	});
	it('end test reset access', () => {
		access.reset();
		expect(access.enabled.length).toBe(0);
	});
});

describe('Access Control Tree Utility Test', () => {
	test('grant utility', () => {
		access.grant('com.example.todo.view');
		expect(access.can.todo.view).toBeTruthy();
	});
	test('export all utility', () => {
		expect(access.export(false).length).toBe(6);
	});
	test('export enabled only', () => {
		expect(access.export().length).toBe(1);
	});
	test('has utility', () => {
		expect(access.has('com.example.todo.crud.edit')).toBeTruthy();
	});
	test('get utility', () => {
		expect(access.get('com.example.todo.crud.delete')).toBeTruthy();
	});
	test('search utility', () => {
		expect(access.search('view').length).toBe(1);
	});
	test('getChild utility', () => {
		expect(access.getChild('com.example.todo.crud').length).toBe(3);
	});
	test('get enabled utility', () => {
		expect(access.enabled.length).toBe(1);
	});
	test('get disabled utility', () => {
		expect(access.disabled.length).toBe(5);
	});
});
