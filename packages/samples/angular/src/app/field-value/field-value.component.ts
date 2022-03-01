import {
  AfterViewInit,
  Component,
  Input,
  NgZone,
  ViewChild,
} from '@angular/core';
import {AtomicResultText} from '@coveo/atomic-angular';

@Component({
  selector: 'app-field-value',
  templateUrl: './field-value.component.html',
})
export class FieldValueComponent implements AfterViewInit {
  @ViewChild('atomicresulttext') atomicResultText?: AtomicResultText;

  constructor(private z: NgZone) {}

  private val = '';
  @Input()
  get field(): string {
    if (this.atomicResultText) {
      this.val = this.atomicResultTextFieldAttribute;
    }
    return this.val;
  }
  set field(v: string) {
    this.val = v;
    this.atomicResultTextFieldAttribute = this.val;
  }

  ngAfterViewInit(): void {
    this.atomicResultTextFieldAttribute = this.val;
  }

  private get atomicResultTextFieldAttribute() {
    if (!this.atomicResultText) {
      return '';
    }
    return this.atomicResultText['el'].getAttribute('field') as string;
  }

  private set atomicResultTextFieldAttribute(v: string) {
    if (!this.atomicResultText) {
      return;
    }
    this.z.runOutsideAngular(() => {
      this.atomicResultText!['el'].setAttribute('field', v);
    });
  }
}
