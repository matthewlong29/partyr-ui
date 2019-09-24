import {
  Directive,
  ElementRef,
  Renderer2,
  HostListener,
  Host
} from '@angular/core';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

interface Style {
  name: string;
  value: string;
}

const BASE_STYLES: Style[] = [
  { name: 'display', value: 'flex' },
  { name: 'align-items', value: 'center' },
  { name: 'color', value: 'black' },
  { name: 'padding', value: '12px 16px' },
  { name: 'text-decoration', value: 'none' }
];

const HIGHLIGHT_STYLES: Style[] = [
  { name: 'background-color', value: 'rgba(0,0,0,0.1)' }
];
const UN_HIGHLIGHT_STYLES: Style[] = [
  { name: 'background-color', value: 'white' }
];

@Directive({
  selector: '[appMenuItem]'
})
export class MenuItemDirective {
  @HostListener('mouseover')
  highlight() {
    this.setStyles(HIGHLIGHT_STYLES);
  }

  @HostListener('mouseleave')
  unHighLight() {
    this.setStyles(UN_HIGHLIGHT_STYLES);
  }

  constructor(readonly el: ElementRef, readonly renderer: Renderer2) {
    this.setStyles(BASE_STYLES);
  }

  /** setStyles
   * @desc uses the renderer to set an element's style properties
   */
  setStyles(styles: Style[]) {
    styles.forEach((style: Style) =>
      this.renderer.setStyle(this.el.nativeElement, style.name, style.value)
    );
  }
}
