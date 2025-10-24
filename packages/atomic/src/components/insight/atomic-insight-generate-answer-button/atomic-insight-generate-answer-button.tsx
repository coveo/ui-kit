import { Component, h, Prop, State } from "@stencil/core";
import {
  InitializableComponent,
  InitializeBindings,
} from "../../../utils/initialization-utils";
import {InsightBindings} from '../../insight/atomic-insight-interface/atomic-insight-interface';
import SparklesIcon from '../../../images/sparkles.svg';
import {IconButton} from '../../common/stencil-iconButton';

/**
 * @internal
 */
@Component({
  tag: "atomic-insight-generate-answer-button",
  styleUrl: "atomic-insight-generate-answer-button.pcss",
  shadow: true,
})
export class AtomicInsightGenerateAnswerButton
  implements InitializableComponent<InsightBindings>
{
  @Prop({ mutable: true }) public tooltip = "Generate Answer";

  @InitializeBindings() public bindings!: InsightBindings;
  @State() public error!: Error;

  private generateAnswer = () => {
    // TODO: Implement answer generation logic
    console.log('Generate answer clicked');
  };

  public render() {
    return (
      <div>Generate Answer Button</div>
      // <div class="generate-answer__container">
      //   <IconButton
      //     partPrefix="generate-answer"
      //     style="outline-primary"
      //     icon={SparklesIcon}
      //     ariaLabel={this.tooltip}
      //     onClick={this.generateAnswer}
      //     title={this.tooltip}
      //   />
      // </div>
    );
  }
}