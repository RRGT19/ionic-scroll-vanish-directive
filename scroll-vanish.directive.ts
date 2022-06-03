import {Directive, ElementRef, Input, OnInit, Renderer2} from '@angular/core';
import {DomController} from '@ionic/angular';

const TOOLBAR_HEIGHT = '56px'; // Or 44px in iOS

/**
 * How to use:
 *
 * <ion-header>
 *   <ion-toolbar [scrollVanish]="scrollArea">
 *     ...
 *   </ion-toolbar>
 * </ion-header>
 *
 * or
 *
 * <ion-header>
 *   <app-toolbar [scrollVanish]="scrollArea">
 *     ...
 *   </app-toolbar>
 * </ion-header>
 *
 * <ion-content #scrollArea [scrollEvents]="true"></ion-content>
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[scrollVanish]'
})
export class ScrollVanishDirective implements OnInit {

  /**
   * Reference to the ion-content area that we are passing in to listen to scroll events.
   */
  @Input('scrollVanish') scrollArea;

  /**
   * Allows us to keep track of whether the element is currently hidden or not.
   */
  private hidden: boolean = false;

  /**
   * Allows us to specify a tolerance level for when the hiding/showing should trigger.
   */
  private triggerDistance: number = 20;

  /**
   * The element that we will hide/animate.
   */
  private nativeElement: HTMLElement;

  /**
   * - ElementRef and Renderer2 are to do modifications to the DOM in order to
   * hide/animate the element that the directive is attached to.
   * - DomController will allow us to make our modifications to the DOM at the
   * ideal time for better performance.
   */
  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private domCtrl: DomController
  ) {
  }

  ngOnInit() {
    this.initNativeElement();
    this.initStyles();
    this.subscribeToScrollChanges();
  }

  /**
   * Finds a child element inside the parent that the directive is attached to.
   * This is due to we use a reusable component called app-toolbar that has the
   * real ion-toolbar on its template. In this case, we need the element of the
   * real ion-toolbar in order to hide/animate it. If no child is found, we use
   * the element that the directive is attached to.
   *
   * @author Robert Gomez <rtirado@altice.com.do>
   */
  initNativeElement() {
    const children: HTMLCollection = (this.element.nativeElement as HTMLElement).getElementsByTagName('ion-toolbar');
    if (children && children.length) {
      this.nativeElement = children[0] as HTMLElement;
    } else {
      this.nativeElement = this.element.nativeElement;
    }
  }

  initStyles() {
    this.domCtrl.write(() => {
      this.renderer.setStyle(
        this.nativeElement,
        'transition',
        '0.2s linear'
      );
      this.renderer.setStyle(this.nativeElement, 'height', TOOLBAR_HEIGHT);
    });
  }

  hide() {
    this.domCtrl.write(() => {
      this.renderer.setStyle(this.nativeElement, 'min-height', '0px');
      this.renderer.setStyle(this.nativeElement, 'height', '0px');
      this.renderer.setStyle(this.nativeElement, 'opacity', '0');
      this.renderer.setStyle(this.nativeElement, 'padding', '0');
    });
    this.hidden = true;
  }

  show() {
    this.domCtrl.write(() => {
      this.renderer.setStyle(this.nativeElement, 'height', TOOLBAR_HEIGHT);
      this.renderer.removeStyle(this.nativeElement, 'opacity');
      this.renderer.removeStyle(this.nativeElement, 'min-height');
      this.renderer.removeStyle(this.nativeElement, 'padding');
    });
    this.hidden = false;
  }

  subscribeToScrollChanges() {
    this.scrollArea.ionScroll.subscribe(scrollEvent => {
      let delta = scrollEvent.detail.deltaY;
      if (scrollEvent.detail.currentY === 0 && this.hidden) {
        this.show();
      } else if (!this.hidden && delta > this.triggerDistance) {
        this.hide();
      } else if (this.hidden && delta < -this.triggerDistance) {
        this.show();
      }
    });
  }

}
