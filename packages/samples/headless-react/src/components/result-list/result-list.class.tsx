import {Component} from 'react';
import {
  buildResultList,
  ResultList as ResultListController,
  ResultListState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';

export class ResultList extends Component {
  private readonly controller: ResultListController;
  public state: ResultListState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: {}) {
    super(props);

    this.controller = buildResultList(engine, {
      options: {fieldsToInclude: ['author', 'filetype']},
    });
    this.state = this.controller.state;
  }

  componentDidMount() {
    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  render() {
    if (!this.state.results.length) {
      return <div>No results</div>;
    }

    return (
      <div>
        <ul style={{textAlign: 'left'}}>
          {this.state.results.map((result) => (
            <li key={result.uniqueId}>
              <article>
                <h2>
                  <a href={result.clickUri}>{result.title}</a>
                </h2>
                <table>
                  <tbody>
                    {result.raw.author && (
                      <tr>
                        <th>Author</th>
                        <td>{result.raw.author as string}</td>
                      </tr>
                    )}
                    {result.raw.filetype && (
                      <tr>
                        <th>File type</th>
                        <td>{result.raw.filetype}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <p>{result.excerpt}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
