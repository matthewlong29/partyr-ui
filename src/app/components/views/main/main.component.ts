import {
  Component,
  OnInit,
  ComponentFactoryResolver,
  ApplicationRef,
  Injector,
  Renderer2,
  ComponentRef,
  EmbeddedViewRef,
  OnDestroy
} from '@angular/core';
import { IOConfig } from 'src/app/classes/models/io-config';
import { ModalService } from 'src/app/services/modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  private modalChildComponentRef: ComponentRef<any>;

  private MODAL_EL_ID = 'modal-container';
  private OVERLAY_EL_ID = 'overlay';

  constructor(
    readonly componentFactorResolver: ComponentFactoryResolver,
    readonly appRef: ApplicationRef,
    readonly injector: Injector,
    readonly renderer: Renderer2,
    readonly modal: ModalService
  ) {}

  openModalSub = new Subscription();
  closeModalSub = new Subscription();

  ngOnInit() {
    this.openModalSub = this.modal.openSignal.subscribe(
      ({
        component,
        childConfig
      }: {
        component: any;
        childConfig?: IOConfig;
      }) => this.openModal(component, childConfig)
    );
    this.closeModalSub = this.modal.closeSignal.subscribe(() =>
      this.closeModal()
    );
  }

  ngOnDestroy() {
    this.openModalSub.unsubscribe();
    this.closeModalSub.unsubscribe();
  }

  private openModal(child: any, childConfig?: IOConfig) {
    const childComponentRef: ComponentRef<
      any
    > = this.componentFactorResolver
      .resolveComponentFactory(child)
      .create(this.injector);
    this.attachConfig(childConfig, childComponentRef);
    this.modalChildComponentRef = childComponentRef;
    this.appRef.attachView(childComponentRef.hostView);
    const childDomElem = (childComponentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
    const modalEl: HTMLElement = document.getElementById(this.MODAL_EL_ID);
    const overlayEl: HTMLElement = document.getElementById(this.OVERLAY_EL_ID);
    this.renderer.appendChild(modalEl, childDomElem);
    this.renderer.removeClass(modalEl, 'hidden');
    this.renderer.removeClass(overlayEl, 'hidden');
  }

  private closeModal(): void {
    this.appRef.detachView(this.modalChildComponentRef.hostView);
    this.modalChildComponentRef.destroy();

    this.renderer.addClass(document.getElementById(this.MODAL_EL_ID), 'hidden');
    this.renderer.addClass(
      document.getElementById(this.OVERLAY_EL_ID),
      'hidden'
    );
  }

  private attachConfig(config: IOConfig, componentRef: any): void {
    config = config || new IOConfig();
    [config.inputs, config.outputs].forEach((decorator: any) => {
      Object.keys(decorator).forEach(
        (prop: string) => (componentRef.instance[prop] = decorator[prop])
      );
    });
  }
}
