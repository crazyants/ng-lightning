import {fakeAsync, tick, TestBed, ComponentFixture}  from '@angular/core/testing';
import {Component} from '@angular/core';
import {createGenericTestComponent} from '../../test/util/helpers';
import {NglPopoversModule} from './module';

const createTestComponent = (html?: string, detectChanges?: boolean) =>
  createGenericTestComponent(TestComponent, html, detectChanges) as ComponentFixture<TestComponent>;

export function getPopoverElement(element: HTMLElement): HTMLElement {
  return <HTMLElement>element.querySelector('ngl-popover');
}

describe('Popovers', () => {

  beforeEach(() => TestBed.configureTestingModule({declarations: [TestComponent], imports: [NglPopoversModule]}));

  it('should render popover correctly', () => {
    const fixture = createTestComponent(`<ngl-popover>My content</ngl-popover>`);
    const popoverEl = getPopoverElement(fixture.nativeElement);
    expect(popoverEl).toHaveCssClass('slds-popover');
    expect(popoverEl.textContent.trim()).toBe('My content');
    fixture.destroy();
  });

  it('should notify when view is initialized', () => {
    const fixture = createTestComponent(`<ngl-popover (afterViewInit)="cb()">My content</ngl-popover>`, false);
    expect(fixture.componentInstance.cb).not.toHaveBeenCalled();
    fixture.detectChanges();
    expect(fixture.componentInstance.cb).toHaveBeenCalled();
    fixture.destroy();
  });

  it('should render the created popover correctly', () => {
    const fixture = createTestComponent();
    const popoverEl = getPopoverElement(fixture.nativeElement);
    expect(popoverEl).toHaveCssClass('slds-popover');
    expect(popoverEl).toHaveCssClass('slds-nubbin--bottom'); // Top placement
    expect(popoverEl.textContent.trim()).toBe('I am a tooltip');
    fixture.destroy();
  });

  it('should render popover with string content', () => {
    const fixture = createTestComponent(`<span nglPopover="I am a string" nglOpen="true"></span>`);
    const popoverEl = getPopoverElement(fixture.nativeElement);
    expect(popoverEl.textContent.trim()).toBe('I am a string');
    fixture.destroy();
  });

  it('should change visibility based on trigger', () => {
    const fixture = createTestComponent();
    fixture.componentInstance.open = false;
    fixture.detectChanges();

    const popoverEl = getPopoverElement(fixture.nativeElement);
    expect(popoverEl).toBeFalsy();
    fixture.destroy();
  });

  it('should change nubbin based on placement', () => {
    const fixture = createTestComponent();
    const { nativeElement, componentInstance } = fixture;
    const popoverEl = getPopoverElement(nativeElement);

    componentInstance.placement = 'left';
    fixture.detectChanges();
    expect(popoverEl).toHaveCssClass('slds-nubbin--right');
    expect(popoverEl).not.toHaveCssClass('slds-nubbin--bottom');

    componentInstance.placement = 'bottom';
    fixture.detectChanges();
    expect(popoverEl).toHaveCssClass('slds-nubbin--top');
    expect(popoverEl).not.toHaveCssClass('slds-nubbin--right');
    fixture.destroy();
  });

  it('should change theme based on input', () => {
    const fixture = createTestComponent();
    const { nativeElement, componentInstance } = fixture;
    const popoverEl = getPopoverElement(nativeElement);

    fixture.detectChanges();
    expect(popoverEl).not.toHaveCssClass('slds-theme--info');

    componentInstance.theme = 'info';
    fixture.detectChanges();
    expect(popoverEl).toHaveCssClass('slds-theme--info');

    componentInstance.theme = 'error';
    fixture.detectChanges();
    expect(popoverEl).toHaveCssClass('slds-theme--error');
    expect(popoverEl).not.toHaveCssClass('slds-theme--info');

    componentInstance.theme = null;
    fixture.detectChanges();
    expect(popoverEl).not.toHaveCssClass('slds-theme--error');
    fixture.destroy();
  });

  it('should have tooltip appearence', () => {
    const fixture = createTestComponent(`<template #tip></template><span [nglPopover]="tip" nglOpen="true" nglTooltip></span>`);
    const popoverEl = getPopoverElement(fixture.nativeElement);
    expect(popoverEl).toHaveCssClass('slds-popover--tooltip');
  });

  it('should destroy popover when host is destroyed', () => {
    const fixture = createTestComponent(`<template #tip></template><span *ngIf="exists" [nglPopover]="tip" nglOpen="true"></span>`, false);
    fixture.componentInstance.exists = true;
    fixture.detectChanges();
    expect(getPopoverElement(fixture.nativeElement)).toBeTruthy();

    fixture.componentInstance.exists = false;
    fixture.detectChanges();
    expect(getPopoverElement(fixture.nativeElement)).toBeFalsy();
    fixture.destroy();
  });

  it('should support delayed opening', fakeAsync(() => {
    const fixture = createTestComponent('<div nglPopoverDelay="200" nglPopover="tip" [nglOpen]="open"></div>');
    expect(getPopoverElement(fixture.nativeElement)).toBeNull();

    tick(200);
    fixture.detectChanges();
    expect(getPopoverElement(fixture.nativeElement)).toBeTruthy();

    fixture.componentInstance.open = false;
    fixture.detectChanges();

    tick(200);
    fixture.detectChanges();
    expect(getPopoverElement(fixture.nativeElement)).toBeNull();
    fixture.destroy();
  }));

  it('should support different opening and closing delays', fakeAsync(() => {
    const fixture = createTestComponent('<div [nglPopoverDelay]="[100, 500]" nglPopover="tip" [nglOpen]="open"></div>');
    expect(getPopoverElement(fixture.nativeElement)).toBeFalsy();

    tick(100);
    fixture.detectChanges();
    expect(getPopoverElement(fixture.nativeElement)).toBeTruthy();

    fixture.componentInstance.open = false;
    fixture.detectChanges();

    tick(500);
    fixture.detectChanges();
    expect(getPopoverElement(fixture.nativeElement)).toBeNull();
    fixture.destroy();
  }));

  it('should support "manual" opening', fakeAsync(() => {
    const fixture = createTestComponent(`
      <div nglPopoverDelay="200" nglPopover="tip" #tip="nglPopover"></div>
      <button type="button" (click)="tip.open()"></button>
    `);

    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();
    expect(getPopoverElement(fixture.nativeElement)).toBeFalsy();

    tick(200);
    fixture.detectChanges();
    expect(getPopoverElement(fixture.nativeElement)).toBeTruthy();
    fixture.destroy();
  }));

  it('should support "manual" closing', () => {
    const fixture = createTestComponent(`
      <div nglPopover="tip" #tip="nglPopover" nglOpen="true"></div>
      <button type="button" (click)="tip.close()"></button>
    `);
    expect(getPopoverElement(fixture.nativeElement)).toBeTruthy();

    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();
    expect(getPopoverElement(fixture.nativeElement)).toBeFalsy();
    fixture.destroy();
  });

  it('should support "manual" opening and closing with custom delay', () => {
    const fixture = createTestComponent(`
      <div nglPopoverDelay="200" nglPopover="tip" #tip="nglPopover"></div>
      <button type="button" class="open" (click)="tip.open(0)"></button>
      <button type="button" class="close" (click)="tip.close(0)"></button>
    `);
    expect(getPopoverElement(fixture.nativeElement)).toBeFalsy();

    const buttonOpen = fixture.nativeElement.querySelector('button.open');
    const buttonClose = fixture.nativeElement.querySelector('button.close');

    buttonOpen.click();
    expect(getPopoverElement(fixture.nativeElement)).toBeTruthy();

    buttonClose.click();
    expect(getPopoverElement(fixture.nativeElement)).toBeFalsy();
    fixture.destroy();
  });
});

@Component({
  template: `
    <template #tip>I am a tooltip</template>
    <span [nglPopover]="tip" [nglPopoverPlacement]="placement" [nglPopoverTheme]="theme" [nglOpen]="open">Open here</span>
  `,
})
export class TestComponent {
  placement: string;
  open = true;
  exists: boolean;
  theme: string;

  cb = jasmine.createSpy('cb');
}
