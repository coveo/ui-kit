import {
  AfterViewInit,
  Component,
  Input,
  NgZone,
  ViewChild,
} from '@angular/core';
import {AtomicText} from '@coveo/atomic-angular';

@Component({
  selector: 'app-field-label',
  templateUrl: './field-label.component.html',
})
export class FieldLabelComponent implements AfterViewInit {
  @ViewChild('atomictext') atomicText?: AtomicText;

  constructor(private z: NgZone) {}

  private val = '';
  @Input()
  get value(): string {
    if (this.atomicText) {
      this.val = this.atomicTextValueAttribute;
    }
    return this.val;
  }
  set value(v: string) {
    this.val = v;
    this.atomicTextValueAttribute = this.val;
  }

  ngAfterViewInit(): void {
    this.atomicTextValueAttribute = this.val;
  }

  private get atomicTextValueAttribute() {
    if (!this.atomicText) {
      return '';
    }
    return this.atomicText['el'].getAttribute('value') as string;
  }

  private set atomicTextValueAttribute(v: string) {
    if (!this.atomicText) {
      return;
    }
    this.z.runOutsideAngular(() => {
      this.atomicText!['el'].setAttribute('value', v);
    });
  }
}
